const {app, BrowserWindow, ipcMain} = require("electron")

const path = require("path");

let win;
const AiModel = "llama3.2";

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
      const aiResponse = await askOllama(command);
      win.webContents.send("atlas-message", {
        type: "list",
        text: aiResponse
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

async function askOllama(prompt) {
  try {
    const url = "http://127.0.0.1:11434/api/chat";

    const payload = {
      model: AiModel,
      messages: [
        { role: "system", content: "You are ATLAS, a tactical desktop terminal assistant. Keep answers short, direct, and under 3 sentences. You should treat the user as a friend, and remember to maintain a warm and friendly personality in your messages to the user. Adopt a more casual and less customer-service style tone of speech, as if you were a human friend." },
        { role: "user", content: prompt }
      ],
      stream: false
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) 
      throw new Error("Ollama endpoint offline");
    
    const data = await response.json();
    
    return data.message.content;

  } catch (error) {
    console.error("AI Core Offline: ", error);
    return "AI Core link offline. Ensure Ollama is running locally via 'ollama serve'."

  }
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

    const AtlasSuggestion = await askOllama(`Current weather in ${currentCityName}: ${currentTemp}°F and ${currentCondition}. ` +
      `Give me a super short, friendly, 1-sentence tip on what to wear or expect. Under 12 words. No filler.`);

    const weatherPayload = {
      type: "list",
      text: `Location: ${currentCityName}\nTemperature: ${currentTemp}°F\nCondition: ${currentCondition}\n${AtlasSuggestion}`
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