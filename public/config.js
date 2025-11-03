// File: config.js (atau public/config.js)

// 1. Ambil config dari Firebase Console (Project Settings > General > Your apps)
export const firebaseConfig = {
  apiKey: "AIzaSy...KUNCI_PUBLIK_ANDA...",
  authDomain: "papaya-marzipan-d111ed.firebaseapp.com",
  projectId: "papaya-marzipan-d111ed",
  storageBucket: "papaya-marzipan-d111ed.appspot.com",
  messagingSenderId: "...",
  appId: "..."
  // (Pastikan Anda menggunakan kunci asli dari Firebase Anda)
};

// JANGAN panggil firebase.initializeApp(firebaseConfig) di sini.
// File app.js Anda sudah melakukannya, jadi biarkan app.js yang mengurusnya.