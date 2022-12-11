import { useContext } from 'react';
import { Badge } from 'react-bootstrap';
import GlobalContext from '../../../context';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const ShoppingCartIncrementor: StyledComponent = styled(
	({ listingKey, itemKey, className }) => {
		const { addToShoppingCart, shoppingCartItems, removeFromShoppingCart } =
			useContext(GlobalContext);
		return !shoppingCartItems[listingKey] ? (
			<Badge
				bg="primary"
				text="light"
				style={{
					marginRight: '5px',
					cursor: 'pointer',
				}}
				onClick={() =>
					addToShoppingCart({
						item: itemKey,
						quantity: 1,
						listing: listingKey,
					})
				}
			>
				Order
			</Badge>
		) : (
			<div className={className}>
				<Badge
					bg="secondary"
					text="light"
					onClick={() => removeFromShoppingCart(listingKey)}
					style={{
						cursor: 'pointer',
					}}
				>
					-
				</Badge>
				<Badge
					bg="light"
					text="dark"
					onClick={() => removeFromShoppingCart(listingKey)}
					style={{
						cursor: 'pointer',
					}}
				>
					{shoppingCartItems[listingKey].quantity}
				</Badge>
				<Badge
					bg="primary"
					text="light"
					onClick={() =>
						addToShoppingCart({
							item: itemKey,
							quantity: 1,
							listing: listingKey,
						})
					}
					style={{
						marginRight: '5px',
						cursor: 'pointer',
					}}
				>
					+
				</Badge>
			</div>
		);
	}
)(style);

export default ShoppingCartIncrementor;
