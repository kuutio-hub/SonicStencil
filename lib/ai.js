import { GoogleGenAI } from "@google/genai";

export async function generateAiBackground() {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = "A highly abstract, psychedelic, non-figurative background pattern for a high-end card design. Use vibrant neon colors and fluid shapes. Modern and professional look.";

    try {
        const response = await ai.models.generateContent({
            model: 'gem-2.5-flash-image',
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
        // Ha a ciklus lefut anélkül, hogy képet találna
        throw new Error("AI generated a response, but it contained no image. This might be due to safety filters.");

    } catch (e) {
        console.error("AI Generation Failed", e);
        // Továbbdobjuk a hibát, hogy a hívó komponens elkapja
        throw e;
    }
};
