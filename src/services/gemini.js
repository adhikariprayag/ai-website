import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

export const sendMessageToGemini = async (message) => {
    if (!model) {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
        }
        // Re-initialize if key was added later (though usually requires reload)
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    try {
        const result = await model.generateContent(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};
