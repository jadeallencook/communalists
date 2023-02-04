import * as yup from 'yup';
import {
	FormPropsInterface,
	InitialValueInterface,
	InputInterface,
} from '@interfaces/form';
import StyledForm from './components/StyledForm';

const Form = ({ onSubmit, data, submitButtonText }: FormPropsInterface) => {
	const props: {
		initialValues: InitialValueInterface;
		inputs: Array<InputInterface>;
		validationSchema: any;
	} = data.reduce(
		(
			{ initialValues, inputs, validationSchema },
			{
				name,
				type,
				size,
				placeholder,
				initialValue,
				label,
				options,
				validationSchema: validation,
			}
		) => ({
			initialValues: { ...initialValues, [name]: initialValue },
			inputs: [
				...inputs,
				{ type, name, placeholder, label, options, size },
			],
			validationSchema: { ...validationSchema },
		}),
		{
			initialValues: {},
			inputs: [],
			validationSchema: yup.object().shape({}),
		}
	);
	return (
		<StyledForm
			onSubmit={onSubmit}
			submitButtonText={submitButtonText}
			{...props}
		/>
	);
};

export default Form;
