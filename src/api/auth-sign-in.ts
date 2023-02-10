import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);
const authSignIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
        .then(({ user }) => {
            console.log({ user });
        })
        .catch(({ code, message }) => {
            console.log({ code, message });
        });

export default authSignIn;
