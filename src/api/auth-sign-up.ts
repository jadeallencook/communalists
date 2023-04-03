import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);
const authSignUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)
        .then(({ user }) => user)
        .catch((response) => response);

export default authSignUp;
