export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { message } = req.body;
        const API_KEY = process.env.CEREBRAS_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: { message: "Cerebras API Key is missing on Vercel server" }
            });
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
            return res.status(response.status).json(data);
        }

        return res.status(200).json({ content: data.choices[0].message.content });
    } catch (error) {
        console.error("Error in Vercel Function:", error);
        return res.status(500).json({
            error: { message: "Internal Server Error" }
        });
    }
}
