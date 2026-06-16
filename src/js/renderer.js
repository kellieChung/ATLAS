const displayElement = document.getElementById("atlas-speech");
const inputElement = document.getElementById("user-input");

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

inputElement.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        const command = inputElement.value.trim().toLowerCase();

        if (command != "") {
            displayElement.innerText = "Processing...";
            
            window.electronAPI.sendCommand(command);

            inputElement.value = "";
        }
    }
})