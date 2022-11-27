import Dashboard from './Dashboard';
import { Table } from 'react-bootstrap';

const DashboardGroups = () => {
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
							You are not a part of any organizations...
						</td>
					</tr>
				</tbody>
			</Table>
		</Dashboard>
	);
};

export default DashboardGroups;
