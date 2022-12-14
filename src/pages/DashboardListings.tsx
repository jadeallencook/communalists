import Dashboard from './Dashboard';
import CreateListingForm from '@components/organisms/CreateListingForm';
import { Table, Button, Modal } from 'react-bootstrap';
import { useState } from 'react';

const DashboardListings = () => {
	const [show, setShow] = useState(false);
	const [shouldSubmit, setShouldSubmit] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<Dashboard>
			<Table striped bordered hover variant="dark">
				<thead>
					<tr>
						<th>Title</th>
						<th>Date</th>
						<th>Status</th>
						<th>Options</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td colSpan={4} style={{ textAlign: 'center' }}>
							You do not currently have any listings...
						</td>
					</tr>
				</tbody>
			</Table>
			<Modal show={show} onHide={handleClose} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Create Listing</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<CreateListingForm isModal handleClose={handleClose} />
				</Modal.Body>
			</Modal>
			<Button onClick={handleShow}>Create Listing</Button>
		</Dashboard>
	);
};

export default DashboardListings;
