const { app, BrowserWindow, BrowserView, ipcMain, session } = require("electron");
const path = require("path");
const axios = require("axios");
const { ElectronBlocker } = require("@ghostery/adblocker-electron");
const fetch = require("cross-fetch");

// Tăng giới hạn listener
require("events").defaultMaxListeners = 50;
ipcMain.setMaxListeners(50);

let mainWindow;
let view;

// Tạo cửa sổ chính và trình duyệt ẩn danh
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

    // Tạo BrowserView
    view = new BrowserView();
    mainWindow.setBrowserView(view);
    view.setAutoResize({ width: true, height: true });
    setBrowserViewBounds();

    // Proxy Tor
    await session.defaultSession.setProxy({ proxyRules: "socks5://127.0.0.1:9050" });

    // Chặn quảng cáo
    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
    blocker.enableBlockingInSession(session.defaultSession);

    // Kiểm tra IP ban đầu
    checkInitialIP();
    updateIP();

    // Tải trang Tor kiểm tra
    view.webContents.loadURL("https://check.torproject.org");

    // Gỡ quảng cáo và popups sau khi tải trang
    view.webContents.on("did-finish-load", async () => {
        await removeAdsAndPopups();
    });
});

// Đặt kích thước cho VieW
function setBrowserViewBounds() {
    const [width, height] = mainWindow.getSize();
    const topbarHeight = 100;
    view.setBounds({
        x: 0,
        y: topbarHeight,
        width,
        height: height - topbarHeight,
    });
}

// Gỡ quảng cáo và POPUPS trong DOM
async function removeAdsAndPopups() {
    try {
        await view.webContents.executeJavaScript(`
            const removeAds = () => {
                document.querySelectorAll("iframe, .adsbygoogle, .ad-banner, [id^='ad'], [class*='ads'], .popup, .banner, .advertisement, .ad-container, .ad-wrapper, [data-ad]").forEach(el => el.remove());
                window.open = () => null;
                console.log("Đã gỡ quảng cáo DOM!");
            };
            removeAds();
            setInterval(removeAds, 1000);
        `);
    } catch (error) {
        console.error("Nothing here happened!", error.message);
    }
}

// Cập nhật IP mới
async function updateIP() {
    try {
        const res = await axios.get("http://localhost:5000/current-ip");
        mainWindow.webContents.send("update-ip", res.data.ip);
    } catch (err) {
        mainWindow.webContents.send("update-ip", "Non identified");
    }
}

// Kiểm tra IP ban đầu
async function checkInitialIP() {
    try {
        const res = await axios.get("http://localhost:5000/check-tor");
        console.log("Tor IP:", res.data.ip);
    } catch (err) {
        console.error("Không thể kết nối đến dịch vụ Tor:", err.message);
    }
}

// IPC HANDLERS
ipcMain.handle("browse-url", async (_event, url) => {
    try {
        await axios.get(`http://localhost:5000/browse?url=${encodeURIComponent(url)}`);
        view.webContents.loadURL(url);
        return "Đã tải trang qua Tor";
    } catch {
        return "Lỗi khi tải trang!";
    }
});

// Đổi IP
ipcMain.handle("new-identity", async () => {
    try {
        await axios.get("http://localhost:5000/new-identity");
        updateIP();
        return "Đã yêu cầu đổi IP thành công!";
    } catch {
        return "Không thể đổi IP!";
    }
});

// Lấy cookies
ipcMain.handle("get-cookies", async () => {
    return await session.defaultSession.cookies.get({});
});

// Lấy dữ liệu từ storage
ipcMain.handle("check-storage", async () => {
    const cookies = await session.defaultSession.cookies.get({});
    return {
        cookies,
        localStorageNote: "LocalStorage chỉ truy cập được từ renderer process.",
        cacheNote: "Cache tồn tại nhưng không thể liệt kê trực tiếp tại đây.",
    };
});

// Xóa tất cả dữ liệu
ipcMain.handle("clear-all", async () => {
    const currentSession = session.defaultSession;

    await currentSession.clearStorageData();

    if (view?.webContents) {
        await view.webContents.executeJavaScript(`
            localStorage.clear();
            sessionStorage.clear();
            console.log("Đã xoá localStorage & sessionStorage!");
        `);
    }

    return "Đã xoá toàn bộ dữ liệu trình duyệt!";
});
