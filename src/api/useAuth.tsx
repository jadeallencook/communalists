import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import app from './init-app';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);

export function useSignOut() {
    const navigate = useNavigate();
    const res = useMutation({
        mutationKey: ['sign-out'],
        mutationFn: () => signOut(auth),
        onSuccess: () => navigate('/'),
    });

    return {
        ...res,
        signOut: res.mutate,
    };
}

export function useSignIn() {
    const navigate = useNavigate();
    const res = useMutation({
        mutationKey: ['sign-in'],
        mutationFn: (props: { email: string; password: string }) =>
            signInWithEmailAndPassword(auth, props.email, props.password),
        onSuccess: () => navigate('/dashboard'),
    });

    return {
        ...res,
        signIn: res.mutate,
    };
}
