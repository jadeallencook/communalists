import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { database } from '@database/index';
import initialValues from './initial-values';
import { ListingInterface } from '@interfaces/listing';

// Incoming data and related parsing will need to be rewritten when the APIs become available.
const locations: string[] = ['Location 1', 'Location 2', 'Location 3'];

interface CreateListingFormInterface {
	className: string,
	isModal: boolean,
	handleClose: Function
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

	// On item change (select) reset the default attribute values in input state
	// initialValues seems to override this the first time component renders, for now storing basic attributes in initialValues
	useEffect(() => {
		let newAttributes = []
		if (itemObj.attributes)
			newAttributes = Object.entries(itemObj.attributes).map(([key, values]) =>
				[key, Object.keys(values)[0]] as [string, string]
			)
		setInputs((prevInputs) => ({ ...prevInputs, attributes: [...newAttributes] }))
	}, [item, itemObj])

	// useEffect(() => console.log(item, attributes), [attributes])

	// Set location on component load, this will eventually be tied to user data
	useEffect(() => {
		setInputs({...inputs, location: locations[0]})
	}, [locations])

	// TODO: add types by fixing error -> Cannot find name FormControlElement
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
		console.log(inputs)
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
					{Object.entries(items).map(([key, { title }]) => (
						<option key={key} value={key}>
							{title}
						</option>
					))}
				</Form.Select>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Listing Description</Form.Label>
				<Form.Control
					type="text"
					name="description"
					placeholder="Brand, condition, etc."
					value={description}
					onChange={handleChange}
					required
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Stock</Form.Label>
				<Form.Control
					type="number"
					name="stock"
					value={stock}
					onChange={handleChange}
					required
				/>
			</Form.Group>
			{itemObj && itemObj.attributes &&
				Object.entries(itemObj.attributes).map(
					([attributeKey, attributeValues]) => (
						<Form.Group className="mb-3" key={attributeKey}>
							<Form.Label>{attributeKey}</Form.Label>
							<Form.Select
								className="form-control"
								name={attributeKey}
								value={inputs.attributes[attributeKey]}
								onChange={handleChange}
							>
								{Object.entries(attributeValues).map(
									([key, title]) => {
										return (
											<option key={key} value={key}>
												{title}
											</option>
										);
									}
								)}
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
