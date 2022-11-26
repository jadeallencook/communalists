import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Field, Formik, FormikHelpers } from 'formik';
import initialValues from './initial-values';
import Loading from '../../molecules/Loading';
import { database } from '../../../../database/index'
import React, { useEffect, useState } from 'react';

// Incoming data and related parsing will need to be rewritten when the APIs become available.
const locations: string[] = ['Location 1', 'Location 2', 'Location 3']

const CreateListingForm: StyledComponent = styled(({ className }) => {

	const [item, setItem] = useState(initialValues)
	const [ size, setSize] = useState()

	useEffect(() => {
		console.log(size)
	}, [size])

	// TODO: on handleSubmit the default values from the database item in case user has not selected an attribute value
	const handleSubmit = () => (values: any) => {
		const itemAttributes = database.items[values.item.toLowerCase().replace(/\s/g, '')]?.attributes || {}
		// If a user selects an item, it should only have the attributes associated with that item, size -> size needs reset
		Object.entries(values.attributes).forEach(([key, value]: [string, string]) => {
			if(
				!(key in itemAttributes) || 
				(key in itemAttributes && !Object.values(itemAttributes[key]).includes(value))
			) {
				delete values.attributes[key]
			}else{
				value = value.toString().toLocaleLowerCase()
			}
		})
		// Populate missing fields with default values
		// Object.entries(itemAttributes).forEach(([key, value]) => {
		// 	if(!(key in values.attributes)) values.attributes[key] = Object.keys(value)[0]
		// })
		console.log(values)
	}

	return(
		<Formik
			initialValues={initialValues}
			onSubmit={handleSubmit()}
			validateOnChange={false}
			validateOnBlur={false}
			enableReinitialize={true}
		>
			{({
				values,
				handleChange,
				handleSubmit,
				isSubmitting,
				setFieldValue,
			}: {
				values: any;
				handleChange: any;
				handleSubmit: any;
				isSubmitting: any;
				setFieldValue: any;
			}) =>
				!isSubmitting ? (
					<Form className={className} onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Item</Form.Label>
							<Field
								className="form-control"
								as="select"
								onChange={(e: React.ChangeEvent<HTMLFormElement>) => {
									setItem(e.target.value)
									handleChange(e)
								}}
								name="item"
								>
								{Object.entries(database.items).map(([item, itemValues]) => (
									<option key={item} value={item}>{itemValues.title}</option>
								))}
							</Field>
							<Form.Label>Listing Description</Form.Label>
							<Form.Control
								type="text"
								name="description"
								placeholder="Listing Description"
								value={values.description}
								onChange={handleChange}
							/>
							<Form.Label>Stock</Form.Label>
							<Form.Control
								type="number"
								name="stock"
								value={values.stock}
								onChange={e => {
									if(Number(e.target.value) > 0) setFieldValue("stock", e.target.value)
								}}
							/>
							{values.item && 
								database.items[values.item].attributes && 
								Object.entries(database.items[values.item].attributes).map(([attribute, attributeValues]) => (
									<div key={attribute}>
										<Form.Label>{attribute}</Form.Label>
										<Field
											className="form-control"
											as="select"
											onChange={handleChange}
											name={`attributes[${attribute}]`}
											>
											{Object.entries(attributeValues).map(([key, value]) => (
												<option key={key} value={key}>{value}</option>
											))}
										</Field>
									</div>
							))}
							<Form.Label>Storage Location</Form.Label>
							<Field
								className="form-control"
								as="select"
								onChange={handleChange}
								// value={values.location}
								name="itemType"
								>
								{locations.map((location: string) => (
									<option key={location}> {location}</option>
								))}
							</Field>
						</Form.Group>
						<Button type="submit" disabled={isSubmitting}>
							Create Listing
						</Button>
					</Form>
				) : (
					<Loading />
				)
			}
		</Formik>
	)
})(style);

export default CreateListingForm