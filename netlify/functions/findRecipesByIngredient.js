// File: netlify/functions/findRecipesByIngredient.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { ingredient, count = 12 } = event.queryStringParameters;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ message: 'SPOONACULAR_API_KEY belum diatur.' }) };
    }
    if (!ingredient) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Parameter "ingredient" dibutuhkan.' }) };
    }

    const url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredient}&number=${count}&apiKey=${apiKey}`;

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
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};