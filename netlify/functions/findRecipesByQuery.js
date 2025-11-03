// File: netlify/functions/findRecipesByQuery.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { query, count = 12 } = event.queryStringParameters;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ message: 'SPOONACULAR_API_KEY belum diatur.' }) };
    }
    if (!query) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Parameter "query" dibutuhkan.' }) };
    }

    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=${count}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Spoonacular Error: ${response.statusText}`);
        
        const data = await response.json();
        
        // Kirim balik data ke app.js
        return {
            statusCode: 200,
            body: JSON.stringify(data) // app.js akan memproses data.results
        };
    } catch (error) {
        console.error("getRecipes Crash Error:", error); // <-- TAMBAHKAN BARIS INI
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};