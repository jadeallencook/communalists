import { useState, useContext } from 'react';
import { Container, Table, Form, Badge, InputGroup } from 'react-bootstrap';
import database from '@database/database.mock.json';
import { ListingInterface } from '@interfaces/listing';
import locationMap from '@objects/location-map';
import GlobalContext from '../context';
import ShoppingCartIncrementor from '@organisms/ShoppingCartIncrementor';

const Resources = () => {
	const { items } = database;
	const [state, setState] = useState(Object.keys(locationMap)[0]);
	const [county, setCounty] = useState<string>('santa-clara-ca');
	const ref = database.listings[county];
	const users: string[] = ref ? Object.keys(ref).map((user) => user) : null;
	const listings: { [key in string]: ListingInterface } = users
		? users.reduce((listings, user) => ({ ...listings, ...ref[user] }), {})
		: null;

	const handleStateChange = (event) =>
		setState(() => {
			const { value } = event.target;
			setCounty(Object.keys(locationMap[value])[0]);
			return value;
		});

	return (
		<Container>
			<h1>Listings</h1>
			<Form onSubmit={() => null}>
				<Form.Group className="mb-3">
					<Form.Label>State</Form.Label>
					<Form.Select onChange={handleStateChange} value={state}>
						{Object.keys(locationMap).map((key) => (
							<option key={key} value={key}>
								{key}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>County</Form.Label>
					<Form.Select
						onChange={(event) => setCounty(event.target.value)}
						value={county}
					>
						{Object.keys(locationMap[state]).map((key) => (
							<option key={key} value={key}>
								{locationMap[state][key]}
							</option>
						))}
					</Form.Select>
				</Form.Group>
			</Form>
			<Table striped bordered hover variant="dark">
				<thead>
					<tr>
						<th>Title</th>
						<th>Stock</th>
						<th>Attributes</th>
						<th style={{ width: '200px' }}>Options</th>
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
										<ShoppingCartIncrementor
											listingKey={key}
											itemKey={item}
										/>
										<Badge
											key={`${key}-details`}
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
