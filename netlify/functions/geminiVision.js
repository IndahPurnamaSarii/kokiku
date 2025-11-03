// File: netlify/functions/geminiVision.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper untuk mengubah base64 menjadi format yang dimengerti Gemini
function fileToGenerativePart(base64, mimeType) {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

exports.handler = async (event, context) => {
    const { base64Image, mimeType } = JSON.parse(event.body);

    if (!base64Image || !mimeType) {
        return { statusCode: 400, body: JSON.stringify({ message: "Gambar tidak ada" }) };
    }

    const prompt = "Analisis gambar ini. Identifikasi HANYA bahan makanan utama. Jawab dalam Bahasa Inggris. Jika lebih dari satu, pisahkan dengan koma. JANGAN gunakan kata-kata tambahan, HANYA nama bahan. Contoh: 'Chicken' atau 'Tomato, Onion' atau 'Shrimp'. Ini akan digunakan untuk API pencarian resep. Jika bukan bahan makanan, jawab 'Bukan makanan'.";

    try {
        const imagePart = fileToGenerativePart(base64Image, mimeType);
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        
        // Kirim kembali hasil analisis teks ke app.js
        return {
            statusCode: 200,
            body: JSON.stringify({ text: response.text() })
        };
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};