import {AccountInterface} from '../../../../interfaces/account';

const initialValues: AccountInterface = {
	name: '',
	email: '',
	password: '',
	passwordConfirmation: '',
	SubjectPronoun: 'they',
	ObjectPronoun: 'them',
	country: 'US',
	zipcode: '',
	isRemote: true,
};

export default initialValues;
