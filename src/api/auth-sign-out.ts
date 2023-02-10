import { getAuth, signOut } from 'firebase/auth';
import app from './init-app';

const auth = getAuth(app);
const authSignOut = () =>
	signOut(auth)
		.then(() => {
			console.log('signed out');
		})
		.catch((error) => {
			console.log({ error });
		});

export default authSignOut;
