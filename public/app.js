// File: public/app.js
// Versi LENGKAP dan BERSIH untuk arsitektur Netlify

// Impor HANYA firebaseConfig. Kunci rahasia sudah tidak ada.
import { firebaseConfig } from './config.js';

// === INISIALISASI FIREBASE ===
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
// ======================================================
// === FUNGSI API (MEMANGGIL NETLIFY BACKEND) ===
// ======================================================

const getRecipes = async (count = 20, tag = '') => {
    console.time(`API: /api/getRecipes(${count}, ${tag})`);
    try {
        // Memanggil backend Netlify kita, bukan Spoonacular
        const response = await fetch(`/.netlify/functions/getRecipes?count=${count}&tag=${tag}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        console.timeEnd(`API: /api/getRecipes(${count}, ${tag})`);
        
        // Data dari backend (netlify function) sudah diformat, 
        // tapi kita pastikan lagi formatnya di sini untuk frontend
        if (Array.isArray(data)) {
            return data.map(recipe => ({ 
                id: recipe.id, 
                name: recipe.title, // Backend mungkin mengirim 'title'
                image: recipe.image 
            }));
        }
        // Jika backend mengirim format { recipes: [...] }
        if (data.recipes && Array.isArray(data.recipes)) {
            return data.recipes.map(recipe => ({
                 id: recipe.id, 
                 name: recipe.title, 
                 image: recipe.image 
            }));
        }
        
        console.warn("Format data getRecipes tidak terduga:", data);
        return []; // Kembalikan array kosong jika format salah

    } catch (error) {
        console.timeEnd(`API: /api/getRecipes(${count}, ${tag})`);
        return { error: true, message: error.message };
    }
};

const findRecipesByQuery = async (query, count = 12) => {
    console.time(`API: /api/findRecipesByQuery('${query}', ${count})`);
    try {
        const response = await fetch(`/.netlify/functions/findRecipesByQuery?query=${query}&count=${count}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        console.timeEnd(`API: /api/findRecipesByQuery('${query}', ${count})`);
        
        // Backend (netlify) akan mengembalikan { results: [...] }
        const results = data.results || [];
        return results.map(recipe => ({ 
            id: recipe.id, 
            name: recipe.title, 
            image: recipe.image 
        }));
    } catch (error) {
        console.timeEnd(`API: /api/findRecipesByQuery('${query}', ${count})`);
        return { error: true, message: error.message };
    }
};

const findRecipesByIngredient = async (ingredient, count = 12) => {
    console.time(`API: /api/findRecipesByIngredient('${ingredient}', ${count})`);
    try {
        const response = await fetch(`/.netlify/functions/findRecipesByIngredient?ingredient=${ingredient}&count=${count}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        console.timeEnd(`API: /api/findRecipesByIngredient('${ingredient}', ${count})`);
        
        // Backend (netlify) akan mengembalikan { results: [...] }
        const results = data.results || [];
        return results.map(recipe => ({ 
            id: recipe.id, 
            name: recipe.title, 
            image: recipe.image 
        }));
    } catch (error) {
        console.timeEnd(`API: /api/findRecipesByIngredient('${ingredient}', ${count})`);
        return { error: true, message: error.message };
    }
};

const getRecipeDetails = async (recipeId) => {
    console.time(`API: /api/getRecipeDetails(${recipeId})`);
    try {
        // Memanggil backend Netlify kita
        const response = await fetch(`/.netlify/functions/getRecipeDetails?recipeId=${recipeId}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        console.timeEnd(`API: /api/getRecipeDetails(${recipeId})`);
        return data; // Backend sudah memformat ini
    } catch (error) {
        console.timeEnd(`API: /api/getRecipeDetails(${recipeId})`);
        return { error: true, message: error.message };
    }
};

// --- FUNGSI GEMINI (MEMANGGIL NETLIFY BACKEND) ---

const translateToEnglish = async (query) => {
    console.time(`API: /api/translate (to en)`);
    try {
        const response = await fetch(`/.netlify/functions/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: query, targetLang: 'en' })
        });
        if (!response.ok) throw new Error('Gagal menerjemahkan');
        const data = await response.json();
        console.timeEnd(`API: /api/translate (to en)`);
        return data.text.trim();
    } catch (error) {
        console.error("Gagal menerjemahkan kueri:", error);
        console.timeEnd(`API: /api/translate (to en)`);
        return query; // Fallback
    }
};

const translateRecipeTitles = async (recipes) => {
    console.time(`API: /api/translate (id-list)`);
    if (!recipes || recipes.length === 0) return recipes;

    const titlesToTranslate = recipes.map(r => r.name).join('\n');
    try {
        const response = await fetch(`/.netlify/functions/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: titlesToTranslate, targetLang: 'id-list' })
        });
        if (!response.ok) throw new Error('Gagal menerjemahkan judul');
        const data = await response.json();
        const translatedTitles = data.text.trim().split('\n');
        
        if (translatedTitles.length === recipes.length) {
            console.timeEnd(`API: /api/translate (id-list)`);
            return recipes.map((recipe, index) => ({ ...recipe, name: translatedTitles[index] }));
        }
        throw new Error('Jumlah terjemahan tidak cocok');
    } catch (error) {
        console.error("Gagal menerjemahkan judul:", error);
        console.timeEnd(`API: /api/translate (id-list)`);
        return recipes; // Fallback
    }
};

const translateToIndonesian = async (query) => {
    console.time(`API: /api/translate (to id)`);
    try {
        const response = await fetch(`/.netlify/functions/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: query, targetLang: 'id' })
        });
        if (!response.ok) throw new Error('Gagal menerjemahkan');
        const data = await response.json();
        console.timeEnd(`API: /api/translate (to id)`);
        return data.text.trim();
    } catch (error) {
        console.error("Gagal menerjemahkan kueri ke ID:", error);
        console.timeEnd(`API: /api/translate (to id)`);
        return query; // Fallback
    }
};

const callGeminiVision = async (base64Image, mimeType = 'image/jpeg') => {
    console.time("API: /api/geminiVision");
    try {
        const response = await fetch(`/.netlify/functions/geminiVision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image, mimeType })
        });
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || 'Gagal menganalisis gambar');
        }
        const data = await response.json();
        
        // Logika untuk memproses respons vision
        const ingredientRaw = data.text.trim();
        const ingredientClean = ingredientRaw.replace(/[.\n]/g, '').replace(/^(Ingredients: |Bahan: )/i, '').replace(/,(?=\s*$)/, '').trim();
        if (ingredientClean.toLowerCase() === 'bukan makanan' || ingredientClean.length === 0) {
            throw new Error("Gambar tidak terdeteksi sebagai bahan makanan.");
        }
        
        console.log("Gemini Vision (Cleaned):", ingredientClean);
        console.timeEnd("API: /api/geminiVision");
        return { ingredient: ingredientClean };

    } catch (error) {
        console.error(`Gagal memanggil Gemini Vision:`, error);
        console.timeEnd("API: /api/geminiVision");
        return { error: true, message: error.message };
    }
};

// --- FUNGSI AI RAG (MEMANGGIL NETLIFY BACKEND) ---
const getAIFriendlyRecipe = async (recipe, details) => {
    console.time(`API: /api/getAIFriendlyRecipe`);
    try {
        const response = await fetch(`/.netlify/functions/getAIFriendlyRecipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipe, details }) // Kirim data resep & detail
        });
        if (!response.ok) throw new Error('Gagal memproses AI resep');
        const data = await response.json();
        console.timeEnd(`API: /api/getAIFriendlyRecipe`);
        return data; // Backend akan mengembalikan format { title, greeting, ... }
    } catch (error) {
        console.error("Gagal memanggil AI RAG:", error);
        console.timeEnd(`API: /api/getAIFriendlyRecipe`);
        // Fallback jika backend gagal
        return { 
            title: `${recipe.name} (Gagal Diterjemahkan)`, 
            greeting: `Resep asli. (Gagal terhubung ke AI: ${error.message})`, 
            friendlyIngredients: details.ingredients.map(ing => `- ${ing}`), 
            friendlySteps: details.steps.map((step, i) => `${i + 1}. ${step}`), 
            closing: `Selamat mencoba!` 
        };
    }
};

// ======================================================
// === SISA DARI APP.JS LAMA ANDA (UI, AUTH, DLL) ===
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Firebase (sudah di atas)
    const auth = firebase.auth();
    const db = firebase.firestore();

    let isPremiumUser = false; // Variabel global
    let currentUser = null;
    let currentRecipes = new Map();
    let savedRecipesMap = new Map(); // Variabel untuk resep tersimpan

    const authContainer = document.getElementById('auth-container');
    const savedMenuButton = document.getElementById('saved-menu-btn'); // Tombol floating
    const savedCountBadge = document.getElementById('saved-count'); // Badge hitungan
    const cameraBtn = document.getElementById('camera-btn');
    const isMainPage = document.getElementById('recommendations-grid');
    const isMenuPage = document.getElementById('all-recipes-grid');
    const authFormContainer = document.getElementById('auth-form-container');
    const isHasilPage = document.getElementById('search-results-grid');
    let cameraStream = null; 

    // --- FUNGSI SIMPAN RESEP ---
    const toggleSaveRecipe = async (recipeId, buttonEl) => {
        if (!currentUser) {
            alert("Anda harus login untuk menyimpan resep.");
            window.location.href = 'login.html';
            return;
        }

        const recipeRef = db.collection('users').doc(currentUser.uid).collection('savedRecipes').doc(recipeId.toString());
        
        let recipeData = currentRecipes.get(recipeId.toString());
        if (!recipeData) {
            recipeData = savedRecipesMap.get(recipeId.toString());
        }

        if (!recipeData) {
            console.error(`Data resep ${recipeId} tidak ditemukan.`);
            // Coba ambil dari tombol jika ada
            const card = buttonEl.closest('[data-recipe-id]');
            const name = card?.querySelector('h3')?.textContent;
            const image = card?.querySelector('img')?.src;
            if(name && image) {
                recipeData = { id: recipeId, name, image };
            } else {
                showToast("Gagal menyimpan: data resep tidak lengkap.", true);
                return;
            }
        }

        const saveIcon = buttonEl.querySelector('svg');
        
       try {
            if (savedRecipesMap.has(recipeId.toString())) {
                await recipeRef.delete();
                savedRecipesMap.delete(recipeId.toString());
                if (saveIcon) saveIcon.setAttribute('fill', 'none');
                showToast("Resep berhasil dihapus");
            } else {
                await recipeRef.set(recipeData); 
                savedRecipesMap.set(recipeId.toString(), recipeData);
                if (saveIcon) saveIcon.setAttribute('fill', 'currentColor');
                showToast("Resep berhasil disimpan"); 
            }
            if (savedCountBadge) savedCountBadge.textContent = savedRecipesMap.size;
        } catch (error) {
            console.error("Gagal menyimpan resep:", error);
            showToast("Gagal memproses resep", true);
        }
    };

    // --- FUNGSI LOAD RESEP ---
    const loadSavedRecipes = async (user) => {
        if (!user) {
            savedRecipesMap.clear();
            if (savedMenuButton) savedMenuButton.classList.add('hidden');
            if (savedCountBadge) savedCountBadge.textContent = '0';
            return;
        }

        if (savedMenuButton) savedMenuButton.classList.remove('hidden');
        
        try {
            const snapshot = await db.collection('users').doc(user.uid).collection('savedRecipes').get();
            savedRecipesMap.clear();
            snapshot.forEach(doc => {
                savedRecipesMap.set(doc.id, doc.data());
            });
            
            if (savedCountBadge) savedCountBadge.textContent = savedRecipesMap.size;
            console.log(`Resep tersimpan dimuat: ${savedRecipesMap.size} item.`);
        } catch (error) {
            console.error("Gagal memuat resep tersimpan:", error);
        }
    };
    
    // --- FUNGSI-FUNGSI UI (RENDER, MODAL, TOAST, DLL) ---
    const renderRecipeCards = (container, recipes, isLockedCheck = () => false) => {
        container.innerHTML = '';
        if (!recipes || recipes.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center text-gray-500">Tidak ada resep yang ditemukan.</p>`;
            return;
        }
        recipes.forEach((recipe, index) => {
            const isLocked = isLockedCheck(index);
            const card = document.createElement('div');
            card.className = `bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col cursor-pointer`;
            card.dataset.recipeId = recipe.id.toString(); 
            if (isLocked) card.dataset.locked = 'true';
            card.innerHTML = `
                <div class="relative h-48">
                    <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.name}" class="w-full h-full object-cover ${isLocked ? 'filter grayscale blur-sm' : ''}" onerror="this.onerror=null; this.src='placeholder.jpg';">
                    ${isLocked ? `<div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-2"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002 2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"></path></svg><span class="font-bold mt-2 text-sm">PRO</span></div>` : ''}
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <h3 class="font-bold text-xl mb-3 text-gray-800 flex-grow">${recipe.name}</h3>
                    <button class="view-recipe-btn w-full mt-auto px-4 py-2 bg-secondary-color text-white font-semibold rounded-full hover:bg-primary-color transition-colors shadow-md group-hover:shadow-lg">Lihat Resep</button>
                </div>`;
            container.appendChild(card);
        });
    };

    const renderError = (container, message) => {
        container.innerHTML = `<div class="col-span-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"><h3 class="font-bold">Terjadi Kesalahan</h3><p>Gagal memuat resep. Pesan: <strong>${message}</strong></p></div>`;
    };
    
    const showModal = (el) => { if (el) el.classList.remove('invisible', 'opacity-0'); document.body.style.overflow = 'hidden'; };
    const stopCamera = () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        const videoElement = document.getElementById('camera-preview');
        if (videoElement) videoElement.srcObject = null;
    };
    const closeAllModals = () => {
        document.querySelectorAll('.modal').forEach(modal => {
            const content = modal.querySelector('.modal-content');
            if (content) content.classList.add('scale-95', 'opacity-0');
            if (modal.id === 'live-camera-modal') stopCamera(); 
            setTimeout(() => { modal.classList.add('invisible', 'opacity-0'); }, 300);
        });
        document.body.style.overflow = '';
    };
    const showToast = (message, isError = false) => {
        const toast = document.createElement('div');
        toast.textContent = message;
        const bgColor = isError ? 'bg-red-600' : 'bg-gray-800';
        toast.className = `fixed bottom-10 left-1/2 -translate-x-1/2 ${bgColor} text-white px-5 py-2 rounded-full shadow-lg z-[9999] transition-all duration-300 ease-out opacity-0 transform translate-y-5`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-5');
            toast.classList.add('opacity-100', 'translate-y-0');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-5');
            toast.addEventListener('transitionend', () => toast.remove());
            setTimeout(() => { if (toast.parentElement) toast.remove(); }, 500);
        }, 1000); 
    };
    const showSavedRecipesModal = () => {
        const modal = document.getElementById('all-recipes-modal');
        if (!modal) return;
        if (savedRecipesMap.size === 0) {
            modal.innerHTML = `<div class="modal-content bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 transform relative text-center"><button class="close-modal-btn absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-600 z-20">&times;</button><h3 class="font-bold text-gray-800 text-2xl">Resep Tersimpan</h3><p class="text-gray-700 mt-4">Anda belum menyimpan resep apapun.</p></div>`;
        } else {
            let cardsHTML = '';
            savedRecipesMap.forEach((recipe) => {
                cardsHTML += `<div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col cursor-pointer h-full" data-recipe-id="${recipe.id}"><div class="relative h-40"><img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='placeholder.jpg';"></div><div class="p-4 flex flex-col flex-grow"><h3 class="font-bold text-lg mb-2 text-gray-800 flex-grow">${recipe.name}</h3><button class="view-recipe-btn w-full mt-auto px-4 py-2 bg-secondary-color text-white text-sm font-semibold rounded-full hover:bg-primary-color transition-colors shadow-md">Lihat Resep</button></div></div>`;
            });
            modal.innerHTML = `<div class="modal-content bg-gray-100 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform scale-95 opacity-0"><div class="p-6 border-b bg-white flex justify-between items-center"><h2 class="font-handwriting text-4xl font-bold text-primary-color">Resep Tersimpan</h2><button class="close-modal-btn text-3xl text-gray-400 hover:text-gray-600 z-20">&times;</button></div><div class="p-6 md:p-8 flex-grow overflow-y-auto"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cardsHTML}</div></div></div>`;
        }
        showModal(modal); 
        setTimeout(() => { const content = modal.querySelector('.modal-content'); if (content) content.classList.remove('scale-95', 'opacity-0'); }, 10);
    };
    
    // --- FUNGSI OPEN RECIPE MODAL ---
    // GANTI FUNGSI LAMA ANDA DENGAN YANG INI
// --- FUNGSI OPEN RECIPE MODAL ---
const openRecipeModal = async (recipeId, currentRecipesMap) => {
    // 1. Ambil data resep dari map
    const recipe = currentRecipesMap.get(recipeId.toString()); 
    if (!recipe) {
        console.error(`Resep ${recipeId} tidak ditemukan di map.`);
        showToast("Gagal memuat resep: data tidak ditemukan.", true);
        return;
    }

    // 2. Tampilkan modal loading
    const recipeModal = document.getElementById('recipe-modal');
    recipeModal.innerHTML = `<div class="flex items-center justify-center w-full h-full"><div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-color"></div></div>`;
    showModal(recipeModal);

    // 3. Panggil backend untuk detail (bahan & langkah)
    const details = await getRecipeDetails(recipeId); 
    if (!details || details.error) {
        recipeModal.innerHTML = `<div class="modal-content bg-white p-8 rounded-2xl text-center"><h3 class="font-bold text-red-600">Gagal Memuat Detail</h3><p>${details?.message || 'Terjadi kesalahan.'}</p></div>`;
        return;
    }

    // 4. Panggil backend untuk terjemahan AI
    //    Backend baru kita (getAIFriendlyRecipe) akan membalas JSON yang sudah rapi
    const friendlyRecipe = await getAIFriendlyRecipe(recipe, details);
    
    // 5. Cek apakah resep ini sudah disimpan
    const isSaved = savedRecipesMap.has(recipeId.toString());

    // 6. Buat HTML konten modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform scale-95 opacity-0';
    
    // --- INI ADALAH BAGIAN PENTING YANG DIPERBAIKI ---
    modalContent.innerHTML = `
    <div class="w-full h-64 flex-shrink-0 relative">
        <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='placeholder.jpg';">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <h2 class="font-handwriting text-5xl md:text-6xl font-bold text-white drop-shadow-lg absolute bottom-4 left-6">${friendlyRecipe.title}</h2>
        <button class="save-recipe-btn absolute top-4 right-14 text-white/80 hover:text-white z-20 p-2 rounded-full hover:bg-black/20" data-recipe-id="${recipe.id.toString()}">
            <svg class="w-6 h-6" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
        </button>
        <button class="close-modal-btn absolute top-4 right-4 text-3xl text-white/80 hover:text-white z-20">&times;</button>
    </div>
    <div class="p-6 md:p-8 flex-grow overflow-y-auto">
        <p class="text-gray-600 italic mb-6 text-lg">${friendlyRecipe.greeting}</p>
        
        <h3 class="font-bold text-xl mb-3 text-primary-color text-left">Bahan-Bahan</h3>
                <ul class="space-y-2 text-gray-700 list-disc list-outside pl-5 text-left">
            ${friendlyRecipe.friendlyIngredients.map(ing => `<li>${ing.replace(/^-|\*/, '').trim()}</li>`).join('')}
        </ul>
        
        <h3 class="font-bold text-xl mb-3 mt-8 text-primary-color text-left">Langkah-Langkah</h3>
                <ol class="space-y-4 text-gray-700 list-decimal list-outside pl-5 text-left">
            ${friendlyRecipe.friendlySteps.map(step => `<li>${step.replace(/^\d+\.?\s/, '').trim()}</li>`).join('')}
        </ol>
        
        <p class="mt-8 text-sm text-gray-500 italic text-left">${friendlyRecipe.closing}</p>
    </div>`;
    // --- AKHIR BAGIAN PENTING ---

    // 7. Tampilkan konten modal
    recipeModal.innerHTML = ''; // Hapus spinner
    recipeModal.appendChild(modalContent); // Tambahkan konten baru
    setTimeout(() => modalContent.classList.remove('scale-95', 'opacity-0'), 10);
};
    // --- FUNGSI KAMERA ---
    const startCamera = async () => {
        const liveCameraModal = document.getElementById('live-camera-modal');
        const videoElement = document.getElementById('camera-preview');
        const errorContainer = document.getElementById('camera-error');
        const errorMessageElement = document.getElementById('camera-error-message');
        if (!navigator.mediaDevices?.getUserMedia) {
            errorMessageElement.textContent = "Browser tidak mendukung kamera.";
            errorContainer.classList.remove('hidden');
            showModal(liveCameraModal);
            const content = liveCameraModal.querySelector('.modal-content');
            if (content) setTimeout(() => content.classList.remove('scale-95', 'opacity-0'), 10);
            return;
        }
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            videoElement.srcObject = cameraStream;
            errorContainer.classList.add('hidden');
            showModal(liveCameraModal);
            const content = liveCameraModal.querySelector('.modal-content');
            if (content) setTimeout(() => content.classList.remove('scale-95', 'opacity-0'), 10);
        } catch (err) {
            console.error("Error akses kamera:", err);
            let message = "Error akses kamera.";
            if (err.name === "NotAllowedError") message = "Izin akses kamera ditolak.";
            else if (err.name === "NotFoundError") message = "Kamera tidak ditemukan.";
            else if (err.name === "NotReadableError") message = "Kamera sedang digunakan aplikasi lain.";
            errorMessageElement.textContent = message;
            errorContainer.classList.remove('hidden');
            showModal(liveCameraModal); // Tetap tampilkan modal error
            const content = liveCameraModal.querySelector('.modal-content');
            if (content) setTimeout(() => content.classList.remove('scale-95', 'opacity-0'), 10);
        }
    };
    const takePhoto = () => {
        const videoElement = document.getElementById('camera-preview');
        const canvas = document.getElementById('photo-canvas');
        const context = canvas.getContext('2d');
        if (videoElement.readyState >= 3) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const base64ImageData = canvas.toDataURL('image/jpeg');
            stopCamera(); 
            closeAllModals(); 
            const base64String = base64ImageData.split(',')[1];
            processImageAndSearch(base64String, 'image/jpeg'); 
        } else {
            alert("Kamera belum siap.");
        }
    };
    
    // --- FUNGSI PROCESS IMAGE ---
    const processImageAndSearch = async (base64String, mimeType) => {
        const modal = document.getElementById('all-recipes-modal'); 
        if (!modal) return;
        modal.innerHTML = `<div class="flex items-center justify-center w-full h-full"><div class="flex flex-col items-center"><div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-color"></div><p class="mt-4 text-white font-semibold">Menganalisis gambar...</p></div></div>`;
        showModal(modal);
        try {
            // Memanggil backend
            const result = await callGeminiVision(base64String, mimeType);
            if (result.error) throw new Error(result.message);

            const englishIngredient = result.ingredient;
            // Memanggil backend
            const indonesianIngredient = await translateToIndonesian(englishIngredient); 

            console.log(`Hasil analisis gambar: '${indonesianIngredient}' (English: '${englishIngredient}'). Mengarahkan ke hasil.html...`);
            window.location.href = `hasil.html?tipe=bahan&kueri=${encodeURIComponent(indonesianIngredient)}&kueri_en=${encodeURIComponent(englishIngredient)}`;

        } catch (error) {
            modal.innerHTML = `<div class="modal-content bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 transform relative text-center"><button class="close-modal-btn absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-600 z-20">&times;</button><h3 class="font-bold text-red-600 text-2xl">Gagal Menganalisis</h3><p class="text-gray-700 mt-2">${error.message}</p></div>`;
        }
    };


    // --- LOGIKA AUTENTIKASI ---
    const updateAuthUI = async (user) => {
        const relevantUIExists = authContainer || (isMainPage || isMenuPage || isHasilPage); 
        if (!relevantUIExists) return; 

        if (user) {
            currentUser = user;
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (userDoc.exists) {
                    // Membaca 'is_premium' (sesuai alur baru)
                    const premiumStatus = userDoc.data().is_premium;
                    
                    if (premiumStatus === true) { 
                        isPremiumUser = true; 
                    } else {
                        isPremiumUser = false; 
                    }
                } else {
                    isPremiumUser = false; 
                }
            } catch (error) {
                console.error("Gagal membaca Firestore:", error.message); 
                isPremiumUser = false; 
            }
            
            if(authContainer) {
                const userPhoto = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=ffb74d&color=fff`;
                authContainer.innerHTML = `<div class="flex items-center space-x-4"><img src="${userPhoto}" alt="User" class="w-10 h-10 rounded-full border-2 border-white shadow-md"><button id="logout-btn" class="text-sm font-semibold text-gray-600 hover:text-primary-color">Keluar</button></div>`;
                if (cameraBtn) cameraBtn.querySelector('span')?.classList.toggle('hidden', isPremiumUser); 
                }
            } else {
            currentUser = null;
            isPremiumUser = false; 
            if(authContainer){
              	 authContainer.innerHTML = `<a href="login.html" class="bg-orange-500 text-white font-bold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors shadow-lg">Login</a>`;
              	 if (cameraBtn) cameraBtn.querySelector('span')?.classList.remove('hidden');
            }
        }
        console.log(`updateAuthUI: Fungsi selesai. isPremiumUser FINAL: ${isPremiumUser}`); 
    };

    const signOut = () => {
        auth.signOut().then(() => window.location.reload());
    };

    // --- FUNGSI LOAD SEARCH RESULTS ---
    const loadSearchResults = async () => {
        const resultsGrid = document.getElementById('search-results-grid'); 
      	 if (!resultsGrid) return; 

        const searchTitleElement = document.getElementById('search-title');
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('kueri'); 
      	 const queryEn = urlParams.get('kueri_en'); 
      	 const type = urlParams.get('tipe'); 
      	 const count = 24; 

      	 if (!query || !queryEn || !type) {
          	 renderError(resultsGrid, "Parameter pencarian tidak lengkap di URL.");
          	 if (searchTitleElement) searchTitleElement.textContent = "Error Pencarian";
          	 return;
      	 }

      	 if (searchTitleElement) searchTitleElement.textContent = `Hasil untuk "${query}"`;
      	 resultsGrid.innerHTML = `<div class="col-span-full text-center py-10"><div class="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary-color mx-auto"></div><p class="mt-2 text-gray-600">Mencari resep...</p></div>`; 

      	 let searchResults;
      	 try {
          	 if (type === 'bahan') {
            	 	 searchResults = await findRecipesByIngredient(queryEn, count); // Panggil API
          	 } else { 
            	 	 searchResults = await findRecipesByQuery(queryEn, count); // Panggil API
          	 }

          	 if (searchResults.error) {
            	 	 renderError(resultsGrid, searchResults.message);
          	 } else if (!searchResults || searchResults.length === 0) {
            	 	 	resultsGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Tidak ada resep yang ditemukan untuk "${query}".</p>`;
        	  } else {
            	 	 searchResults = await translateRecipeTitles(searchResults); // Panggil API
            	 	 searchResults.forEach(r => currentRecipes.set(r.id.toString(), r)); 
            	 	 renderRecipeCards(resultsGrid, searchResults, (index) => !isPremiumUser && index > 0);
          	 }
      	 } catch (error) {
          	 renderError(resultsGrid, error.message || "Terjadi kesalahan saat mencari resep.");
      	 }
    };

    // ===== onAuthStateChanged (INTI LOGIKA) =====
    auth.onAuthStateChanged(async (user) => {
      	 await updateAuthUI(user); 
      	 await loadSavedRecipes(user); 
      	 
      	 console.log('>>> onAuthStateChanged: isPremiumUser SEKARANG:', isPremiumUser); 
      	 
      	 if (!window.appInitialized) { 
          	 console.log("Mulai inisialisasi halaman...");
          	 if (isMainPage) {
            	 	 initializeDashboard(); 
          	 } 
          	 else if (isMenuPage) {
                const urlParams = new URLSearchParams(window.location.search);
            	 	 const categoryFromURL = urlParams.get('kategori');
            	 	 let initialButtonClicked = false;
            	 	 if (categoryFromURL) {
              	 	 	 const targetButton = Array.from(document.querySelectorAll('.filter-btn')).find(btn => btn.dataset.category.toLowerCase() === categoryFromURL.toLowerCase());
              	 	 	 if (targetButton) { 
              	 	 	 	 handleFilterClick(targetButton); 
              	 	 	 	 initialButtonClicked = true; 
              	 	 	 }
            	 	 }
            	 	 if (!initialButtonClicked) {
             	 	 	 const firstButton = document.querySelector('.filter-btn');
              	 	 	 if (firstButton) handleFilterClick(firstButton); 
            	 	 }
          	 } 
          	 else if (isHasilPage) {
            	 	 loadSearchResults(); 
          	 }
          	 window.appInitialized = true; 
      	 }
    });

    // --- FUNGSI INIT DASHBOARD ---
    const initializeDashboard = async () => {
        if (!isMainPage) return;
        isMainPage.innerHTML = `<div class="col-span-full text-center py-10"><div class="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary-color mx-auto"></div></div>`;
        let randomRecipes = await getRecipes(3); // Panggil API
        if (randomRecipes.error) renderError(isMainPage, randomRecipes.message);
        else {
            randomRecipes = await translateRecipeTitles(randomRecipes); // Panggil API
            randomRecipes.forEach(r => currentRecipes.set(r.id.toString(), r)); 
            renderRecipeCards(isMainPage, randomRecipes, (index) => !isPremiumUser && index > 0); 
        }
    };

    // --- FUNGSI HANDLE FILTER ---
    const handleFilterClick = async (clickedButton) => {
        if (!clickedButton || !isMenuPage) return;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
        const category = clickedButton.dataset.category;
        const recipeCount = (category === 'semua') ? 30 : 20;
      	 isMenuPage.innerHTML = `<div class="col-span-full text-center py-10"><div class="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary-color mx-auto"></div></div>`;
      	 const englishCategory = await translateToEnglish(category); // Panggil API
      	 let recipes = (category === 'semua') ? await getRecipes(recipeCount) : await findRecipesByQuery(englishCategory, recipeCount); // Panggil API
      	 if (recipes.error) renderError(isMenuPage, recipes.message);
      	 else {
        	 	 recipes = await translateRecipeTitles(recipes); // Panggil API
        	 	 recipes.forEach(r => currentRecipes.set(r.id.toString(), r)); 
        	 	 renderRecipeCards(isMenuPage, recipes, (index) => !isPremiumUser && index > 0);
      	 }
    };


    // --- EVENT LISTENER HALAMAN UTAMA ---
   if (isMainPage) {
      	 const searchForm = document.getElementById('search-form');
      	 searchForm.addEventListener('submit', async (e) => {
        	 	 e.preventDefault(); 
        	 	 const query = document.getElementById('search-input').value.trim();
        	 	 if (query) {
          	 	 	 const englishQuery = await translateToEnglish(query); // Panggil API
          	 	 	 window.location.href = `hasil.html?tipe=bahan&kueri=${encodeURIComponent(query)}&kueri_en=${encodeURIComponent(englishQuery)}`;
        	 	 }
      	 });
        const categoryGrid = document.getElementById('category-grid');
      	 if (categoryGrid) categoryGrid.addEventListener('click', (e) => { 
        	 	 e.preventDefault(); 
        	 	 const categoryLink = e.target.closest('.category-item');
        	 	 if (categoryLink) { 
          	 	 	 const categoryName = categoryLink.dataset.category; 
          	 	 	 if (categoryName) {
          	 	 	 	 window.location.href = `menu.html?kategori=${encodeURIComponent(categoryName)}`; 
          	 	 	 }
        	 	 }
      	 });
        if (cameraBtn) {
        	 	 cameraBtn.addEventListener('click', () => { 
          	 	 	 if (isPremiumUser) {
          	 	 	 	 startCamera(); 
          	 	 	 } else { 
          	 	 	 	 window.location.href = 'login.html'; 
          	 	 	 }
        	 	 });
      	 }
    }


  	 // --- EVENT LISTENER HALAMAN LOGIN ---
  	 if (authFormContainer) {
      	 const renderAuthForm = (isRegister = false) => {
        	 	 const title = isRegister ? 'Daftar Akun Baru' : 'Login ke KokiKu';
        	 	 const buttonText = isRegister ? 'Daftar & Bayar' : 'Login'; 
        	 	 const switchText = isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar';
        	   const formId = isRegister ? 'register-form' : 'login-form';
        	   const switchId = isRegister ? 'switch-to-login' : 'switch-to-register';
        	 	 authFormContainer.innerHTML = `
          	 	 	 <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">${title}</h2>
          	 	 	 <p class="text-gray-500 mb-6 text-center">${isRegister ? 'Selesaikan pendaftaran untuk menjadi premium.' : 'Selamat datang kembali!'}</p>
          	 	 	 <div id="auth-error" class="text-red-500 text-sm mb-4 text-center"></div>
          	 	 	 <form id="${formId}" class="space-y-4">
          	 	 	 	 ${isRegister ? '<input type="text" name="name" placeholder="Nama Lengkap" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color/50" required>' : ''}
          	 	 	 	 <input type="email" name="email" placeholder="Email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color/50" required>
          	 	 	 	 <input type="password" name="password" placeholder="Password (min. 6 karakter)" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color/50" required>
          	 	 	 	 <button type="submit" class="w-full bg-primary-color text-white font-bold py-3 rounded-lg hover:bg-opacity-90">${buttonText}</button>
          	 	 	 </form>
          	 	 	 <p class="text-sm text-gray-500 my-4 text-center">atau</p>
          	 	 	 <button id="google-login-btn" class="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-semibold hover:bg-gray-50">
                        <svg class="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#34A853" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C8.167,40.649,15.594,44,24,44z"></path><path fill="#FBBC05" d="M12.717,28.707c-0.639-1.802-0.999-3.72-0.999-5.707s0.36-3.905,0.999-5.707l-6.522-5.025C4.945,15.101,4,19.384,4,24c0,4.616,0.945,8.899,2.195,12.732L12.717,28.707z"></path><path fill="#EA4335" d="M24,12c2.438,0,4.717,0.854,6.546,2.571l5.657-5.657C34.046,6.053,29.268,4,24,4C15.594,4,8.167,7.351,6.192,13.268l6.522,5.025C14.381,15.317,18.798,12,24,12z"></path><path fill="none" d="M4,4h40v40H4z"></path></svg>
          	 	 	 	 <span>Lanjutkan dengan Google</span>
          	 	 	 </button>
          	 	 	 <button id="${switchId}" class="text-sm text-primary-color hover:underline mt-6 w-full text-center">${switchText}</button>
        	 	 	`;
      	 };

      	 // --- FUNGSI LOGIN/REGISTRASI (DIPERBARUI DAN DIPERBAIKI) ---
      	 const handleAuthFormSubmit = async (e) => {
        	 	 e.preventDefault();
        	 	 const email = e.target.email.value;
        	 	 const password = e.target.password.value;
        	 	 const errorDiv = document.getElementById('auth-error');
        	 	 errorDiv.textContent = '';

        	 	 if (e.target.id === 'login-form') {
          	 	 	 // --- LOGIKA LOGIN ---
          	 	 	 try {
          	 	 	 	 const userCredential = await auth.signInWithEmailAndPassword(email, password);
          	 	 	 	 const user = userCredential.user;
          	 	 	 	 const userDoc = await db.collection('users').doc(user.uid).get();
          	 	 	 	 if (userDoc.exists && (userDoc.data().status === 'PENDING_PAYMENT')) {
          	 	 	 	 	 window.location.href = 'pembayaran.html';
          	 	 	 	 } else {
          	 	 	 	 	 window.location.href = 'index.html';
                         // *** KESALAHAN TIK (HURUF 'a') SUDAH DIHAPUS DARI SINI ***
          	 	 	 	 }
          	 	 	 } catch (err) {
                        console.error("Error login:", err);
          	 	 	 	 errorDiv.textContent = "Email atau password salah.";
          	 	 	 }
        	 	 } else {
          	 	 	 // --- LOGIKA REGISTRASI ---
          	 	 	 const name = e.target.name.value;
          	 	 	 try {
          	 	 	 	 // 1. Buat user di Firebase Authentication
          	 	 	 	 const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          	 	 	 	 const user = userCredential.user;
          	 	 	 	 await user.updateProfile({ displayName: name });
    
          	 	 	 	 // 2. Buat dokumen user di Firestore (PENTING)
          	     	 await db.collection('users').doc(user.uid).set({
          	     	 	 name: name,
          	     	 	 email: user.email,
          	     	 	 uid: user.uid,
          	     	 	 is_premium: false, // <-- Menggunakan snake_case
          	     	 	 status: "PENDING_PAYMENT", 
          	     	 	 createdAt: firebase.firestore.FieldValue.serverTimestamp()
          	     	 });
    
          	 	 	 	 // 3. Pindahkan pengguna ke halaman pembayaran
          	 	 	 	 window.location.href = '/pembayaran.html';

          	 	 	 } catch (err) {
          	 	 	 	 console.error("Error saat mendaftar:", err);
                        if (err.code === 'auth/weak-password') {
                            errorDiv.textContent = 'Password terlalu lemah (minimal 6 karakter).';
                        } else if (err.code === 'auth/email-already-in-use') {
                            errorDiv.textContent = 'Email ini sudah terdaftar. Silakan login.';
                        } else {
          	 	 	 	    errorDiv.textContent = err.message;
                        }
          	 	 	 }
        	 	 }
      	 };

      	 // --- FUNGSI LOGIN GOOGLE ---
      	 const signInWithGoogle = async () => {
        	 	 const provider = new firebase.auth.GoogleAuthProvider();
        	 	 const errorDiv = document.getElementById('auth-error');
        	 	 if(errorDiv) errorDiv.textContent = '';
        	 	 
        	 	 try {
          	 	 	 const result = await auth.signInWithPopup(provider);
          	 	 	 const user = result.user;
          	 	 	 const userRef = db.collection('users').doc(user.uid);
          	 	 	 const doc = await userRef.get();
          	 	 	 
          	 	 	 if (!doc.exists) {
          	 	 	 	 // --- PENGGUNA GOOGLE BARU ---
          	 	     await userRef.set({
          	 	     	 name: user.displayName,
          	 	     	 email: user.email,
          	 	     	 uid: user.uid,
          	 	     	 is_premium: false, // <-- Menggunakan snake_case
          	 	     	 status: "PENDING_PAYMENT", 
          	 	     	 createdAt: firebase.firestore.FieldValue.serverTimestamp()
          	 	     });
          	 	 	 	 window.location.href = 'pembayaran.html';
          	 	 	 } else {
          	 	 	 	 // --- PENGGUNA GOOGLE LAMA ---
          	 	 	 	 if (doc.data().status === 'PENDING_PAYMENT') {
          	 	 	 	 	 window.location.href = 'pembayaran.html'; 
          	 	 	 	 } else {
          	 	 	 	 	 window.location.href = 'index.html'; 
          	 	 	 	 }
          	 	 	 }
        	 	 } catch (error) {
          	 	 	 if (errorDiv) errorDiv.textContent = error.message;
          	 	 	 console.error("Error Google Sign-in:", error);
        	 	 }
      	 };

      	 // --- Listener ---
      	 authFormContainer.addEventListener('click', (e) => {
        	 	 if (e.target.closest('#switch-to-register')) renderAuthForm(true);
        	 	 if (e.target.closest('#switch-to-login')) renderAuthForm(false);
        	 	 if (e.target.closest('#google-login-btn')) signInWithGoogle();
      	 });
      	 authFormContainer.addEventListener('submit', handleAuthFormSubmit);
      	 renderAuthForm(false); // Render form login sebagai default
    }

    // --- Event Listener Halaman Menu (menu.html) ---
   if (isMenuPage) {
    	 	 const filterButtons = document.querySelectorAll('.filter-btn');
    	 	 filterButtons.forEach(btn => btn.addEventListener('click', (e) => handleFilterClick(e.target.closest('.filter-btn'))));
    }

    // --- Event Listener Global ---
  	 const takePhotoButton = document.getElementById('take-photo-btn');
  	 if (takePhotoButton) {
    	 	 takePhotoButton.addEventListener('click', takePhoto); 
  	 }
  	 if (savedMenuButton) {
    	 	 savedMenuButton.addEventListener('click', () => {
      	 	 	 if (!currentUser) {
        	 	 	 	 window.location.href = 'login.html';
        	 	 	 	 return;
      	 	 	 }
      	 	 	 showSavedRecipesModal();
    	 	 });
  	 }

  	 document.addEventListener('click', (e) => {
    	 	 if (e.target.id === 'logout-btn') signOut();

    	 	 const saveButton = e.target.closest('.save-recipe-btn');
    	 	 if (saveButton) {
      	 	 	 if (!currentUser) {
        	 	 	 	 window.location.href = 'login.html';
        	 	 	 	 return;
      	 	 	 }
      	 	 	 const recipeId = saveButton.dataset.recipeId; 
      	 	 	 toggleSaveRecipe(recipeId, saveButton);
      	 	 	 return; 
    	 	 }
      	 
    	 	 const card = e.target.closest('[data-recipe-id]');
    	 	 const closeModalButton = e.target.closest('.close-modal-btn');
    	 	 const isTakingPhoto = document.getElementById('live-camera-modal')?.contains(e.target) && e.target.id !== 'take-photo-btn';
    	 	 if (closeModalButton && !isTakingPhoto) { closeAllModals(); return; }

    	 	 if (card) {
      	 	 	 const recipeId = card.dataset.recipeId; 
      	 	 	 if (card.dataset.locked === 'true' && !isPremiumUser) { 
        	 	 	 	 console.log("Klik pada kartu terkunci DITOLAK (bukan premium). Mengarahkan ke login...");
        	 	 	 	 window.location.href = 'login.html';
      	 	 	 } else {
        	 	 	 	 const parentModal = card.closest('.modal');
        	 	 	 	 if (parentModal && parentModal.id === 'recipe-modal') return; 

        	 	 	 	 else if (parentModal) { 
          	 	 	 	 	 if (parentModal.id === 'all-recipes-modal') {
          	 	 	 	 	 	 parentModal.classList.add('invisible', 'opacity-0');
          	 	 	 	 	 	 setTimeout(() => { openRecipeModal(recipeId, savedRecipesMap); }, 300); 
          	 	 	 	 	 } else {
          	 	     	 	 	 parentModal.classList.add('invisible', 'opacity-0'); 
          	 	     	 	 	 stopCamera(); 
          	 	     	 	 	 setTimeout(() => { openRecipeModal(recipeId, currentRecipes); }, 300);
          	 	   	 	 }
        	 	 	 	 } 
        	 	 	 	 else { 
          	 	 	 	 	 openRecipeModal(recipeId, currentRecipes); 
        	 	 	 	 }
        	 	 	 }
      	 	 }
    	 });

    window.appInitialized = false;
}); // Akhir DOMContentLoaded