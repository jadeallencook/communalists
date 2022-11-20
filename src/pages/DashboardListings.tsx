import Dashboard from './Dashboard';
import { Table, Button } from 'react-bootstrap';

const DashboardListings = () => {
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
							You do not currently have any listings...
						</td>
					</tr>
				</tbody>
			</Table>
			<Button>Create Listing</Button>
		</Dashboard>
	);
};

export default DashboardListings;
