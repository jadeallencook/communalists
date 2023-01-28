import { Button, Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { ErrorMessage, Formik } from 'formik';
import RenderError from '@components/atoms/RenderError';
import { AidCoordinatorStatusOptions } from '@consts/kanbanBoard';
import { OrderInterface } from '@interfaces/order';

const EditTicketCardForm: StyledComponent = styled(({ className, order, setOrderData, onClose }) => {

    const updateOrder = (values: OrderInterface) => {
        let newOrder = {}
        Object.entries(values).map(([key, val]) => {
            newOrder[key] = val
        })
        setOrderData((prevOrders: OrderInterface[]) => [...prevOrders, newOrder])
        onClose()
	}

	return (
		<Formik
			initialValues={order}
			onSubmit={updateOrder}
			// validationSchema={validationSchema}
			validateOnChange={false}
			validateOnBlur={false}
		>
			{({
				values: { 
                    requester,
                    requestDate,
                    type,
                    description,
                    location,
                    assignedTo,
                    status,
                    driverStatus,
                    lastUpdated,
                },
				handleChange,
				handleSubmit,
				isSubmitting,
			}: {
				values: any;
				handleChange: React.ChangeEventHandler<any>;
				handleSubmit: React.FormEventHandler<HTMLFormElement>;
				isSubmitting: any;
			}) =>
				!isSubmitting ? (
					<Form
						className={`${className} standard-form`}
						onSubmit={handleSubmit}
					>
						<Form.Group className="mb-3">
							<Form.Label>Assigned To</Form.Label>
							<Form.Control
								type="text"
								name="Assigned To"
								value={assignedTo}
								onChange={handleChange}
							/>
							<ErrorMessage name="email" render={RenderError} />
						</Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            className="select-sm"
                            onChange={handleChange}
                            name="status"
                            value={status}
                        >
                            {AidCoordinatorStatusOptions.map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                >
                                    {option}
                                </option>
                            ))}
                        </Form.Select>
						<Button type="submit" disabled={isSubmitting}>
							Save Changes
						</Button>
					</Form>
				) : (
					<p>Signing in...</p>
				)
			}
		</Formik>
	);
})(style);

export default EditTicketCardForm;