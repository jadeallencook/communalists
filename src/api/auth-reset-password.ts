import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);

const authResetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
        .then(() => {})
        .catch((error) => {
            console.error(error);
        });
    return true;
};

export default authResetPassword;
