const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    browseUrl: (url) => ipcRenderer.invoke("browse-url", url),
    newIdentity: () => ipcRenderer.invoke("new-identity"),
    onIPUpdate: (callback) => ipcRenderer.on("update-ip", callback),
    checkStorage: () => ipcRenderer.invoke('check-storage'),
    clearAll: () => ipcRenderer.invoke("clear-all"),
});
