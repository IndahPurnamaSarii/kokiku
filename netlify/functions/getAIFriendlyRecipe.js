// File: netlify/functions/getAIFriendlyRecipe.js
// VERSI BARU YANG LEBIH PINTAR

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// KODE LAMA ANDA YANG SALAH:
const response = await ai.models.generateContent({ model: 'gemini-pro', ... }); // Gunakan model stabil ini

// --- FUNGSI HELPER BARU UNTUK PARSING ---
function parseAIResponse(rawText, details) {
    try {
        // Gunakan RegEx untuk menemukan teks di antara kata kunci
        const greeting = rawText.match(/SAPAAN:([\s\S]*?)(BAHAN:|LANGKAH:|PENUTUP:|$)/i)?.[1]?.trim();
        const ingredients = rawText.match(/BAHAN:([\s\S]*?)(LANGKAH:|PENUTUP:|$)/i)?.[1]?.trim();
        const steps = rawText.match(/LANGKAH:([\s\S]*?)(PENUTUP:|$)/i)?.[1]?.trim();
        const closing = rawText.match(/PENUTUP:([\s\S]*?)$/i)?.[1]?.trim();

        // Bersihkan dan ubah menjadi array
        const friendlyIngredients = ingredients 
            ? ingredients.split('\n').filter(line => line.trim().length > 0) 
            : details.ingredients.map(ing => `- ${ing}`); // Fallback jika parsing gagal
            
        const friendlySteps = steps 
            ? steps.split('\n').filter(line => line.trim().length > 0)
            : details.steps.map((step, i) => `${i+1}. ${step}`); // Fallback jika parsing gagal

        return {
            greeting: greeting || "Ayo kita masak!",
            friendlyIngredients: friendlyIngredients,
            friendlySteps: friendlySteps,
            closing: closing || "Selamat mencoba!"
        };
    } catch (e) {
        console.error("Gagal mem-parsing teks AI:", e);
        // Fallback jika RegEx gagal total
        return {
            greeting: "Resep asli (Gagal Parsing AI):",
            friendlyIngredients: details.ingredients.map(ing => `- ${ing}`),
            friendlySteps: details.steps.map((step, i) => `${i+1}. ${step}`),
            closing: "Selamat mencoba!"
        };
    }
}
// --- AKHIR FUNGSI HELPER ---


exports.handler = async (event, context) => {
    const { recipe, details } = JSON.parse(event.body);

    const prompt = `
    Anda "KokiKu", asisten koki ramah. 
    Sajikan resep ini dalam Bahasa Indonesia yang natural dan bersahabat.
    Judul resep sudah dalam Bahasa Indonesia ("${recipe.name}").
    Terjemahkan bahan-bahan (ingredients) dan langkah-langkah (steps) ke Bahasa Indonesia.
    
    Data Resep:
    - Judul: "${recipe.name}"
    - Bahan (Inggris): ${JSON.stringify(details.ingredients)}
    - Langkah (Inggris): ${JSON.stringify(details.steps)}

    JAWAB HANYA DALAM FORMAT YANG SAYA TENTUKAN DI BAWAH INI. 
    WAJIB GUNAKAN KATA KUNCI 'SAPAAN:', 'BAHAN:', 'LANGKAH:', 'PENUTUP:'.
    
    SAPAAN: [Sapaan singkat dan ramah]
    BAHAN:
    [Daftar bahan terjemahan, 1 baris per item, diawali '-']
    LANGKAH:
    [Daftar langkah terjemahan, 1 baris per item, diawali nomor '1.', '2.', '3.']
    PENUTUP: [Kalimat penutup singkat]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // Panggil fungsi parsing kita yang baru
        const friendlyRecipe = parseAIResponse(rawText, details);
        friendlyRecipe.title = recipe.name; // Tambahkan judulnya

        // Kirim kembali objek JSON yang sudah rapi ke app.js
        return {
            statusCode: 200,
            body: JSON.stringify(friendlyRecipe)
        };
    } catch (error) {
        console.error("Gemini RAG Error:", error);
        // Jika AI gagal total (error 500), kirim balik format fallback
        const fallback = {
            title: `${recipe.name} (Gagal Diterjemahkan)`,
            greeting: `Resep asli. (Gagal terhubung ke AI: ${error.message})`,
            friendlyIngredients: details.ingredients.map(ing => `- ${ing}`),
            friendlySteps: details.steps.map((step, i) => `${i + 1}. ${step}`),
            closing: `Selamat mencoba!`
        };
        return { 
            statusCode: 500, 
            body: JSON.stringify(fallback) 
        };
    }
};
