import Dashboard from './Dashboard';
import { Button, Modal, Table } from 'react-bootstrap';
import { useState } from 'react';
import CreateGroupForm from '@components/organisms/CreateGroupForm';

const DashboardGroups = () => {
	const [show, setShow] = useState(false);
	const handleShow = () => setShow(true);
	const handleClose = () => setShow(false);

	return (
		<Dashboard>
			<Table striped bordered hover variant="dark">
				<thead>
					<tr>
						<th>Title</th>
						<th>Date</th>
						<th>Status</th>
						<th>Cancel</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td colSpan={4} style={{ textAlign: 'center' }}>
							You are not a part of any groups...
						</td>
					</tr>
				</tbody>
			</Table>

			<Modal show={show} onHide={handleClose} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Create Group</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<CreateGroupForm isModal handleClose={handleClose} />
				</Modal.Body>
			</Modal>
			<Button onClick={handleShow}>Create Group</Button>
		</Dashboard>
	);
};

export default DashboardGroups;
