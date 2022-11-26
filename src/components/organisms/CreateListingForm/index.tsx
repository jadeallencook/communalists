import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { Field, Formik, FormikHelpers } from 'formik';
import initialValues from './initial-values';
import Loading from '../../molecules/Loading';
import { database } from '../../../../database/index'
import { useEffect, useState } from 'react';

interface CreateListingFormProps {
	className: string
    userId: string
}

const locations: string[] = ['location 1', 'location 2', 'location 3']

const CreateListingForm: StyledComponent = styled(({ className, ...props }: CreateListingFormProps ) => {

	useEffect(() => {
		initialValues['location'] = `${props.userId} ${locations[0]}`
	}, [])

	// TODO: reset attributes when new item is selected
	const [something, setSomething] = useState(initialValues)

	// TODO: on handleSubmit the default values from the database item in case user has not selected an attribute value
	const handleSubmit = () => (values: any, formik:any) => {
		console.log(values)
		const obj = {...something, ...values}
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
								onChange={handleChange}
								// value={values.type}
								name="item"
								>
								{Object.entries(database.items).map(([item, itemValues]) => (
									<option key={item}>{itemValues.title}</option>
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
								database.items[values.item.toLowerCase().replace(/\s/g, '')].attributes && 
								Object.entries(database.items[values.item.toLowerCase().replace(/\s/g, '')].attributes).map(([attribute, attributeValues]) => (
									<div key={attribute}>
										<Form.Label>{attribute}</Form.Label>
										<Field
											className="form-control"
											as="select"
											onChange={handleChange}
											name={`attributes[${attribute}]`}
											>
											{Object.entries(attributeValues).map(([key, value]) => (
												<option key={key}>{value}</option>
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
									<option key={location}>{props.userId} {location}</option>
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