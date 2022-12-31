import * as yup from 'yup';

const validationSchema = yup.object({
	email: yup.string().label('Email').email().required(),
});

export default validationSchema;
