import { GoogleGenAI, Type } from "@google/genai";
import { Trend, ListingData, AspectRatio, ImageResolution, DesignStyle } from "../types";

// Helper to get client with current key
const getClient = () => {
  // Check process.env first, then fallback to localStorage for manual entry support
  const apiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key');
  if (!apiKey) throw new Error("API Key not found. Please click the Settings icon to configure your key.");
  return new GoogleGenAI({ apiKey });
};

// 1. Trend Discovery (Gemini 2.5 Flash + Search)
export const discoverTrends = async (niche: string, style?: DesignStyle): Promise<Trend[]> => {
  const ai = getClient();
  
  let stylePrompt = "";
  if (style) {
    stylePrompt = `
    Focus specifically on the "${style.name}" design style.
    Style Description: ${style.description}
    Key Elements to look for: ${style.elements}
    `;
  }

  const prompt = `Find 5 current, specific, and visual trending themes for holiday print-on-demand gifts related to: ${niche || 'general holidays'}. ${stylePrompt}
  Focus on aesthetics, styles, and specific motifs that match the requested style.
  
  Return the result as a raw JSON array (no markdown code blocks) with the following structure:
  [
    {
      "title": "Trend Title",
      "description": "Description of the trend and how it fits the style",
      "sourceUrl": "Optional source URL if available"
    }
  ]`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // responseMimeType and responseSchema are not compatible with googleSearch tools
    }
  });

  let text = response.text || "[]";
  
  // Clean up markdown if present
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0];
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0];
  }

  try {
    const trends = JSON.parse(text) as Trend[];
    // Attach the style context to the trends so it carries over to the design step
    return trends.map(t => ({ ...t, style }));
  } catch (e) {
    console.error("Failed to parse trends", e);
    return [];
  }
};

// 2. Design Generation (Gemini 3 Pro Image)
// Note: Requires User API Key Selection
export const generateDesign = async (
  trend: Trend, 
  ratio: AspectRatio, 
  resolution: ImageResolution,
  refImageBase64?: string
): Promise<{ base64: string; mimeType: string }> => {
  const ai = getClient();
  
  let styleInstructions = "Flat colors, clean lines, suitable for screen printing.";
  if (trend.style) {
    styleInstructions = `
    Design Style: ${trend.style.name}
    Visual Description: ${trend.style.description}
    Key Elements to Include: ${trend.style.elements}
    `;
  }

  const promptText = `A high-quality, professional vector-style t-shirt design featuring ${trend.title}. 
  Context: ${trend.description}.
  ${styleInstructions}
  Isolated on a transparent background. No background scenery.`;

  const contents: any = { parts: [] };
  
  if (refImageBase64) {
    contents.parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for upload, but could detect
        data: refImageBase64
      }
    });
    contents.parts.push({ text: `Use the attached image as a style reference. ${promptText}` });
  } else {
    contents.parts.push({ text: promptText });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: contents,
    config: {
      imageConfig: {
        aspectRatio: ratio,
        imageSize: resolution
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png'
      };
    }
  }
  throw new Error("No image generated");
};

// 3. Listing Generation (Gemini 3 Pro - Thinking Mode)
export const generateListing = async (trend: string, designDescription?: string): Promise<ListingData> => {
  const ai = getClient();
  
  const prompt = `Create a highly SEO-optimized Etsy listing for a t-shirt.
  Trend: ${trend}
  Design Context: ${designDescription || 'A cool graphic design'}.
  
  Requirements:
  1. SEO-rich Title (max 140 chars).
  2. Persuasive Description (2 paragraphs).
  3. Exactly 13 tags, each under 20 characters.
  
  Return strictly JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for best SEO
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
};

// 4. Fast Helper (Gemini 2.5 Flash Lite)
export const quickTitleFix = async (currentTitle: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Rewrite this product title to be more catchy and under 100 characters: "${currentTitle}"`
  });
  return response.text || currentTitle;
};

// 5. Mockup Generation (Gemini 2.5 Flash Image - Editing/Generation)
export const generateMockup = async (designBase64: string, color: string, setting: string): Promise<{ base64: string }> => {
  const ai = getClient();
  
  // We use the design as input and ask Gemini to "generate a photo of a shirt with this design"
  // This uses the multimodal capabilities of Flash Image
  
  const prompt = `A photorealistic studio shot of a model wearing a ${color} cotton t-shirt. The t-shirt features the design shown in the input image on the chest. The design should be clearly visible and blend naturally with the fabric folds. ${setting}. High resolution, 4k.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: designBase64
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return { base64: part.inlineData.data };
    }
  }
  throw new Error("No mockup generated");
};

// 6. Video Generation (Veo)
// Note: Requires User API Key Selection
export const generateMarketingVideo = async (prompt: string): Promise<string> => {
  const ai = getClient();

  // If using manual key, we must append it manually to the fetch if needed, 
  // but generateVideos returns a URI that needs the key appended.
  // We use the apiKey from the client instance or env.
  const apiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key');

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '9:16' // Portrait for social media (TikTok/Reels)
    }
  });

  // Polling for video completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video generation failed");
  
  return `${uri}&key=${apiKey}`;
};