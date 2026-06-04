const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  onMessageReceived: (callback) => ipcRenderer.on("atlas-message", (event, text) => callback(text))
});