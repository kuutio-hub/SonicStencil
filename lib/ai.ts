import { GoogleGenAI } from "@google/genai";

export const generateAiBackground = async (): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = "A highly abstract, psychedelic, non-figurative background pattern for a high-end card design. Use vibrant neon colors and fluid shapes. Modern and professional look.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });

        const candidate = response?.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData?.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        // If loop completes without finding an image
        throw new Error("AI generated a response, but it contained no image. This might be due to safety filters.");

    } catch (e) {
        console.error("AI Generation Failed", e);
        // Re-throw the error to be caught by the calling component
        throw e;
    }
};