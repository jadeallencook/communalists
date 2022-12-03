import styled, { StyledComponent } from 'styled-components';
import ShoppingCartIcon from './icon';
import style from './style';
import { Badge, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';

const ShoppingCart: StyledComponent = styled(({ className }) => {
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	return (
		<>
			<Badge bg="primary" className={className} onClick={handleShow}>
				<ShoppingCartIcon />
				<span>0</span>
			</Badge>
			<Offcanvas
				show={show}
				onHide={handleClose}
				placement="top"
				style={{ color: '#000' }}
			>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Checkout</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>

				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
})(style);

export default ShoppingCart;
