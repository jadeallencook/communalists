import { useState } from 'react';
import { Container, Table, Form, Badge } from 'react-bootstrap';
import database from '../../database/database.mock.json';
import { ListingInterface } from '../../interfaces';

const Resources = () => {
	const { items } = database;
	const [location, setLocation] = useState<string>('santa-clara-ca');
	const ref = database.listings[location];
	const users: string[] = ref ? Object.keys(ref).map((user) => user) : null;
	const listings: { [key in string]: ListingInterface } = users
		? users.reduce((listings, user) => ({ ...listings, ...ref[user] }), {})
		: null;
	return (
		<Container>
			<h1>Listings</h1>
			<Form onSubmit={() => null}>
				<Form.Group className="mb-3">
					<Form.Select
						onChange={(event) => setLocation(event.target.value)}
					>
						<option value="santa-clara-ca">Santa Clara</option>
						<option value="san-mateo-ca">San Mateo</option>
						<option value="san-francisco-ca">San Francisco</option>
						<option value="alameda-ca">Alameda</option>
					</Form.Select>
				</Form.Group>
			</Form>
			<Table striped bordered hover variant="dark">
				<thead>
					<tr>
						<th>Title</th>
						<th>Stock</th>
						<th>Attributes</th>
						<th>Options</th>
					</tr>
				</thead>
				<tbody>
					{listings ? (
						Object.keys(listings).map((key) => {
							const listing = listings[key];
							const { item, stock } = listing;
							const { title, unit, attributes } = items[item];
							return (
								<tr key={key}>
									<td>{title}</td>
									<td>
										{stock} {unit}
									</td>
									<td>
										{listing.attributes.map(
											([key, value]) => (
												<Badge
													key={key}
													bg="light"
													text="dark"
												>
													{attributes[key][value]}
												</Badge>
											)
										)}
									</td>
									<td>
										<Badge
											key={key}
											bg="primary"
											text="light"
											style={{
												marginRight: '5px',
												cursor: 'pointer',
											}}
										>
											Order
										</Badge>
										<Badge
											key={key}
											bg="secondary"
											text="light"
											style={{
												cursor: 'pointer',
											}}
										>
											Details
										</Badge>
									</td>
								</tr>
							);
						})
					) : (
						<tr>
							<td colSpan={4} style={{ textAlign: 'center' }}>
								There are no listings for this location...
							</td>
						</tr>
					)}
				</tbody>
			</Table>
		</Container>
	);
};

export default Resources;
