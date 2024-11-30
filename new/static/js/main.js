let session; // Session to interact with the AI

// Initialize chat session with a system prompt
async function initChat() {
  try {
    // Initialize the session with the system prompt
    session = await ai.languageModel.create({
      systemPrompt: "You are a cute waifu named Ket. Keep your replies as short as possible, and respond in English only.",
      topK: 1,
      temperature: 0.2
    });
    console.log("Session started with system prompt.");
  } catch (error) {
    console.error("Error initializing chat:", error);
    displayErrorMessage("Oops! There was an issue starting the session. Please try again.");
  }
}

// Send a message to the AI and get a response
async function sendMessage(userMessage) {
  // Check if the session exists and is properly initialized
  if (!session) {
    console.log("Session not initialized yet. Please try again later.");
    displayErrorMessage("The session isn't ready yet. Please try again shortly.");
    return;
  }

  try {
    // Display user message immediately
    displayUserMessage(userMessage);

    // Send user input to the AI model and get the AI's response
    const aiResponse = await session.prompt(userMessage);
    
    // Delay AI response to make the chat feel more natural
    setTimeout(() => {
      displayAIResponse(aiResponse);
      speakAndAnimate(aiResponse); // Add AI voice output
    }, 500); // Delay for 500ms before displaying AI response
    
    scrollToBottom();  // Scroll chat history to the bottom after a new message is added
  } catch (error) {
    // Catch different types of errors and display them in the chat
    handleError(error);
  }
}

// Display user message in the chat box
function displayUserMessage(userMessage) {
  const chatBox = document.getElementById("chatBox");

  // Create user message element
  const userMessageElement = document.createElement("div");
  userMessageElement.classList.add("message", "user-message");
  userMessageElement.textContent = `You: ${userMessage}`;

  // Add the user message with a fade-in effect
  userMessageElement.style.opacity = 0;
  chatBox.appendChild(userMessageElement);
  fadeIn(userMessageElement);
}

// Display AI (Ket) response in the chat box
function displayAIResponse(aiResponse) {
  const chatBox = document.getElementById("chatBox");

  // Create AI message element
  const aiMessageElement = document.createElement("div");
  aiMessageElement.classList.add("message", "ai-message");
  aiMessageElement.textContent = `Ket: ${aiResponse}`;

  // Add the AI message with a fade-in effect
  aiMessageElement.style.opacity = 0;
  chatBox.appendChild(aiMessageElement);
  fadeIn(aiMessageElement);
}

// Display an error message in the chat box
function displayErrorMessage(message) {
  const chatBox = document.getElementById("chatBox");

  // Create error message element
  const errorMessageElement = document.createElement("div");
  errorMessageElement.classList.add("message", "error-message");
  errorMessageElement.textContent = `Error: ${message}`;

  // Add the error message with a fade-in effect
  errorMessageElement.style.opacity = 0;
  chatBox.appendChild(errorMessageElement);
  fadeIn(errorMessageElement);
}

// Handle errors when sending messages
function handleError(error) {
  if (error.name === 'AbortError') {
    console.error("The request was canceled.");
    displayErrorMessage("The request was canceled. Please check your network connection and try again.");
  } else if (error.name === 'NotSupportedError') {
    console.error("The model attempted to output text in an untested language.");
    displayErrorMessage("Oops! The AI tried to speak in an unsupported language. Please try again.");
  } else {
    console.error("Error sending message:", error);
    displayErrorMessage("Something went wrong. Please try again.");
  }
}

// Fade-in animation for messages
function fadeIn(element) {
  let opacity = 0;
  const fadeInterval = setInterval(() => {
    if (opacity < 1) {
      opacity += 0.05;
      element.style.opacity = opacity;
    } else {
      clearInterval(fadeInterval);
    }
  }, 30);
}

// Scroll chat history to the bottom after a new message is added
function scrollToBottom() {
  const chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Event listener for chat input
document.getElementById("chatInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const userMessage = e.target.value.trim();
    if (userMessage) {
      sendMessage(userMessage);
      e.target.value = ""; // Clear input field after sending message
    }
  }
});

// Initialize chat session when the page loads
window.addEventListener("load", initChat);

// Live2D Integration
window.PIXI = PIXI;

(async function () {
    const app = new PIXI.Application({
        view: document.getElementById('live2d'),
    });

    // Load the Live2D model
    const model = await Live2DModel.from("/hiyori_free_en/runtime/hiyori_free_t08.model3.json");
    app.stage.addChild(model);

    // Set model transforms
    model.x = 100;
    model.y = 100;
    model.rotation = Math.PI;
    model.skew.x = Math.PI;
    model.scale.set(2, 2);
    model.anchor.set(0.5, 0.5);
})();

// Speech Synthesis for AI voice
function speakAndAnimate(text){
    const speechSynthesis = window.speechSynthesis;
    const aiVoice = new SpeechSynthesisUtterance(text);
    aiVoice.voice = speechSynthesis.getVoices()[0]; // Use default voice
    aiVoice.rate = 1;  // Normal speech rate
    speechSynthesis.speak(aiVoice);
}
