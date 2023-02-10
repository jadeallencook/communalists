import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);
const authSignUp = (email: string, password: string) =>
	createUserWithEmailAndPassword(auth, email, password)
		.then(({ user }) => {
			console.log({ user });
		})
		.catch(({ code, message }) => {
			console.log({ code, message });
		});

export default authSignUp;
