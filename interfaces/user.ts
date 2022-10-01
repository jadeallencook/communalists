import { Pronouns } from '../types/';
import { Location } from './';

interface User {
	name: string;
	pronouns: Pronouns;
	location: Location;
	isRemote: boolean;
}

export default User;
