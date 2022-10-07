import {AccountInterface} from '../../../../interfaces/account';

const initialValues: AccountInterface = {
	name: '',
	email: '',
	password: '',
	passwordConfirmation: '',
	PrimaryOrThirdPersonPronoun: 'they',
	SecondayOrPossessivePronoun: 'them',
	country: 'US',
	zipcode: '',
	isRemote: true,
};

export default initialValues;
