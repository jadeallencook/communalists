import Dashboard from './Dashboard';
import { Table } from 'react-bootstrap';

const DashboardOrders = () => {
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
							You do not currently have any orders placed...
						</td>
					</tr>
				</tbody>
			</Table>
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
							No one has placed any orders for your listings...
						</td>
					</tr>
				</tbody>
			</Table>
		</Dashboard>
	);
};

export default DashboardOrders;
