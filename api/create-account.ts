import { AccountInterface } from '../interfaces/account';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export const createAccount = (values: AccountInterface): any => {
	const { email, password } = values;
	const auth = getAuth();
	console.log({ auth });
	createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			const user = userCredential.user;
			console.log(user);
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.log({ errorMessage })
		});
};
