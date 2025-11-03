// File: netlify/functions/createInvoice.js (Perbaikan Final v4 - camelCase)

const Xendit = require('xendit-node').Xendit; 
const admin = require('firebase-admin');

// --- Inisialisasi Firebase Admin ---
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
if (admin.apps.length === 0) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

// --- Inisialisasi Xendit ---
const x = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY }); 

exports.handler = async (event, context) => {
    const { uid, email, name } = JSON.parse(event.body);

    if (!uid || !email) { 
        return { statusCode: 400, body: JSON.stringify({ message: 'UID dan email pengguna tidak boleh kosong.' }) };
    }

    const baseUrl = event.headers['x-forwarded-proto'] + '://' + event.headers.host;
    const successUrl = baseUrl + '/pembayaran-sukses.html';
    const failureUrl = baseUrl + '/pembayaran-gagal.html';

    const externalId = `KOKIKU-${uid.substring(0, 10)}-${Date.now()}`; 
    const amount = 25000;
    const finalName = name && name !== email.split('@')[0] ? name : "Pengguna Premium";

    // ================== PERBAIKKAN DI SINI ==================
    // 1. KEMBALI menggunakan bungkusan "data: { ... }"
    // 2. KEMBALI menggunakan fungsi "createInvoice"
    // 3. MENGGUNAKAN "camelCase" (e.g., externalId) untuk semua field
    
    const invoiceParams = {
        data: { 
            externalId: externalId,         // <-- Diganti ke camelCase
            payerEmail: email,          // <-- Diganti ke camelCase
            description: "Langganan Premium KokiKu", 
            amount: amount,
            customer: {
                given_names: finalName,
                email: email
            },
            successRedirectUrl: successUrl, // <-- Diganti ke camelCase
            failureRedirectUrl: failureUrl, // <-- Diganti ke camelCase
            invoiceDuration: 86400 
        }
    };
    // =========================================================

    console.log("Mencoba membuat invoice (v4 - camelCase) dengan data:", JSON.stringify(invoiceParams, null, 2));

    try {
        // 3. KEMBALI menggunakan fungsi "createInvoice"
        const invoiceData = await x.Invoice.createInvoice(invoiceParams);

        // 4. Simpan externalID di dokumen user Firebase
        await db.collection('users').doc(uid).set({
            pending_order_id: externalId
        }, { merge: true }); 

        // 5. Kirim kembali URL pembayaran ke payment.js
        return {
            statusCode: 200,
            // Respons Xendit menggunakan snake_case, jadi ini tetap
            body: JSON.stringify({ invoiceUrl: invoiceData.invoice_url }) 
        };

    } catch (error) {
         console.error("--- 🔴 ERROR XENDIT 🔴 ---");
        console.error("Pesan Error Singkat:", error.message);
        console.error("Detail Error Lengkap dari Xendit:", JSON.stringify(error, null, 2));

        return { 
            statusCode: 400, 
            body: JSON.stringify({ 
                message: "Gagal membuat invoice.", 
                detail: error.message,
                xendit_error: error.response ? error.response.message : "Error tidak diketahui"
            }) 
        };
    }
};