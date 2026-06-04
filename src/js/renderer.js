const speechElement = document.getElementById("atlas-speech");

window.electronAPI.onMessageReceived((text) => {
    speechElement.innerText = text;
});