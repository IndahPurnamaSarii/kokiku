// File: netlify/functions/getRecipes.js
const fetch = require('node-fetch');

// Nama file ini (getRecipes) harus cocok dengan panggilan di app.js:
// fetch('/api/getRecipes?...')
exports.handler = async (event, context) => {
    // Ambil parameter dari app.js
    const { count = 20, tag = '' } = event.queryStringParameters;
    
    // Ambil Kunci API Rahasia dari .env
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ message: 'SPOONACULAR_API_KEY belum diatur di server.' }) };
    }

    const tagQuery = tag ? `&tags=${tag}` : '';
    const url = `https://api.spoonacular.com/recipes/random?number=${count}${tagQuery}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Spoonacular Error: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        
        // Kirim balik data resep ke app.js
        return {
            statusCode: 200,
            body: JSON.stringify(data.recipes) // app.js mengharapkan { recipes: [...] }
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};