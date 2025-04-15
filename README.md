Dưới đây là file `README.md` được viết lại cho dự án **Anonymous Web with Tor** của bạn:

```markdown
# Anonymous Web with Tor  

This project is an **anonymous web browser** built using **Electron.js** for the frontend and **Node.js** for the backend. It operates through the **Tor network**, allowing users to browse the web privately with features like IP masking, no history storage, and automatic IP rotation.  

---

## Features  

✅ **Anonymous Browsing**: Browse the web securely via the Tor network.  
✅ **IP Masking**: Hides your real IP by routing traffic through Tor.  
✅ **No History Storage**: No browsing data is saved, remove all history manually.  
✅ **Session-based IP Rotation**: Change IP manually by pressing the button.  
✅ **Keyword Search**: Perform anonymous searches via DuckDuckGo.  
✅ **Real-time IP Display**: Shows the current Tor exit node.  
✅ **Custom Proxy Setup**: All requests are routed through the Tor SOCKS5 proxy.  

---

## Technology Stack  

### **Backend (Node.js)**  
- **Express.js** - API handling  
- **Tor-Control** - Manage Tor circuits & change IPs  
- **Socks Proxy Agent** - Routes requests through the Tor proxy  

### **Frontend (Electron.js)**  
- **Electron BrowserView** - Displays web content  
- **IPC Communication** - Handles user interactions  
- **Tor Proxy Integration** - Ensures anonymity  

---

## **Prerequisites**  

Make sure you have the following installed:  

- **Node.js** (>= v18.x.x)  
- **npm** (>= v9.x.x)  
- **Tor** (installed & running)  

### **Tor Setup**  

1️⃣ Open your `torrc` file and enable control features:  

```
ControlPort 9051
HashedControlPassword 16:<hashed-password>
SOCKSPort 9050
```

2️⃣ Generate a hashed password for Tor:  

```bash
tor --hash-password your-password
```

3️⃣ Add the output to your `torrc` file, then restart Tor:  

```bash
sudo systemctl restart tor
```

---

## **Installation**  

Clone the repository and install dependencies:  

```bash
git clone https://github.com/SHADOW5120/AnonymousWeb_ATTT.git
cd AnonymousWeb_ATTT
```

### **Backend Setup**  

```bash
cd tor-nodejs
npm install
node torRequest.js
```

### **Frontend Setup**  

```bash
cd ../electron
npm install
npm start
```

---

## **Configuration**  

### **Backend (`tor-nodejs/torRequest.js`)**  

Update the **Tor control settings**:  

```javascript
const torControl = new TorControl({
  password: 'your-tor-password',
  host: '127.0.0.1',
  port: 9051,
});
```

Make sure Tor is running on **port 9050 (SOCKS5)** and **9051 (ControlPort)**.

---

## **Usage**  

1️⃣ **Start the Tor service**:  

```bash
tor
```

2️⃣ **Run the backend**:  

```bash
cd tor-nodejs
node torRequest.js
```

3️⃣ **Run the Electron app**:  

```bash
cd electron
npm start
```

4️⃣ **Use the browser interface** to access anonymous web browsing.

---

## **Security Considerations**  

⚠️ **Never expose your real IP** when browsing sensitive websites.  
⚠️ **Only use Tor-proxied requests** to avoid leaks.  
⚠️ **Keep Tor updated** for maximum security.  
⚠️ **Do not use personal accounts** when browsing anonymously.  

---

## **Troubleshooting**  

💡 **Tor is not running?**  
→ Make sure Tor is installed and running on your system.  

💡 **Cannot change IP?**  
→ Ensure the **ControlPort password** is correctly configured.  

💡 **CORS errors in the backend?**  
→ Verify that `cors` middleware is set up properly.  

---

## **License**  

📜 This project is licensed under the **MIT License**.  

---

## **Contributing**  

🚀 Feel free to fork the repo and contribute! Submit a **pull request** if you make improvements.  

---

## **Acknowledgments**  

🔗 **Tor Project** (https://www.torproject.org/)  
🔗 **Electron.js** (https://www.electronjs.org/)  
🔗 **DuckDuckGo** (https://duckduckgo.com/)  
