import { useState } from 'react';
import { Container } from 'react-bootstrap';
import database from '@database/database.mock.json';
import { ListingInterface } from '@interfaces/listing';
import locationMap from '@objects/location-map';
import BrowseListingsForm from '@organisms/BrowseListingsForm';
import ListingResultsTable from '@organisms/ListingResultsTable';

const Resources = () => {
	const [filters, setFilters] = useState({
		state: Object.keys(locationMap)[0],
		county: 'santa-clara-ca',
		item: '',
	});

	const response = database.listings[filters.county];

	const users: string[] = response
		? Object.keys(response).map((user) => user)
		: null;

	const listings: { [key in string]: ListingInterface } = users
		? users.reduce(
				(listings, user) => {
					// add logic here to filter items
					return { ...listings, ...response[user] }
				},
				{}
		  )
		: null;

	const handleFilterChange = (event) => {
		const { name, value } = event.target;
		if (name === 'state') {
			setFilters((prev) => ({
				...prev,
				county: Object.keys(locationMap[value])[0],
				state: value,
			}));
		} else {
			setFilters((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	return (
		<Container>
			<h1>Listings</h1>
			<BrowseListingsForm
				handleChange={handleFilterChange}
				{...filters}
			/>
			<ListingResultsTable listings={listings} />
		</Container>
	);
};

export default Resources;
