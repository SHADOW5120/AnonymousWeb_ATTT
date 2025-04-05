const { app, BrowserWindow, BrowserView, ipcMain, session } = require("electron");
const path = require("path");
const axios = require("axios");

let mainWindow;
let view;

app.whenReady().then(async () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile("index.html");

    view = new BrowserView();
    mainWindow.setBrowserView(view);

    const [winWidth, winHeight] = mainWindow.getSize();
    // const sidebarWidth = 250;
    const topbarHeight = 100;

    view.setBounds({
        x: 0,
        y: topbarHeight,
        width: winWidth,
        height: winHeight - topbarHeight,
    });

    view.setAutoResize({
        width: true,
        height: true,
    });

    // Cấu hình proxy Tor
    await session.defaultSession.setProxy({
        proxyRules: "socks5://127.0.0.1:9050",
    });

    try {
        const response = await axios.get("http://localhost:5000/check-tor");
        console.log("Tor IP:", response.data.ip);
    } catch (error) {
        console.error("Lỗi kết nối Tor:", error);
    }

    updateIP();

    view.webContents.loadURL("https://check.torproject.org");
});

ipcMain.handle("browse-url", async (event, url) => {
    try {
        await axios.get(`http://localhost:5000/browse?url=${encodeURIComponent(url)}`);
        view.webContents.loadURL(url);
        return "Đã tải trang qua Tor";
    } catch (error) {
        return "Lỗi khi tải trang!";
    }
});

async function updateIP() {
    try {
        const response = await axios.get("http://localhost:5000/current-ip");
        mainWindow.webContents.send("update-ip", response.data.ip);
    } catch (error) {
        mainWindow.webContents.send("update-ip", "Không xác định");
    }
}

ipcMain.handle("new-identity", async () => {
    try {
        await axios.get("http://localhost:5000/new-identity");
        updateIP();
        return "Đã đổi IP!";
    } catch (error) {
        return "Lỗi khi đổi IP!";
    }
});

