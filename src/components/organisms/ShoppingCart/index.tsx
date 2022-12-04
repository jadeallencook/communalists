import styled, { StyledComponent } from 'styled-components';
import ShoppingCartIcon from './icon';
import style from './style';
import { Badge, Offcanvas } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import GlobalContext, {ShoppingCartItemInterface} from '../../../context';

const ShoppingCart: StyledComponent = styled(({ className }) => {
	const [show, setShow] = useState<boolean>(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const { shoppingCartItems } = useContext(GlobalContext);
	const numberOfItemsInCart: number = Object.values(shoppingCartItems).reduce((acc, { quantity }: ShoppingCartItemInterface) => acc += quantity, 0);

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
					<Offcanvas.Title>Checkout</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					{JSON.stringify(shoppingCartItems)}
				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
})(style);

export default ShoppingCart;
