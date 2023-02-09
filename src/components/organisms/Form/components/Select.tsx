import { ChangeEventHandler } from 'react';
import { Form as BSForm } from 'react-bootstrap';
import FormInputProps from '../interfaces/FormInputProps';

interface SelectProps extends FormInputProps {
	options: Array<string>;
	handler: ChangeEventHandler<HTMLSelectElement>;
}

const Select = ({
	label,
	name,
	placeholder,
	handler,
	value,
	isDisabled,
	options,
}: SelectProps) => (
	<>
		<BSForm.Label>{label}</BSForm.Label>
		<BSForm.Select
			name={name}
			placeholder={placeholder}
			onChange={handler}
			value={value}
			disabled={isDisabled}
		>
			{options.map((option) => (
				<option key={option}>{option}</option>
			))}
		</BSForm.Select>
	</>
);

export default Select;
