export const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message } = JSON.parse(event.body);
        const API_KEY = process.env.CEREBRAS_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: { message: "Cerebras API Key is missing on the server" } })
            };
        }

        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3.1-8b",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant for a portfolio website." },
                    { role: "user", content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify(data)
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ content: data.choices[0].message.content })
        };
    } catch (error) {
        console.error("Error in Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: { message: "Internal Server Error" } })
        };
    }
};
