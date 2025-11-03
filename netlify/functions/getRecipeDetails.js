// File: netlify/functions/getRecipeDetails.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { recipeId } = event.queryStringParameters;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ message: 'SPOONACULAR_API_KEY belum diatur.' }) };
    }
    if (!recipeId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Parameter "recipeId" dibutuhkan.' }) };
    }

    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Spoonacular Error: ${response.statusText}`);
        
        const data = await response.json();

        // Format data di sini agar lebih bersih untuk app.js
        const details = {
            ingredients: data.extendedIngredients.map(ing => ing.original),
            steps: data.analyzedInstructions?.[0]?.steps.map(s => s.step) || ["Instruksi tidak tersedia untuk resep ini."]
        };
        
        // Kirim balik data ke app.js
        return {
            statusCode: 200,
            body: JSON.stringify(details)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};