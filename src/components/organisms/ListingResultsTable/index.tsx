import { Container, Table, Badge } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { database } from '@database/index';
import ShoppingCartIncrementor from '../ShoppingCartIncrementor';

const ListingResultsTable: StyledComponent = styled(
	({ className, listings }) => {
		const { items } = database;
		return (
			<Table striped bordered hover variant="dark" className={className}>
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
		);
	}
)(style);

export default ListingResultsTable;
