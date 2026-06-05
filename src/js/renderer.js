const displayElement = document.getElementById("atlas-speech");

window.electronAPI.onMessageReceived((payload) => {
    displayElement.innerText = payload.text;
});