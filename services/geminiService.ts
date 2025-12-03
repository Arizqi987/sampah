import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, WasteCategory, BinColor } from "../types";

// Initialize Gemini
// NOTE: API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    itemName: {
      type: Type.STRING,
      description: "Nama umum sampah dalam Bahasa Indonesia (contoh: Kulit Pisang, Botol Plastik, Baterai Bekas).",
    },
    category: {
      type: Type.STRING,
      enum: [
        WasteCategory.RECYCLABLE,
        WasteCategory.ORGANIC,
        WasteCategory.HAZARDOUS,
        WasteCategory.RESIDUAL,
        WasteCategory.UNKNOWN
      ],
      description: "Kategori klasifikasi sampah.",
    },
    binColor: {
      type: Type.STRING,
      enum: ['blue', 'green', 'red', 'gray'],
      description: "Warna tong yang sesuai: 'blue' (Daur Ulang), 'green' (Organik), 'red' (B3/Berbahaya), 'gray' (Residu/Lainnya).",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Skor keyakinan 0-1.",
    },
    explanation: {
      type: Type.STRING,
      description: "Penjelasan singkat alasan kategorisasi dalam Bahasa Indonesia.",
    },
    tip: {
      type: Type.STRING,
      description: "Saran tindakan sebelum membuang (contoh: Remukkan, Cuci bersih) dalam Bahasa Indonesia.",
    },
    ecoPoints: {
      type: Type.NUMBER,
      description: "Poin (10-50) berdasarkan kompleksitas pemilahan.",
    },
  },
  required: ["itemName", "category", "binColor", "confidence", "explanation", "tip", "ecoPoints"],
};

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  
  // Extract correct mime type from the data URL
  const mimeTypeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

  // Remove header
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Analisis gambar sampah ini sebagai sistem 'Smart Trash Bin'. Identifikasi item dalam Bahasa Indonesia, tentukan kategori tong sampah yang benar (Biru=Daur Ulang, Hijau=Organik, Merah=B3, Abu-abu=Residu), dan berikan output JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Return a fallback result so the app doesn't crash, but log the error
    return {
      itemName: "Gagal Menganalisis",
      category: WasteCategory.UNKNOWN,
      binColor: 'gray',
      confidence: 0,
      explanation: "Terjadi kesalahan saat menghubungi kecerdasan buatan atau format gambar tidak didukung.",
      tip: "Pastikan koneksi internet lancar dan foto terlihat jelas.",
      ecoPoints: 0
    };
  }
};