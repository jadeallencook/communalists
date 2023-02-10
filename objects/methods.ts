import { MethodKeyTypes, MethodTypes } from '@custom-types/methods';

const methods: { [key in MethodKeyTypes]: MethodTypes } = {
	email: 'Email',
	phone: 'Phone',
	text: 'Text',
};

export default methods;
