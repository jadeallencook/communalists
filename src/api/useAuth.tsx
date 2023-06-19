import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useContext } from 'react';
import SnippetContext from '../contexts/SnippetContext';
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
        signOut: res.mutateAsync,
    };
}

export function useSignIn() {
    const navigate = useNavigate();
    const { snippet } = useContext(SnippetContext);
    const res = useMutation({
        mutationKey: ['sign-in'],
        mutationFn: (props: { email: string; password: string }) =>
            signInWithEmailAndPassword(auth, props.email, props.password),
        onSuccess: () => {
            toast.success(snippet('signin.success', 'log-in-form'));
            navigate('/dashboard');
        },
        onError: () => {
            toast.error(snippet('signin.error', 'log-in-form'));
        },
    });

    return {
        ...res,
        signIn: res.mutateAsync,
    };
}
