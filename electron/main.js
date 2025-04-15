const { app, BrowserWindow, BrowserView, ipcMain, session } = require("electron");
const path = require("path");
const axios = require("axios");

let mainWindow;
let view;

// ======== TẠO CỬA SỔ CHÍNH & BROWSER VIEW =========
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

    // Khởi tạo BrowserView
    view = new BrowserView();
    mainWindow.setBrowserView(view);

    setBrowserViewBounds();

    view.setAutoResize({ width: true, height: true });

    // Cấu hình proxy qua Tor (SOCKS5)
    await session.defaultSession.setProxy({ proxyRules: "socks5://127.0.0.1:9050" });

    // Kiểm tra IP ban đầu
    try {
        const res = await axios.get("http://localhost:5000/check-tor");
        console.log("Tor IP:", res.data.ip);
    } catch (err) {
        console.error("Không thể kết nối đến dịch vụ Tor:", err.message);
    }

    updateIP();

    // Tải trang kiểm tra Tor
    view.webContents.loadURL("https://check.torproject.org");
});

// ======== ĐẶT KÍCH THƯỚC CHO VIEW =========
function setBrowserViewBounds() {
    const [winWidth, winHeight] = mainWindow.getSize();
    const topbarHeight = 100;

    view.setBounds({
        x: 0,
        y: topbarHeight,
        width: winWidth,
        height: winHeight - topbarHeight,
    });
}

// ======== CẬP NHẬT IP HIỆN TẠI TỪ BACKEND =========
async function updateIP() {
    try {
        const res = await axios.get("http://localhost:5000/current-ip");
        mainWindow.webContents.send("update-ip", res.data.ip);
    } catch (err) {
        mainWindow.webContents.send("update-ip", "Không xác định");
    }
}

// ======== IPC HANDLERS =========

// Tải URL qua Tor
ipcMain.handle("browse-url", async (_event, url) => {
    try {
        await axios.get(`http://localhost:5000/browse?url=${encodeURIComponent(url)}`);
        view.webContents.loadURL(url);
        return "Đã tải trang qua Tor";
    } catch (err) {
        return "Lỗi khi tải trang!";
    }
});

// Đổi IP (New Identity)
ipcMain.handle("new-identity", async () => {
    try {
        await axios.get("http://localhost:5000/new-identity");
        updateIP();
        return "Đã yêu cầu đổi IP thành công!";
    } catch (err) {
        return "Không thể đổi IP!";
    }
});

// Trả về danh sách cookie hiện tại
ipcMain.handle("get-cookies", async () => {
    const cookies = await session.defaultSession.cookies.get({});
    return cookies;
});

// Kiểm tra lưu trữ cục bộ
ipcMain.handle("check-storage", async () => {
    const cookies = await session.defaultSession.cookies.get({});
    return {
        cookies,
        localStorageNote: "LocalStorage chỉ truy cập được từ renderer process.",
        cacheNote: "Cache tồn tại nhưng không thể liệt kê trực tiếp tại đây.",
    };
});

ipcMain.handle("clear-all", async () => {
    const currentSession = session.defaultSession;

    // 1. Xóa toàn bộ dữ liệu: cookies, cache, local storage, v.v.
    await currentSession.clearStorageData(); 

    // 2. Dọn localStorage & sessionStorage của trang hiện tại trong BrowserView
    if (view && view.webContents) {
        await view.webContents.executeJavaScript(`
            localStorage.clear();
            sessionStorage.clear();
            console.log("Đã xoá localStorage & sessionStorage!");
        `);
    }

    return "Đã xoá toàn bộ dữ liệu trình duyệt!";
});
