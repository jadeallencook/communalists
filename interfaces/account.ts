import { UserInterface } from './user';

export interface AccountInterface extends UserInterface {
	email: string;
	password: string;
	passwordConfirmation: string;
}
