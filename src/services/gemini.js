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

export const sendMessageToGeminiWithImages = async (prompt, images) => {
    if (!genAI) {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing.");
        }
        genAI = new GoogleGenerativeAI(API_KEY);
    }
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const imageParts = images.map(img => ({
        inlineData: {
            data: img.base64,
            mimeType: img.mimeType
        }
    }));
    
    try {
        const result = await visionModel.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini Vision API:", error);
        throw error;
    }
};
