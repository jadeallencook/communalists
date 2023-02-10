import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState } from 'react';
import app from './init-app';

const auth = getAuth(app);
const useUserState = () => {
	const [user, setUser] = useState(null);
	onAuthStateChanged(auth, (response) => setUser(response));
	return user;
};

export default useUserState;
