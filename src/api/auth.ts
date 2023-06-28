import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import app from './init-app';
import SignUpInterface from '@interfaces/sign-up';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import updateUserDisplayName from './update-user-display-name';

const auth = getAuth(app);
const db = getFirestore(app);

export async function signUp(userInfo: SignUpInterface) {
    const { email, password, confirmedPassword, name, ...rest } = userInfo;
    if (password !== confirmedPassword) {
        throw new Error(
            'The passwords you entered do not match. Please try again.'
        );
    }

    await createUserWithEmailAndPassword(auth, email, password);
    const accountsRef = doc(db, 'accounts', auth.currentUser.uid);
    await setDoc(accountsRef, rest);
    await updateUserDisplayName(name);
}

export function signIn(props: { email: string; password: string }) {
    return signInWithEmailAndPassword(auth, props.email, props.password);
}
