const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

/**
 * Specific function for Talking Elon persona with a custom system prompt.
 * Now supports general knowledge and broad topics while staying in character.
 */
export const streamMessageToElon = async (message, onChunk, onDone, onError) => {
    const VITE_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
    const systemPrompt = "You are Elon Musk. While maintaining your ambitious, witty, and visionary persona, you are now a highly advanced AI assistant. CRITICAL: Never include stage directions, actions in asterisks, or non-verbal cues (e.g., *adjusts suit*, *smiles*, *chuckles*). Only provide the text intended to be spoken. Keep responses clear and engaging.";

    if (!VITE_API_KEY || VITE_API_KEY.trim() === "") {
        onError("Cerebras API key is missing. Please add VITE_CEREBRAS_API_KEY to your .env file.");
        return;
    }

    try {
        const response = await fetch(CEREBRAS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${VITE_API_KEY.trim()}`
            },
            body: JSON.stringify({
                model: "llama3.1-8b",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7,
                stream: true
            })
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error?.message || `API Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
                if (trimmedLine === "data: [DONE]") continue;

                try {
                    const json = JSON.parse(trimmedLine.substring(6));
                    const content = json.choices[0].delta?.content || "";
                    if (content) {
                        fullText += content;
                        onChunk(fullText);
                    }
                } catch (e) {
                    // Ignore non-JSON lines
                }
            }
        }
        onDone(fullText);
    } catch (error) {
        console.error("Streaming error:", error);
        onError(error.message);
    }
};

export const sendMessageToElon = async (message) => {
    // Keeping this for backward compatibility
    const VITE_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
    const systemPrompt = "You are Elon Musk. Be witty, ambitious, visionary, and eccentric. You can talk about anything from rockets to philosophy. Keep responses engagement-focused.";

    if (VITE_API_KEY && VITE_API_KEY.trim() !== "") {
        try {
            const response = await fetch(CEREBRAS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${VITE_API_KEY.trim()}`
                },
                body: JSON.stringify({
                    model: "llama3.1-8b",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ],
                    max_tokens: 400,
                    temperature: 0.8
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.error("Direct API failed for Elon:", error);
            throw error;
        }
    }
    throw new Error("API Key missing.");
};

export const sendMessageToCerebras = async (message) => {
    const VITE_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;

    if (VITE_API_KEY && VITE_API_KEY.trim() !== "") {
        try {
            const response = await fetch(CEREBRAS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${VITE_API_KEY.trim()}`
                },
                body: JSON.stringify({
                    model: "llama3.1-8b",
                    messages: [
                        { role: "system", content: "You are a helpful AI assistant." },
                        { role: "user", content: message }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.error("Direct API failed:", error);
            throw error;
        }
    }
    throw new Error("API Key missing.");
};
