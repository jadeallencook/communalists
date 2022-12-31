import * as yup from 'yup';

const validationSchema = yup.object().shape({
    name: yup.string().label('Name').required(),
	subjectPronoun: yup.string().label('Subject Pronoun').required(),
	objectPronoun: yup.string().label('Object Pronoun').required(),
	isRemote: yup.boolean().required(),
});

export default validationSchema