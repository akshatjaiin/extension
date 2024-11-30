import { createSsml, setViseme } from "./helpers.js";

// TODO separate mouth movement logic from speech synthesis. SRP!

/**
 * This abstracts the speech synthesizers so that it's straightforward to switch
 * between Azure and JS.
 */
class TextToSpeechSynthesizerFactory {
    static Dummy() {
        this.build = function() {
            return new TextToSpeechSynthesizer(); // Use base class as NOOP
        }
        return this;
    }
    static JS(model, lang, voice) {
        this.build = function() {
            return new JSTextToSpeechSynthesizer(model, lang, voice);
        }
        return this;
    }
    static Azure(model, lang, voice, subscriptionKey, serviceRegion) {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        speechConfig.speechRecognitionLanguage = lang;
        this.build = function () {
            return new AzureTextToSpeechSynthesizer(model, voice, speechConfig);
        }
        return this;
    }
    static Text() {
        this.build = function() {
            return new TextToSpeechSynthesizer();
        }
        return this;
    }
}
class TextToSpeechSynthesizer {
    /*
     Construct in the direct scope of user interaction events. Not inside async operations. 
     Some browsers do not let you play audio unless the user interacts with the browser.
     Some logic must be done in the direct scope of (for example) "onclick" events.
     */
    speak(text, emotion) { }
    interrupt() { }
    close() { }
}
class AzureTextToSpeechSynthesizer extends TextToSpeechSynthesizer {
    #model;
    #voice;
    #config;
    #azureSpeechSynthesizer;
    #visemeAcc;
    constructor(model, voice, config) {
        console.log("azure class get called ");
        super();
        this.#model = model;
        this.#voice = voice;
        this.#config = config;
        this.#azureSpeechSynthesizer = new SpeechSDK.SpeechSynthesizer(this.#config);
        this.#visemeAcc = [];

        let visemeAcc = this.#visemeAcc; // Need it due to scope shenanigans with .visemeReceived
        this.#azureSpeechSynthesizer.visemeReceived = (s, e) => {
            console.log("Viseme received: ", e); // Debugging viseme
            visemeAcc.push(e);
        };
    }

    speak(text, emotion) {
        const synthesizer = this;
        const ssml = createSsml(text, this.#voice, emotion);

        let visemeAcc = this.#visemeAcc, model = this.#model;

        // Speak SSML to synthesize speech
        this.#azureSpeechSynthesizer.speakSsmlAsync(
            ssml,
            function (result) {
                if (result.reason === SpeechSDK.ResultReason.Canceled) {
                    console.log("Synthesis failed. Error detail: " + result.errorDetails);
                    return;
                }

                let start = Date.now();
                // Loop through captured visemes and trigger mouth movement
                visemeAcc.forEach(e => {
                    console.log("Triggering mouth movement for viseme: ", e.visemeId);
                    setTimeout(() => {
                        console.log("Mouth movement at time: ", e.audioOffset, " for viseme: ", e.visemeId);
                        setViseme(model, e.visemeId); // Trigger the mouth movement
                    }, e.audioOffset / 10000 - (Date.now() - start));
                });

                synthesizer.close();
            },
            function (err) {
                console.error("Error during synthesis: ", err);
                synthesizer.close();
            }
        );
    }

    close() {
        this.#azureSpeechSynthesizer.close();
        this.#azureSpeechSynthesizer = undefined;
    }
}class JSTextToSpeechSynthesizer extends TextToSpeechSynthesizer {
    #model;
    #utterance;
    
    constructor(model, lang, voice) {
        console.log("JS class get called ");
        console.log("lang:", lang, "voice:", voice, "model:", model);
        super();
        this.#model = model;
        this.#utterance = new SpeechSynthesisUtterance();
        this.#utterance.lang = lang;

        // Ensure that voices are loaded
        this.#loadVoices(voice);
    }

    #loadVoices(voice) {
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length) {
                this.#setVoice(voice, voices);
            } else {
                console.error('No voices loaded.');
            }
        };
    }

    speak(text, emotion) {
        console.log("Text to speak: ", text);
        this.#utterance.text = text;

        // Emotion processing for SSML
        console.log("creating ssml");
        const ssml = createSsml(text, "Microsoft David Desktop - English (United States)", emotion);  // Assuming "David" is your voice
        console.log("ssml created: ", ssml);
        
        // Listen for boundary events to simulate mouth movement
        this.#utterance.onboundary = (event) => {
            console.log(`Boundary reached at char ${event.charIndex} for word: ${event.name}`);
            
            // For simplicity, let's assume each boundary maps to a viseme.
            const visemeId = this.getVisemeIdForBoundary(event);
            setViseme(this.#model, visemeId);  // Trigger mouth movement based on boundary (viseme)
        };

        // Start speaking
        window.speechSynthesis.speak(this.#utterance);
    }

    startSpeaking() {
        // Start speaking without emotion processing or SSML
        window.speechSynthesis.speak(this.#utterance);
    }

    interrupt() {
        // Stop speech synthesis
        window.speechSynthesis.cancel();
    }

    #setVoice(voice, voices) {
        if (voice < voices.length) {
            this.#utterance.voice = voices[voice];
            console.log(`Voice set to: ${voices[voice].name}`);
        } else {
            console.error('Invalid voice index.');
        }
    }

    getVisemeIdForBoundary(event) {
        // For simplicity, map each boundary event to a random viseme ID
        // You can refine this with a real viseme map based on phonemes
        return Math.floor(event.charIndex / 5) % 20;  // Random example
    }
}

// Load models and ensure they are ready before using them
async function initializeAndSpeak() {
    let modelData = {
        "name": "shizuki",
        "description": "Orange-Haired Girl",
        "url": "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json",
        "kScale": 0.000625,
        "kXOffset": 1150,
        "idleMotionGroupName": "Idle",
        "emotionMap": {
            "neutral": 0,
            "anger": 2,
            "disgust": 2,
            "fear": 1,
            "joy": 3,
            "sadness": 1,
            "surprise": 3
        }
    };
    const background_model_url = "https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/%E5%B0%91%E5%A5%B3%E5%89%8D%E7%BA%BF%20girls%20Frontline/live2dold/bg/cg7/model.json";
    
    // Load the models asynchronously
    let models = {
        model: await PIXI.live2d.Live2DModel.from(modelData["url"]),
        background_model: await PIXI.live2d.Live2DModel.from(background_model_url)
    };
    let model = models["model"];  // Define or get the model object from your application

    // Create an instance of the text-to-speech synthesizer
    const synthesizer = new JSTextToSpeechSynthesizer(model, 'en-US', 0);

    // Use the synthesizer to speak text
    synthesizer.speak("Sunshine and clear skies, Nature's beauty on display, Enjoy the day's grace.", "neutral");
}

// Initialize and start speaking
initializeAndSpeak();

export { TextToSpeechSynthesizerFactory };
