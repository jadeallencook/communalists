import { initializeApp } from 'firebase/app';

const app = initializeApp(
    (!!process.env.FIREBASE_CONFIG &&
        JSON.parse(process.env.FIREBASE_CONFIG)) || {
        apiKey: 'AIzaSyAPLOZVUrbC3K6YK72IW0wBufCOLZcEEhY',
        authDomain: 'communalists-test.firebaseapp.com',
        projectId: 'communalists-test',
        storageBucket: 'communalists-test.appspot.com',
        messagingSenderId: '697702436149',
        appId: '1:697702436149:web:5cc3ac450c6ef3e54f107c',
        measurementId: 'G-K6JB24D6F1',
    }
);

export default app;
