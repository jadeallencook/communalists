import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);
const authSignIn = async (email: string, password: string) => {
	let data;
	await signInWithEmailAndPassword(auth, email, password)
		.then((response) => {
			data = response;
		})
		.catch((response) => {
			data = response;
		});
	return data;
};

export default authSignIn;
