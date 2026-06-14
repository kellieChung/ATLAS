const {contextBridge, ipcRenderer} = require("electron")



contextBridge.exposeInMainWorld("electronAPI", {
  resizeWindow: (size) => ipcRenderer.send('resize-window', size),
  onMessageReceived: (callback) => ipcRenderer.on("atlas-message", (event, text) => callback(text))
});