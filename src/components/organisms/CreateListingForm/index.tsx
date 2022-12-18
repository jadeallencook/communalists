import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { database } from '@database/index';
import initialValues from './initial-values';
import { ListingInterface } from '@interfaces/listing';
import validationSchema from './validate';
import { 
	getAttributeKeysAndValuesByItem, 
	getAttributeOptionsByAttribute, 
	convertYupValidationErrorToObj,
	getItemKeysAndTitlesInItemsArray
} from '@utils/formUtils'

// Incoming data and related parsing will need to be rewritten when the APIs become available.
const locations: string[] = ['Location 1', 'Location 2', 'Location 3'];

interface CreateListingFormInterface {
	className: string,
	isModal: boolean,
	handleClose: Function
}

interface FormErrorsInterface {
	item: string,
	description: string,
	attributes: string,
	stock: string,
	location: string
}

const initialFormErrors: FormErrorsInterface = {
	item: '',
	description: '',
	attributes: '',
	stock: '',
	location: ''
}

const CreateListingForm: StyledComponent = styled(({
	className,
	isModal = false,
	handleClose
}: CreateListingFormInterface) => {
	const { items } = database;
	const [inputs, setInputs] = useState<ListingInterface>(initialValues)
	const { item, description, stock, attributes, location } = inputs
	const itemObj = items[item];
	const [formErrors, setFormErrors] = useState<FormErrorsInterface>(initialFormErrors)

	// On item change (select) reset the default attribute values in input state
	useEffect(() => {
		let newAttributes = []
		console.log("testing function", getAttributeKeysAndValuesByItem(itemObj.attributes))
		if (itemObj.attributes)
			newAttributes = Object.entries(itemObj.attributes).map(([key, values]) =>
				[key, Object.keys(values)[0]] as [string, string]
			)
		setInputs((prevInputs) => ({ ...prevInputs, attributes: [...newAttributes] }))
	}, [item, itemObj])

	// Set location on component load, this will eventually be tied to user data
	useEffect(() => {
		setInputs({...inputs, location: locations[0]})
	}, [locations])

	// this is an attempt to account for newAttributes having form [string, string][]
	const handleChange: React.ChangeEventHandler<any> = ({ target: { value, name, type } }): void => {
		if(type === 'number') value = Number(value)
		if(type === 'number' && value < 1) value = 1
		if (name in initialValues) {
			setInputs((prevInputs) => ({
				...prevInputs,
				[name]: value
			}));
		} else {
			const newAttributes: [string, string][] = inputs.attributes.map((attributeArray) => {
				if (attributeArray[0] === name) return [name, value]
				else return attributeArray
			})
			setInputs((prevInputs) => ({
				...prevInputs,
				attributes: [...newAttributes]
			}))
		}
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		setFormErrors(initialFormErrors)
		validationSchema.validate(inputs, {abortEarly: false})
			.then(() => console.log("validated"))
			.catch((err) => {
				const validationErrors = convertYupValidationErrorToObj(err) as FormErrorsInterface
				setFormErrors(validationErrors)
				console.log(validationErrors)
			})
		return null;
	};

	return (
		<Form className={className} onSubmit={handleSubmit}>
			<Form.Group className="mb-3">
				<Form.Label>Item</Form.Label>
				<Form.Select
					className="form-control"
					onChange={handleChange}
					name="item"
					value={item}
				>
					{getItemKeysAndTitlesInItemsArray(items).map((item) => (
						<option key={item.key} value={item.key}>
							{item.value}
						</option>
					))}
				</Form.Select>
				{formErrors.item ? (<p className="is-danger">{formErrors.item}</p>) : null}
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Listing Description</Form.Label>
				<Form.Control
					type="text"
					name="description"
					placeholder="Brand, condition, etc."
					value={description}
					onChange={handleChange}
				/>
				{formErrors.description ? (<p className="is-danger">{formErrors.description}</p>) : null}
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Stock</Form.Label>
				<Form.Control
					type="number"
					name="stock"
					value={stock}
					onChange={handleChange}
				/>
				{formErrors.stock ? (<p className="is-danger">{formErrors.stock}</p>) : null}
			</Form.Group>
			{itemObj && itemObj.attributes &&
				getAttributeKeysAndValuesByItem(itemObj.attributes).map(
					(attribute) => (
						<Form.Group className="mb-3" key={attribute.key}>
							<Form.Label>{attribute.key}</Form.Label>
							<Form.Select
								className="form-control"
								name={attribute.key}
								value={inputs.attributes[attribute.key]}
								onChange={handleChange}
							>
								{getAttributeOptionsByAttribute(attribute.value).map((option) => {
									return (
										<option key={option.key} value={option.key}>
											{option.value}
										</option>
									);
								})}
							</Form.Select>
						</Form.Group>
					)
				)}
			<Form.Group className="mb-3">
				<Form.Label>Storage Location</Form.Label>
				<Form.Select
					className="form-control"
					as="select"
					name="location"
					value={location}
					onChange={handleChange}
				>
					{locations.map((location: string) => (
						<option key={location}> {location}</option>
					))}
				</Form.Select>
				{formErrors.location ? (<p className="is-danger">{formErrors.location}</p>) : null}
			</Form.Group>

			{!isModal ?
				<Button type="submit">
					Create Listing
				</Button> :
				<Modal.Footer>
					<Button variant="secondary" onClick={() => handleClose()}>
						Close
					</Button>
					<Button type="submit">
						Create Listing
					</Button>
				</Modal.Footer>}
		</Form>
	);
})(style);

export default CreateListingForm;
