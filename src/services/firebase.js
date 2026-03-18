import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Post a new comment to Firestore
 * @param {Object} commentData - { name, content }
 */
export const postComment = async (commentData) => {
    try {
        await addDoc(collection(db, "comments"), {
            ...commentData,
            created_at: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

/**
 * Subscribe to comments collection
 * @param {Function} callback - Function to call with updated comments list
 * @param {Function} errorCallback - Function to call on error
 */
export const subscribeToComments = (callback, errorCallback) => {
    const q = query(collection(db, "comments"), orderBy("created_at", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        callback(comments);
    }, (error) => {
        console.error("Error subscribing to comments: ", error);
        if (errorCallback) errorCallback(error);
    });
};
