// models details
const Model_url = 'https://raw.githubusercontent.com/guansss/pixi-live2d-display/master/test/assets/shizuku/shizuku.model.json';
const Model_bg = "./newBg.jpg"

//creating a canvas
const canvas = document.createElement("canvas");
canvas.style.width = "100vw";
canvas.style.height = "90vh";
canvas.style.background = "red"
document.body.appendChild(canvas);

// load the applications
const app = new PIXI.Application({
  view: canvas,
  autoStart: true,
});

// for mouth movements
let mouthValue = 0;
let isSpeaking = false;

// the mouth movements 
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

// load the wifu model
PIXI.live2d.Live2DModel.fromModelSettingsFile(Model_url).then(model => {
  // model background setup
  const backgroundContainer = new PIXI.Container();
  backgroundContainer.position.set(0, 0)
  backgroundContainer.scale.set(1.5, 1.9)
  // append the background 
  app.stage.addChild(backgroundContainer);
  // append the modle to the canvas
  app.stage.addChild(model);

  // set the background image
  const backgroundImage = PIXI.Texture.from(Model_bg);
  const backgroundSprite = new PIXI.Sprite(backgroundImage);
  backgroundContainer.addChild(backgroundSprite);

  // seting up the size and postion of the model
  model.anchor.set(0.25, 0.7);
  model.position.set(window.innerWidth / 2, window.innerHeight / 2);
  model.scale.set(0.4, 0.4)

  // a fn to call when updating model motion
  // this function is required bcz it responsible for update the model metadata 
  const updateFn = model.internal.motionManager.update;

  // the update loop of the model where we have to update all those stuff
  model.internal.motionManager.update = () => {
    updateFn.call(model.internal.motionManager);
    if (!isSpeaking) return;
    console.log("Words")
    // Overwrite the parameter after calling the original update function
    model.internal.coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthValue);
    model.internal.coreModel.setParamFloat('PARAM_MOUTH_OPEN_X', 1);
  };
});

function speakAndAnimate(text) {
  const speechSynthesis = window.speechSynthesis;
  const aiVoice = new SpeechSynthesisUtterance(text);
  aiVoice.voice = speechSynthesis.getVoices()[0]; // Use default voice
  aiVoice.rate = 1;  // Normal speech rate

  aiVoice.onstart = () => {
    console.log("Speech started");
    isSpeaking = true;
  };

  aiVoice.onboundary = (event) => {
    console.log(`Boundary reached at character: ${event.charIndex}`);
    isSpeaking = true;  // Keep the mouth open while speaking
  };

  aiVoice.onend = () => {
    console.log("Speech ended");
    isSpeaking = false;  // Close mouth after speech ends
  };

  speechSynthesis.speak(aiVoice);
}
