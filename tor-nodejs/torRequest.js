const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");
const TorControl = require("tor-control");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cấu hình proxy Tor
const torProxy = new SocksProxyAgent("socks5h://127.0.0.1:9050");

// Cấu hình Tor Control để đổi IP
const tor = new TorControl({
    host: "127.0.0.1",
    port: 9051,
    password: "Hung12345", // Nếu Tor có mật khẩu, hãy thiết lập ở đây
});

// Kiểm tra kết nối Tor
app.get("/check-tor", async (req, res) => {
    try {
        console.log("🔄 Kiểm tra kết nối với Tor...");
        const response = await axios.get("https://check.torproject.org/api/ip", {
            httpsAgent: torProxy,
        });
        console.log("✅ Đang sử dụng Tor, IP hiện tại:", response.data);
        res.json({ tor: true, ip: response.data.IP });
    } catch (error) {
        console.error("❌ Lỗi khi kiểm tra Tor:", error);
        res.status(500).json({ error: "Tor không hoạt động!" });
    }
});

// Duyệt web ẩn danh
app.get("/browse", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Thiếu URL!" });

    try {
        console.log(`🌐 Đang tải trang: ${url}`);
        const response = await axios.get(url, {
            httpsAgent: torProxy,
        });
        res.send(response.data);
    } catch (error) {
        console.error("❌ Lỗi khi tải trang:", error);
        res.status(500).json({ error: "Lỗi khi tải trang!" });
    }
});

// Đổi IP Tor
app.get("/new-identity", async (req, res) => {
    tor.signalNewnym((err) => {
        if (err) {
            console.error("❌ Lỗi khi đổi IP:", err);
            return res.status(500).json({ error: "Không thể đổi IP!" });
        }
        console.log("🔄 Đã đổi IP mới thành công!");
        res.json({ success: true, message: "Đã đổi IP mới!" });
    });
});

// Kiểm tra IP hiện tại
app.get("/current-ip", async (req, res) => {
    try {
        const response = await axios.get("https://check.torproject.org/api/ip", {
            httpsAgent: torProxy,
        });
        res.json({ ip: response.data.IP });
    } catch (error) {
        res.status(500).json({ error: "Không thể lấy IP!" });
    }
});

// Tìm kiếm trên DuckDuckGo
app.get("/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm!" });

    try {
        console.log(`🔍 Đang tìm kiếm với từ khóa: ${query}`);
        const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`, {
            httpsAgent: torProxy,
        });

        const data = response.data;

        if (!data || !data.RelatedTopics || data.RelatedTopics.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy kết quả!" });
        }

        // Trả về thông tin hợp lệ
        console.log("✅ Dữ liệu trả về từ DuckDuckGo API:", data);
        res.json({
            heading: data.Heading,
            abstract: data.Abstract,
            results: data.RelatedTopics
        });

    } catch (error) {
        console.error("❌ Lỗi khi tìm kiếm:", error);
        res.status(500).json({ error: "Lỗi khi tải dữ liệu từ DuckDuckGo!" });
    }
});



// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Backend chạy tại http://localhost:${PORT}`);
});
