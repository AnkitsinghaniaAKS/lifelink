import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwO4YshPMQaS36o3CXqoE2G7YyXEw1qIo",
  authDomain: "lifelink-9ae6c.firebaseapp.com",
  projectId: "lifelink-9ae6c",
  storageBucket: "lifelink-9ae6c.firebasestorage.app",
  messagingSenderId: "148399440429",
  appId: "1:148399440429:web:8e1002972319f4b9782ea4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;