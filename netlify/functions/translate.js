// File: netlify/functions/translate.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gunakan model yang lebih baru dan cepat
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

exports.handler = async (event, context) => {
    // Ambil data yang dikirim oleh app.js (dari body)
    const { text, targetLang } = JSON.parse(event.body);
    let prompt;

    // Tentukan prompt berdasarkan target bahasa
    if (targetLang === 'en') {
        prompt = `Terjemahkan istilah makanan atau bahan berikut dari Bahasa Indonesia ke Bahasa Inggris. Hanya kembalikan hasil terjemahannya, tidak ada teks tambahan. Istilah: "${text}"`;
    } else if (targetLang === 'id') {
        prompt = `Terjemahkan istilah makanan atau bahan berikut dari Bahasa Inggris ke Bahasa Indonesia. Hanya kembalikan hasil terjemahannya, tidak ada teks tambahan. Istilah: "${text}"`;
    } else if (targetLang === 'id-list') {
        prompt = `Terjemahkan daftar judul resep berikut dari Bahasa Inggris ke Bahasa Indonesia. Jawab HANYA dengan daftar yang sudah diterjemahkan, satu per baris, tanpa nomor atau tanda strip.\n\nDaftar Judul:\n${text}`;
    } else {
        return { statusCode: 400, body: JSON.stringify({ message: "Target language tidak didukung" }) };
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Kirim kembali teks yang sudah diterjemahkan ke app.js
        return {
            statusCode: 200,
            body: JSON.stringify({ text: response.text() })
        };
    } catch (error) {
        console.error("Gemini Translate Error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};