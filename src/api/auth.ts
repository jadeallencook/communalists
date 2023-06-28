import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import toast from 'react-hot-toast';
import app from './init-app';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import addAccount from './add-account';
import SignUpInterface from '@interfaces/sign-up';

const auth = getAuth(app);

export function useSignUp() {
    const navigate = useNavigate();
    const res = useMutation({
        mutationKey: ['sign-up'],
        mutationFn: async (userInfo: SignUpInterface) => {
            const { email, password } = userInfo;
            if (password !== userInfo.confirmedPassword) {
                throw new Error(
                    'The passwords you entered do not match. Please try again.'
                );
            }

            await createUserWithEmailAndPassword(auth, email, password);
            await addAccount(userInfo);
        },
        onSuccess: () => navigate('/dashboard'),
        onError: (e) =>
            void toast.error(e instanceof Error ? e.message : String(e)),
    });

    return { ...res, signUp: res.mutateAsync };
}

export function signIn(props: { email: string; password: string }) {
    return signInWithEmailAndPassword(auth, props.email, props.password);
}
