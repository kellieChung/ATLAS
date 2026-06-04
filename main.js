const {app, BrowserWindow} = require("electron")

const path = require("path");


const createWindow = () => {
  const win = new BrowserWindow({
    width: 300,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  })

  win.loadFile("src/html/index.html")
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("atlas-message", "System Initialization Complete. Welcome to ATLAS.")
  })
  win.show()
}

app.whenReady().then(() => {
   createWindow()
});