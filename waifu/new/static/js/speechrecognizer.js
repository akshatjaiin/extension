class SpeechToTextRecognizerFactory {
    static JS(lang) {
        this.build = function () {
            return new NativeSpeechToTextRecognizer(lang);
        }
        return this;
    }
    static Azure(lang, subscriptionKey, serviceRegion) {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        speechConfig.speechRecognitionLanguage = lang;
        const audioConfig = window.SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.build = function () {
            return new AzureSpeechToTextRecognizer(speechConfig, audioConfig);
        }
        return this;
    }
    static TextInputRecognizer() {
        this.build = function () {
            return new TextInputRecognizer();
        }
        return this;
    }
}
class SpeechToTextRecognizer {
    recognize(onPartialResult, callback) {
        callback(null);
    }
}
class NativeSpeechToTextRecognizer extends SpeechToTextRecognizer {
    #recognizer;

    constructor(lang = "en-US", options = { continuous: false, interimResults: true }) {
        super();

        if (!("webkitSpeechRecognition" in window)) {
            throw new Error("Speech recognition is not supported in this browser.");
        }

        let recognizer = new webkitSpeechRecognition();
        this.#recognizer = recognizer;

        recognizer.continuous = options.continuous;
        recognizer.interimResults = options.interimResults;
        recognizer.maxAlternatives = 1;   // Max number of alternatives

        recognizer.lang = lang;
    }

    recognize(onPartialResult, callback) {
        let recognizer = this.#recognizer;
        let finalTranscript = "";
        let lastPartial = "";

        recognizer.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else if (recognizer.interimResults) {
                    const partial = result[0].transcript;
                    if (partial !== lastPartial) {
                        lastPartial = partial;
                        onPartialResult(partial); // Throttle here if needed
                    }
                }
            }
        };

        recognizer.onspeechend = () => {
            recognizer.stop();
            callback(finalTranscript || "No speech detected.");
        };

        recognizer.onerror = (event) => {
            console.error("Speech recognition error:", event.error);

            if (event.error === "no-speech") {
                console.warn("No speech detected. Restarting recognition...");
                callback(null, "No speech detected. Please try again.");
                // Optionally, restart:
                // recognizer.start();
            } else if (event.error === "not-allowed") {
                callback(null, "Microphone access denied. Please allow permissions.");
            } else {
                callback(null, `Error: ${event.error}`);
            }
        };

        recognizer.onend = () => {
            // Handle unexpected termination
            if (!finalTranscript) {
                console.warn("Speech recognition ended without detecting speech.");
                callback(null, "Recognition ended. No speech detected.");
            }
        };

        recognizer.start();
    }
}

class AzureSpeechToTextRecognizer extends SpeechToTextRecognizer {
    #recognizer;
    constructor(speechConfig, audioConfig) {
        super();
        this.#recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    }
    recognize(onPartialResult, callback) {
        let recognizer = this.#recognizer;
        this.#recognizer.recognizing = (s, e) => {
            onPartialResult(e.result.text);
        };
        recognizer.recognizeOnceAsync(
            function (result) {
                recognizer?.close();
                recognizer = undefined;

                callback(result.text, null);
            },
            function (err) {
                window.console.log(err);
                recognizer?.close();

                callback(null, err);
            }
        );
    }
}
class TextInputRecognizer extends SpeechToTextRecognizer {
    constructor() {
        super();
        transcription.innerText = "";
        transcription.contentEditable = true;
        transcription.focus();
    }
    recognize(onPartialResult, callback) {
        transcription.onkeydown = function (e) {
            if (e.key == "Enter") {
                transcription.contentEditable = false;
                callback(transcription.innerText);
            }
        }
    }
}

export { SpeechToTextRecognizerFactory };