const {app, BrowserWindow, ipcMain} = require("electron")

const path = require("path");

let win;

const createWindow = () => {
  win = new BrowserWindow({
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

  ipcMain.on("user-command", async (event, command) => {
    if (command === "weather") {
      await checkWeather();
    }
    else if (command === "home") {
      win.webContents.send("atlas-message", {
        type: "text",
        text: "Welcome home! Type \"weather\" to check the local forecast."
      });
    }
    else {
      win.webContents.send("atlas-message", {
        type: "alert",
        text: `UNKNOWN CODE: "${command}"\nAccess denied. Try typing "weather".`
      });
    }
  })

  ipcMain.on("resize-window", (event, {width, height}) => {
    if (win) {
      const safeHeight = height && height > 50? Math.ceil(height) + 4: 120;
      win.setBounds({
        width: width, 
        height: safeHeight
      });
    };
  });

  win.loadFile(path.join(__dirname, "src/html/index.html"));
  win.show()
}

async function checkWeather() {
  try {
    const geoResponse = await fetch("http://ip-api.com/json/");
    if (!geoResponse.ok) throw new Error('Failed to fetch geolocation data');

    const geoData = await geoResponse.json();
    const userZip = geoData.zip;
    const userLocation = userZip || "10001"; // Default to New York if zip code is unavailable

    const weatherResponse = await fetch(`https://wttr.in/${userLocation}?format=j1`);
    if (!weatherResponse.ok) throw new Error('Failed to fetch weather telemetry');

    const weatherData = await weatherResponse.json();

    const currentTemp = weatherData.current_condition[0].temp_F;
    const currentCondition = weatherData.current_condition[0].weatherDesc[0].value;

    const currentCityName = geoData.city || "Unknown Location";

    const weatherPayload = {
      type: "list",
      text: `Location: ${currentCityName}\nTemperature: ${currentTemp}°F\nCondition: ${currentCondition}`
    };

    win.webContents.send("atlas-message", weatherPayload);

  } catch (error) {
      console.error("Telemetry link offline:", error);
      win.webContents.send('atlas-message', { type: "alert", text: "Unable to secure local weather telemetry." });
  }
}

app.whenReady().then(() => {
   createWindow()
});