// File: public/payment.js (Untuk Xendit)
import { firebaseConfig } from './config.js';

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('pay-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const userEmailDisplay = document.getElementById('user-email');
    
    let currentUser = null;

    // --- LOGIKA UTAMA ---
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (userDoc.exists && userDoc.data().is_premium === true) {
                    alert('Akun Anda sudah premium! Mengalihkan ke halaman utama.');
                    window.location.href = 'index.html';
                } else if (userDoc.exists && userDoc.data().status === 'PENDING_PAYMENT') {
                    payButton.classList.remove('hidden');
                    loadingSpinner.classList.add('hidden');
                } else {
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Gagal memverifikasi status:', error);
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- LOGIKA PEMBAYARAN XENDIT ---
    payButton.addEventListener('click', async () => {
        if (!currentUser) return;

        payButton.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        loadingSpinner.innerHTML = "<p>Membuat tagihan Xendit...</p>";

        try {
            // 1. Panggil backend Netlify untuk membuat invoice
            // File: public/payment.js
// ...
        // 1. Panggil backend Netlify untuk membuat invoice
        if (!currentUser.email) {
            throw new Error("Email pengguna hilang. Silakan Login ulang.");
        }
        
        :
const response = await fetch('/.netlify/functions/createInvoice'), {
// ...
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    uid: currentUser.uid, 
                    email: currentUser.email, 
                    name: currentUser.displayName || currentUser.email.split('@')[0]
                })
            });
            
            if (!response.ok) {
                // Tangkap error 400 dari Xendit
                const err = await response.json();
                throw new Error(err.message);
            }

            const data = await response.json();
            const invoiceUrl = data.invoiceUrl; // Backend Xendit kirim URL pembayaran

            // 2. Arahkan pengguna ke halaman pembayaran Xendit
            window.location.href = invoiceUrl;

        } catch (error) {
            console.error('Gagal memproses pembayaran:', error);
            alert(`Gagal membuat tagihan: ${error.message}.`);
            
            // Kembalikan tombol agar pengguna bisa coba lagi
            payButton.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            loadingSpinner.innerHTML = "<p>Memverifikasi status Anda...</p>";
        }
    });
});
