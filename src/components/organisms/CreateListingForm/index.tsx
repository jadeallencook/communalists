import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { database } from '@database/index';

// Incoming data and related parsing will need to be rewritten when the APIs become available.
const locations: string[] = ['Location 1', 'Location 2', 'Location 3'];

const CreateListingForm: StyledComponent = styled(({ className }) => {
	const { items } = database;
	const [itemKey, setItemKey] = useState(Object.keys(items)[0]);
	const item = items[itemKey];

	const handleItemChange = (event) => {
		const key = event.target.value;
		setItemKey(key);
	};

	const handleSubmit = (event): void => {
		event.preventDefault();
		const inputs = event.target.querySelectorAll('input, select');
		for (const input of inputs) {
			const value = input.value;
			const key = input.getAttribute('name');
			const object = { key, value };
			console.log({ object });
		}
		return null;
	};

	return (
		<Form className={className} onSubmit={handleSubmit}>
			<Form.Group className="mb-3">
				<Form.Label>Item</Form.Label>
				<Form.Select
					className="form-control"
					onChange={handleItemChange}
					name="item"
					value={itemKey}
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
					required
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Stock</Form.Label>
				<Form.Control
					type="number"
					name="stock"
					defaultValue={1}
					required
				/>
			</Form.Group>
			{item.attributes &&
				Object.entries(item.attributes).map(
					([attributeKey, attributeValues]) => (
						<Form.Group className="mb-3" key={attributeKey}>
							<Form.Label>{attributeKey}</Form.Label>
							<Form.Select
								className="form-control"
								name={attributeKey}
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
					name="itemType"
				>
					{locations.map((location: string) => (
						<option key={location}> {location}</option>
					))}
				</Form.Select>
			</Form.Group>
			<Button type="submit">Create Listing</Button>
		</Form>
	);
})(style);

export default CreateListingForm;
