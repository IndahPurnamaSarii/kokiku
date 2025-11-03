// File: netlify/functions/paymentWebhook.js

const Xendit = require('xendit-node').Xendit; // Perbaikan Impor
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
const x = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY }); // Gunakan 'new'

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // 1. Verifikasi Xendit Webhook Token (KEAMANAN PENTING)
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
    const receivedToken = event.headers['x-callback-token'];

    if (!receivedToken || receivedToken !== webhookToken) {
        console.warn("Webhook: Token Xendit tidak cocok atau hilang.");
        return { statusCode: 403, body: 'Forbidden: Invalid token' };
    }
    
    // Ambil data notifikasi
    let notification;
    try {
        notification = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON body' };
    }

    const externalId = notification.external_id; 
    const status = notification.status; 

    console.log(`Webhook Xendit diterima: Order ID ${externalId}, Status: ${status}`);

    // 2. Proses hanya jika statusnya PAID
    if (status === 'PAID') {
        try {
            // Cari user di Firebase Firestore berdasarkan externalID (Order ID)
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('pending_order_id', '==', externalId).limit(1).get();

            if (snapshot.empty) {
                console.warn(`Webhook: Order ID ${externalId} tidak ditemukan di dokumen user.`);
                return { statusCode: 404, body: 'User not found' };
            }

            // Dapatkan user
            const userDoc = snapshot.docs[0];
            
            // 3. Update user menjadi Premium
            await userDoc.ref.update({
                is_premium: true,
                status: "ACTIVE",
                pending_order_id: admin.firestore.FieldValue.delete(),
                payment_details: { status: status, external_id: externalId, paid_amount: notification.paid_amount }
            });

            console.log(`SUKSES: User ${userDoc.id} berhasil di-upgrade via Xendit.`);
            
        } catch (error) {
            console.error("Webhook Update Firebase Error:", error);
            return { statusCode: 500, body: 'Internal Server Error while updating Firebase' };
        }
    }

    // 4. Kirim balasan 200 OK ke Xendit
    return { statusCode: 200, body: 'OK' };
};