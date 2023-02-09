import { FormControlElement } from '@custom-types/form';
import { ChangeEventHandler } from 'react';
import { Form as BSForm } from 'react-bootstrap';
import FormInputProps from '../interfaces/FormInputProps';

interface InputProps extends FormInputProps {
	handler: ChangeEventHandler<FormControlElement>;
}

const Input = ({
	label,
	name,
	placeholder,
	handler,
	value,
	isDisabled,
}: InputProps) => (
	<>
		<BSForm.Label>{label}</BSForm.Label>
		<BSForm.Control
			type="text"
			name={name}
			placeholder={placeholder}
			onChange={handler}
			value={value}
			disabled={isDisabled}
		/>
	</>
);

export default Input;
