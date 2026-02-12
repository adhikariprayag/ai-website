const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

export const sendMessageToCerebras = async (message) => {
    // Note: VITE_ variables are replaced at build time. 
    // In production (Netlify), this will likely be undefined for security.
    const VITE_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;

    // 1. Try Calling via Vercel Function (Secure Production Method)
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            const data = await response.json();
            return data.content;
        }

        // If not 404, the path exists but failed (e.g. 500 error from function)
        if (response.status !== 404) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Netlify Function Error (${response.status}): ${errorData.error?.message || "Check Netlify logs"}`);
        }
    } catch (error) {
        // Only ignore 404s (which happen locally). Re-throw other specific errors.
        if (error.message?.includes("Netlify Function Error")) {
            throw error;
        }
        console.warn("Netlify function check failed/skipped:", error.message);
    }

    // 2. Fallback to Direct API (Local Development Only)
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
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Direct API Fallback Error (${response.status}): ${errorData.error?.message || "Check Console"}`);
            }
        } catch (fallbackError) {
            console.error("Direct API fallback failed:", fallbackError);
            throw fallbackError;
        }
    }

    // If we get here, both methods failed or were skipped
    throw new Error("Chatbot diagnostic: All communication methods failed. Please ensure you have REDEPLOYED the latest code to Netlify and configured the CEREBRAS_API_KEY in Netlify settings.");
};
