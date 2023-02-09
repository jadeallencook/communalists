import { FormControlElement } from '@custom-types/form';
import { ChangeEventHandler } from 'react';
import { Form as BSForm } from 'react-bootstrap';
import FormInputProps from '../interfaces/FormInputProps';

interface CheckboxProps extends FormInputProps {
	handler: ChangeEventHandler<FormControlElement>;
}

const Checkbox = ({
	label,
	name,
	placeholder,
	handler,
	value,
	isDisabled,
}: CheckboxProps) => (
	<BSForm.Check
		type="checkbox"
		name={name}
		placeholder={placeholder}
		onChange={handler}
		value={value}
		label={label}
		disabled={isDisabled}
	/>
);

export default Checkbox;
