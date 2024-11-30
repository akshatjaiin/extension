import { DumbMemoryModule } from "./memory.js"

const apiKey = "sk-YOUR_API_KEY"; // Replace with your actual OpenAI API key

function openAIAPICompletionReq(key, messages, callback) {
    console.log("Messages array:", messages);
    
    // Validate messages array before making the API call
    for (let i = 0; i < messages.length; i++) {
        if (!messages[i].content || messages[i].content.trim() === "") {
            console.error(`Invalid message at index ${i}: content is null, empty, or just whitespace.`);
            messages[i].content = "Default message content"; // Replace with a default message
        } else if (messages[i].content.trim().toLowerCase() === 'hay hay') {
            // Special handling for common casual inputs like "hay hay"
            messages[i].content = "Hello! How can I assist you today?"; // Respond to informal greetings
        }
    }

    $.ajax({
        url: 'https://api.openai.com/v1/chat/completions',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        },
        data: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages, // Pass the memory array directly
            temperature: 0.8,
            max_tokens: 70,
        }),
        success: function (data) {
            if (data.choices && data.choices.length > 0) {
                callback(data.choices[0].message.content.trim(), null);
            } else {
                callback(null, "Unexpected response format.");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.error('AJAX Error:', XMLHttpRequest, textStatus, errorThrown);
            let err = `Error code ${XMLHttpRequest.status}.`;
            switch (XMLHttpRequest.status) {
                case 401:
                    err += " It seems like your API key doesn't work. Was it entered correctly?";
                    break;
                case 429:
                    err += " You're sending too many requests. Slow down.";
                    break;
                case 400:
                    err += " Invalid request. Check the 'messages' parameter.";
                    break;
                case 500:
                    err += " OpenAI's server is facing an issue. Try again later.";
                    break;
                default:
                    err += " Please check your internet connection or the API URL.";
            }
            callback(null, err);
        }
    });
}

function emotionAnalysis(key, text, callback) {
    const messages = [
        {
            role: "system",
            content: "You are an assistant that analyzes text and identifies the Ekman emotion associated with it. Valid emotions are: joy, disgust, surprise, sadness, neutral, or anger."
        },
        {
            role: "user",
            content: `What is the Ekman emotion for the following text?\n"${text}"`
        }
    ];
    console.log(text)
    $.ajax({
        url: 'https://api.openai.com/v1/chat/completions',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
        },
        data: JSON.stringify({
            model: 'gpt-3.5-turbo', // Use a newer model
            messages: messages,
            temperature: 0,
            max_tokens: 10, // Limit response length
        }),
        success: function (data) {
            try {
                const response = data.choices[0].message.content.trim().toLowerCase();
                const validEmotions = ["neutral", "joy", "sadness", "anger", "disgust", "surprise"];
                const emotion = validEmotions.includes(response) ? response : "neutral";
                callback(emotion);
            } catch (error) {
                console.error("Error parsing emotion:", error);
                callback("neutral");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.error("Emotion analysis failed:", XMLHttpRequest.responseText);
            callback("neutral"); // Default to neutral in case of an error
        },
    });
}

class AI {
    accept(text, callback) {
        response = {
            "response": "Beep boop no AI available",
            "emotion": "angry"
        };
        callback(response, null)
    }
}
class APIAbuserAI extends AI {
    #openaiAPIKey;
    #memory;

    constructor(openAIAPIKey, messages = []) {
        super();
        this.#openaiAPIKey = openAIAPIKey;
        this.#memory = messages; // Message history for the conversation
    }

    accept(userPrompt, callback) {
        this.#memory.push({ role: "user", content: userPrompt });

        const APIKey = this.#openaiAPIKey;

        openAIAPICompletionReq(APIKey, this.#memory, (response, err) => {
            if (err) {
                callback(null, `Error generating response: ${err}`);
                return;
            }

            this.#memory.push({ role: "assistant", content: response });

            emotionAnalysis(APIKey, response, (emotion) => {
                if (!emotion) {
                    callback(null, "Error analyzing emotion.");
                    return;
                }

                callback({
                    response: response,
                    emotion: emotion,
                });
            });
        });
    }
}



class USAWServerAI extends AI {
    #URL
    constructor(USAWServerURL) {
        super();
        this.#URL = USAWServerURL;
    }
    accept(userPrompt, callback) {
        $.ajax({
            url: this.#URL + "/api/waifu/1/event/conversation",
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                'prompt': userPrompt
            }),
            success: function (data) {
                callback(data, null);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                callback(null, "AAA");
            },
        });
    }
}

export { APIAbuserAI, USAWServerAI }