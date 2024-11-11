// ApiService.js
import { Client } from "@gradio/client";

const client = await Client.connect("devcool20/mrm8488-distilroberta-finetuned-financial-news-sentiment-analysis");

export const fetchSentiment = async (text) => {
    try {
        const result = await client.predict("/predict", { param_0: text });
        return result.data; // Adjust based on your API response structure
    } catch (error) {
        console.error("Error fetching sentiment:", error);
        throw error; // Rethrow or handle as needed
    }
};