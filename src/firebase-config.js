// ============================================================
// FIREBASE CONFIG – 200 Racing
// ------------------------------------------------------------
// INSTRUÇÕES DE SETUP:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um projeto chamado "200racing"
// 3. Ative Authentication → Sign-in method → Google
// 4. Ative Firestore Database (modo production)
// 5. Vá em Configurações do projeto → Seus apps → Web
// 6. Copie o firebaseConfig e substitua abaixo
// 7. No Firestore, defina estas regras de segurança:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /products/{id} {
//          allow read: if true;
//          allow write: if request.auth != null &&
//            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
//        }
//        match /orders/{id} {
//          allow read, write: if request.auth != null &&
//            (request.auth.uid == resource.data.userId ||
//             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
//          allow create: if request.auth != null;
//        }
//        match /users/{uid} {
//          allow read, write: if request.auth != null && request.auth.uid == uid;
//          allow read: if request.auth != null &&
//            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
//        }
//      }
//    }
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDkAfoUslO4cG1HcUi5Xhqg9oXoEc525i4",
  authDomain: "racing-1409d.firebaseapp.com",
  projectId: "racing-1409d",
  storageBucket: "racing-1409d.firebasestorage.app",
  messagingSenderId: "788815063880",
  appId: "1:788815063880:web:42c908e34fd997195f617d"
};

// Import via CDN (usado nos HTMLs com type="module")
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ── AUTH HELPERS ─────────────────────────────────────────────
async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      role: "customer",
      createdAt: serverTimestamp()
    });
  }
  return user;
}

async function logout() {
  await signOut(auth);
  window.location.href = "/index.html";
}

async function getCurrentUserRole(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : null;
}

// ── PRODUCT HELPERS ──────────────────────────────────────────
async function getProducts(category = null) {
  let q = category
    ? query(collection(db, "products"), where("category", "==", category), orderBy("name"))
    : query(collection(db, "products"), orderBy("category"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function saveProduct(data, id = null) {
  if (id) {
    await updateDoc(doc(db, "products", id), { ...data, updatedAt: serverTimestamp() });
    return id;
  } else {
    const ref = await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  }
}

async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

// ── ORDER HELPERS ─────────────────────────────────────────────
async function createOrder(userId, items, total, paymentMethod, customerData) {
  return await addDoc(collection(db, "orders"), {
    userId, items, total, paymentMethod, customerData,
    status: "pending",
    createdAt: serverTimestamp()
  });
}

async function getUserOrders(userId) {
  const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getAllOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export {
  auth, db, googleProvider,
  loginWithGoogle, logout, getCurrentUserRole, onAuthStateChanged,
  getProducts, saveProduct, deleteProduct,
  createOrder, getUserOrders, getAllOrders,
  doc, getDoc, updateDoc, collection, getDocs, serverTimestamp
};
