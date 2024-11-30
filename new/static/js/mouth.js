// Assuming the Live2D model is already loaded and accessible
const live2dModel = window.live2d; // Adjust based on your actual model reference

// Function to update mouth movement based on input text
function updateMouthMovement(inputText) {
    const mouthOpenParam = "ParamMouthOpenY"; // Parameter ID for mouth open/close
    const mouthFormParam = "ParamMouthForm";   // Parameter ID for mouth shape

    // Calculate the mouth opening based on text length
    const openAmount = Math.min(1.0, inputText.length / 10); // Scale based on input length
    live2dModel.multParamFloat(mouthOpenParam, openAmount); // Use multParamFloat instead

    // Optionally adjust mouth form based on input (e.g., smiling or neutral)
    if (inputText.includes("happy") || inputText.includes("smile")) {
        live2dModel.setParamFloat(mouthFormParam, 1.0); // Smiling
    } else if (inputText.includes("sad") || inputText.includes("frown")) {
        live2dModel.setParamFloat(mouthFormParam, -1.0); // Frowning
    } else {
        live2dModel.setParamFloat(mouthFormParam, 0.0); // Neutral
    }
}

// Event listener for chat input
document.getElementById("chatInput").addEventListener("input", (event) => {
    const userInput = event.target.value;
    updateMouthMovement(userInput);
});