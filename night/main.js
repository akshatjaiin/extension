let session; // Session to interact with the AI
const model_bg = './newBg.jpg';

// Initialize chat session with a system prompt
async function initChat() {
  try {
    // Initialize the session with the system prompt
    session = await ai.languageModel.create({
      systemPrompt: "You are a cute waifu named Ket. Keep your replies as short as possible, and respond in English only.",
      topK: 1,
      temperature: 0.2
    });
    displayErrorMessage("ket: welcome to gemini nano ");
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
      speakAndAnimate(aiResponse); // Add AI voice output and animate mouth
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
  }, 90);
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

const url = 'https://raw.githubusercontent.com/guansss/pixi-live2d-display/master/test/assets/shizuku/shizuku.model.json';

const app = new PIXI.Application({
  view: document.getElementById('canvas'),
  autoStart: true,
  // resizeTo: window
});

let mouthValue = 0;
let isSpeaking = false;

app.ticker.add(() => {
  // Simulate the mouth opening based on speech
  if (isSpeaking) {
    // Mouth is open during speaking
    mouthValue = Math.sin(performance.now() / 200) / 2 + 0.5;
  } else {
    // Mouth is closed when not speaking
    mouthValue = 0;
  }
});


PIXI.live2d.Live2DModel.fromModelSettingsFile(url).then(model => {

  const backgroundContainer = new PIXI.Container();
  backgroundContainer.position.set(0, 0)
  backgroundContainer.scale.set(1.5, 1.9)
  app.stage.addChild(backgroundContainer);
  app.stage.addChild(model);

  const backgroundImage = PIXI.Texture.from(model_bg);
  const backgroundSprite = new PIXI.Sprite(backgroundImage);
  backgroundContainer.addChild(backgroundSprite);

  model.anchor.set(1.0, 0.7);
  model.position.set(window.innerWidth / 2, window.innerHeight / 2);

  // const size = Math.min(window.innerWidth, window.innerHeight) * 0.5;
  model.scale.set(0.4, 0.4)
  // model.width = size;
  // model.height = size;

  const updateFn = model.internal.motionManager.update;

  model.internal.motionManager.update = () => {
    updateFn.call(model.internal.motionManager);
    console.log(mouthValue)
    // Overwrite the parameter after calling the original update function
    model.internal.coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthValue);
    model.internal.coreModel.setParamFloat('PARAM_MOUTH_OPEN_X', 1);
  };
});

// Speech synthesis for AI voice
function speakAndAnimate(text) {
  const speechSynthesis = window.speechSynthesis;
  const aiVoice = new SpeechSynthesisUtterance(text);
  aiVoice.voice = speechSynthesis.getVoices()[0]; // Use default voice
  aiVoice.rate = 1;  // Normal speech rate

  // Event listener for when speech starts
  aiVoice.onstart = () => {
    console.log("Speech started");
    isSpeaking = true;  // Mouth open when speaking
  };

  // Event listener for each boundary (when a word or phoneme boundary is reached)
  aiVoice.onboundary = (event) => {
    console.log(`Boundary reached at character: ${event.charIndex}`);
    isSpeaking = true;  // Keep the mouth open while speaking
  };

  // Event listener for when speech ends
  aiVoice.onend = () => {
    console.log("Speech ended");
    isSpeaking = false;  // Close mouth after speech ends
  };

  // Begin speaking the text
  speechSynthesis.speak(aiVoice);
}
