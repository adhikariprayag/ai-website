export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { message, systemPrompt } = await req.json();
        const API_KEY = process.env.CEREBRAS_API_KEY;

        if (!API_KEY) {
            return new Response(JSON.stringify({ error: 'Cerebras API Key is missing on Vercel' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama3.1-8b',
                messages: [
                    { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
                    { role: 'user', content: message },
                ],
                max_tokens: 1000,
                temperature: 0.7,
                stream: true,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return new Response(JSON.stringify(error), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Return the stream directly from Cerebras to the client
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
