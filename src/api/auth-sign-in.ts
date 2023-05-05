import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);
const authSignIn = async (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
        .then(() => true)
        .catch((error) => console.error(error));

export default authSignIn;
