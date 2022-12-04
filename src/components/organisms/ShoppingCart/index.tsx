import styled, { StyledComponent } from 'styled-components';
import ShoppingCartIcon from './icon';
import style from './style';
import { Badge, Button, Card, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';
import { useContext } from 'react';
import GlobalContext, { ShoppingCartItemInterface } from '../../../context';
import { database } from '@database/index';
import Footer from '../Footer';

const ShoppingCart: StyledComponent = styled(({ className }) => {
	const [show, setShow] = useState<boolean>(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const { shoppingCartItems } = useContext(GlobalContext);
	const { items } = database;
	const numberOfItemsInCart: number = Object.values(shoppingCartItems).reduce(
		(acc, { quantity }: ShoppingCartItemInterface) => (acc += quantity),
		0
	);

	console.log({shoppingCartItems});
	return (
		<>
			<Badge bg="primary" className={className} onClick={handleShow}>
				<ShoppingCartIcon />
				{numberOfItemsInCart ? (
					<span>{numberOfItemsInCart}</span>
				) : null}
			</Badge>
			<Offcanvas
				show={show}
				onHide={handleClose}
				placement="end"
				style={{ color: '#000' }}
			>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>
						<b>Your Shopping Cart</b>
					</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					{Object.entries(shoppingCartItems).length ? (
						<>
							{Object.entries(shoppingCartItems).map(
								([key, { quantity, item }]) => (
									<Card
										style={{ marginBottom: '15px' }}
										key={key}
									>
										<Card.Header>
											<b>{items[item].title}</b>
										</Card.Header>
										<Card.Body>
											No description available.
										</Card.Body>
										<Card.Footer className="text-muted">
											<span>Quanity:</span> {quantity}
										</Card.Footer>
									</Card>
								)
							)}
							<Button>Checkout</Button>
						</>
					) : (
						<p>There is nothing in your cart...</p>
					)}
					<Footer />
				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
})(style);

export default ShoppingCart;
