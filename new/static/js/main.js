window.PIXI = PIXI;

(async function () {
    const app = new PIXI.Application({
        view: document.getElementById('live2d'),
    });

    // is it running ?? cause it is model3.json so i guess it should not run
    const model = await Live2DModel.from("/hiyori_free_en/runtime/hiyori_free_t08.model3.json");

    app.stage.addChild(model);

    // transforms
    model.x = 100;
    model.y = 100;
    model.rotation = Math.PI;
    model.skew.x = Math.PI;
    model.scale.set(2, 2);
    model.anchor.set(0.5, 0.5);
 // this rendering is not working 
})();
function speakAndAnimate(text){
    speechSynthesis = window.speechSynthesis;
    const aiVoice = new SpeechSynthesisUtterance(text);
   aiVoice.voice=speechSynthesis.getVoices()[0]
    aiVoice.rate = 1;
    speechSynthesis.speak(aiVoice)
}
let Ai;
(async function (){
    const Ai = await window.ai.languageModel.create();
    return Ai;
})().then((data)=>{Ai=data})


const form = document.querySelector("form");

// make it public
// https://super-duper-space-acorn-wrr9j9x5jgvqc9vxj-5000.app.github.dev/?ai_prompt=hello

form.addEventListener("submit", (event) => {
    event.preventDefault();
    speakAndAnimate(event.target[0].value);
});