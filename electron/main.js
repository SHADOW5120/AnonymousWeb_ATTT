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

    // Tạo BrowserView để hiển thị trang web
    view = new BrowserView();
    mainWindow.setBrowserView(view);
    view.setBounds({ x: 0, y: 50, width: 1200, height: 750 });

    // 🔥 Cấu hình Electron sử dụng proxy Tor
    await session.defaultSession.setProxy({
        proxyRules: "socks5://127.0.0.1:9050",
    });

    // Kiểm tra xem có đang chạy qua Tor không
    axios.get("http://localhost:5000/check-tor")
        .then(response => {
            console.log("Tor IP:", response.data.ip);
        })
        .catch(error => {
            console.error("Lỗi kết nối Tor:", error);
        });

    // Tải trang kiểm tra Tor
    view.webContents.loadURL("https://check.torproject.org");
});

// IPC nhận URL từ frontend và duyệt web qua backend
ipcMain.handle("browse-url", async (event, url) => {
    try {
        const response = await axios.get(`http://localhost:5000/browse?url=${encodeURIComponent(url)}`);
        view.webContents.loadURL(url);
        return "Đã tải trang qua Tor";
    } catch (error) {
        return "Lỗi khi tải trang!";
    }
});

// IPC đổi IP Tor
ipcMain.handle("new-identity", async () => {
    try {
        const response = await axios.get("http://localhost:5000/new-identity");
        return response.data.message;
    } catch (error) {
        return "Lỗi khi đổi IP!";
    }
});
