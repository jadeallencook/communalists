import * as yup from 'yup';

const validationSchema = yup.object().shape({
    name: yup.string().label('Name').required(),
	email: yup.string().label('Email').email().required(),
	password: yup.string().label('Password').required(),
	passwordConfirmation: yup.string().label('Password')
		.when('password', (password: string, schema: any) => {
			return schema.test({
				test: (passwordConfirmation: string) => password === passwordConfirmation,
				message: "Passwords do not match."
			})
		}).required(),
	subjectPronoun: yup.string().label('Subject Pronoun').required(),
	objectPronoun: yup.string().label('Object Pronoun').required(),
	county: yup.string().required(),
	isRemote: yup.boolean().required()
});

export default validationSchema