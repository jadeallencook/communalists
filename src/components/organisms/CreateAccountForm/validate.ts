import * as yup from 'yup';

const validationSchema = yup.object().shape({
	name: yup.string().label('Name').required(),
	email: yup.string().label('Email').email().required(),
	password: yup.string().label('Password').required(),
	passwordConfirmation: yup
		.string()
		.label('Password')
		.when('password', (password: string, schema: any) => {
			return schema.test({
				test: (passwordConfirmation: string) =>
					password === passwordConfirmation,
				message: 'Passwords do not match.',
			});
		})
		.required(),
	subjectPronoun: yup.string().label('Subject Pronoun').required(),
	objectPronoun: yup.string().label('Object Pronoun').required(),
	address: yup.object().shape({
		street: yup.string().label('Street').required(),
		city: yup.string().label('City').required(),
		state: yup.string().label('State').required(),
		zipcode: yup
			.number()
			.positive()
			.integer()
			.test(
				'is-valid-zipcode',
				'Please enter a valid ZIP',
				(zip: number | null) => zip && zip.toString().length === 5
			)
			.required(),
		county: yup.string().label('County').required(),
	}),
	isRemote: yup.boolean().required(),
});

export default validationSchema;
