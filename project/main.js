import { Application } from "@pixi/app";
import { extensions, Renderer } from "@pixi/core";
import { Ticker, TickerPlugin } from "@pixi/ticker";
import { InteractionManager } from "@pixi/interaction";
import { Live2DModel, MotionPreloadStrategy } from "pixi-live2d-display";

Live2DModel.registerTicker(Ticker);
Application.registerPlugin(TickerPlugin)
// Application.registerPlugin(TickerPlugin);
// Renderer.registerPlugin('interaction', InteractionManager);
extensions.add(InteractionManager)

const canvas = document.getElementById('canvas');
const app = new Application({
  backgroundAlpha: 0,
  view: canvas,
});

const model = await Live2DModel.from('/model/shizuku.model.json', {
  autoInteract: false,
  motionPreload: MotionPreloadStrategy.IDLE
});

app.stage.addChild(model);

let mousestate = false;
// if u point u r mouse down
canvas.addEventListener('pointerdown', (event) => model.tap(event.clientX, event.clientY));

// if u enter u r mouse into browser window
canvas.addEventListener('pointerenter', () => (mousestate = true));

// if u make u r mouse leave
canvas.addEventListener('pointerleave', () => {
  model.internalModel.focusController.focus(0, 0);
  mousestate = false;
});

// if mouse move
canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
  if (mousestate) model.focus(clientX, clientY);
});

// on hiting the model
model.on('hit', (hitAreas) => {
  // if its head it will shake it
  if (hitAreas.includes('head')) model.motion('shake', 1);
  // if it heat to body it will shy
  if (hitAreas.includes('body')) model.motion('tap_body', 1);
});

// some actions
const motions = {
  talk: [
    ['tap_body', 0],
    ['tap_body', 2],
    ['pinch_out', 0],
    ['flick_head', 1],
    ['flick_head', 2],
  ],
  cheer: [
    ['tap_body', 1]
  ],
  mouthcover: [
    ['pinch_in', 0],
    ['pinch_in', 1],
    ['pinch_in', 2],
  ],
  disagree: [
    ['pinch_out', 1],
    ['pinch_out', 2],
  ],
  surprised: [
    ['shake', 0],
    ['shake', 2],
  ],
  laugh: [
    ['shake', 1],
  ]
}
// make the model fit to screen
fitModel();
setTimeout(() => fitModel(), 250);

function fitModel() {
  const breakpoint = {
    md: window.innerWidth > 720 && window.innerWidth < 1000,
    lg: window.innerWidth >= 1000
  };

  canvas.width = window.innerWidth / 2;
  canvas.height = window.innerHeight;


  if (!breakpoint.md && !breakpoint.lg) {
    app.renderer.screen.width = window.innerWidth;
  }
  app.renderer.screen.height = window.innerHeight;

  const anchor = {
    x: breakpoint.lg ? 1 : 0.5,
    y: 0.85
  };

  const scale = {
    x: breakpoint.lg ? 0.4 : breakpoint.md ? 0.35 : 0.25,
    y: breakpoint.lg ? 0.475 : breakpoint.md ? 0.425 : 0.3
  };

  const width = breakpoint.md
    ? model.width / 2.35
    : breakpoint.lg
      ? model.width
      : app.renderer.screen.width / 2;

  const height = breakpoint.md || breakpoint.lg
    ? app.renderer.screen.height
    : model.height;

  model.anchor.set(anchor.x, anchor.y);
  model.scale.set(scale.x, scale.y);
  model.x = width;
  model.y = height;
}

window.addEventListener('resize', fitModel);
const sayMessage = async (message) => {
  const speechSynthesis = window.speechSynthesis;
  const voiceSession = new SpeechSynthesisUtterance(message);
  console.log(speechSynthesis.getVoices())
  voiceSession.voice = speechSynthesis.getVoices()[0];
  if (voiceSession.voice == undefined) throw Error("Cant start Voice session required voice unavilable")
  voiceSession.pitch = 1;
  voiceSession.rate = 1;
  speechSynthesis.speak(message);
  const delay = Math.random() * 1e3 + 250;

  const motionGroup = 'talk'
  const random = Math.round(Math.random() * (motions[motionGroup].length - 1));
  const motion = motions[motionGroup][random];

  setTimeout(() => {
    // alert( answer || "Sorry, I don't speak that language");
    model.motion(motion[0], motion[1]);
  }, delay);
}
sayMessage("Hello")

