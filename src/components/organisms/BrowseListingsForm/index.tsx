import { Form } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import locationMap from '@objects/location-map';
import { database } from '@database/index';
import { getItemKeysAndTitlesInItemsArray } from '@utils/formUtils';

const BrowseListingsForm: StyledComponent = styled(
	({ className, state, county, selectedItem, handleChange }) => {
		const { items } = database;
		return (
			<Form className={className} onSubmit={() => null}>
				<Form.Group className="mb-3 state">
					<Form.Label>State</Form.Label>
					<Form.Select
						onChange={handleChange}
						value={state}
						name="state"
					>
						{Object.keys(locationMap).map((key) => (
							<option key={key} value={key}>
								{key}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3 county">
					<Form.Label>County</Form.Label>
					<Form.Select
						onChange={handleChange}
						value={county}
						name="county"
					>
						{Object.keys(locationMap[state]).map((key) => (
							<option key={key} value={key}>
								{locationMap[state][key]}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className="mb-3 items">
					<Form.Label>Item</Form.Label>
					<Form.Select
						onChange={handleChange}
						value={selectedItem}
						name="item"
					>
						<option value="">View All</option>
						{getItemKeysAndTitlesInItemsArray(items).map(
							({ key, value: { title } }) => (
								<option key={key} value={key}>
									{title}
								</option>
							)
						)}
					</Form.Select>
				</Form.Group>
			</Form>
		);
	}
)(style);

export default BrowseListingsForm;
