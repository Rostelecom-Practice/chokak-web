import { initializeApp } from "firebase/app";
import { 
  getAuth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


export const loginUser = async () => {
  try {
    //const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //const user = userCredential.user;
    const user =   auth.currentUser;

    console.log("Текущий user:", user);

    const idToken = await user.getIdToken();
    const localId = user.uid;

    console.log("Успешный вход:", { localId, idToken });
    return { localId, idToken };
  } catch (error) {
    console.error("Ошибка входа:", error.message);
    throw error;
  }
};