import { GoogleGenAI, Modality, Type } from "@google/genai";
import { RiddleData } from "../types";

// Initialize Gemini Client
// Note: The API Key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a riddle, answer, and wrong options for a given letter.
 */
export const generateRiddle = async (letter: string): Promise<RiddleData> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    Generate a simple, fun riddle for a 5-year-old child about an animal, food, or object that starts with the letter '${letter}'.
    Provide the answer (which must start with '${letter}') and 3 distinct wrong answers (distractors) that are also simple words suitable for kids.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The riddle question" },
            answer: { type: Type.STRING, description: "The correct answer word" },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3 wrong answers",
            },
          },
          required: ["question", "answer", "options"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");

    const data = JSON.parse(jsonText);
    
    // Combine answer and options and shuffle
    const allOptions = [...data.options, data.answer].sort(() => Math.random() - 0.5);

    return {
      letter,
      question: data.question,
      answer: data.answer,
      options: allOptions,
    };
  } catch (error) {
    console.error("Error generating riddle:", error);
    throw error;
  }
};

/**
 * Helper to decode raw PCM data from Gemini
 */
async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Generates speech audio for the given text.
 * Returns an AudioBuffer.
 */
export const generateSpeech = async (text: string, audioContext: AudioContext): Promise<AudioBuffer | null> => {
  const modelId = "gemini-2.5-flash-preview-tts";
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }, // Friendly voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      console.warn("No audio data returned");
      return null;
    }

    // Decode Base64
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode raw PCM (24kHz, 1 channel)
    return await decodePCM(bytes, audioContext, 24000, 1);
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

/**
 * Generates a reward image for the correct answer.
 */
export const generateRewardImage = async (word: string): Promise<string | null> => {
  const modelId = "gemini-2.5-flash-image"; // Nano Banana for speed
  const prompt = `A cute, colorful, cheerful cartoon illustration of a ${word}. Minimalist vector art style, white background. High quality, kid-friendly.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    // Iterate to find image part
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};