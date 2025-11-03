
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const SYSTEM_PROMPT = "You are a helpful customer support bot. Be concise, friendly, and professional.";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_PROMPT,
        },
    });
}

export async function sendMessageWithRetry(chat: Chat, message: string): Promise<GenerateContentResponse> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const result = await chat.sendMessage({ message });
            return result;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)));
            } else {
                throw new Error("API request failed after multiple retries.");
            }
        }
    }
    // This line should be unreachable, but TypeScript needs it to know a promise is always returned.
    throw new Error("Exited retry loop unexpectedly.");
}
