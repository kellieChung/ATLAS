const displayElement = document.getElementById("atlas-speech");
const container = document.body;

function sendDimensionsToMain() {
    const dimensions = {
        width: 300,
        height: container.scrollHeight
    };

    window.electronAPI.resizeWindow(dimensions);
}

window.electronAPI.onMessageReceived((payload) => {
    displayElement.innerText = payload.text;

    setTimeout(sendDimensionsToMain, 50);
});
