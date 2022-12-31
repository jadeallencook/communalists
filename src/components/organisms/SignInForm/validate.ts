import * as yup from 'yup';

const validationSchema = yup.object({
	email: yup.string().label("Email").email().required(),
    password: yup.string().label("Password").required()
});

export default validationSchema;
