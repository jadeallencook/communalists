import { Button, Card, Modal, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import React, { Dispatch, useState } from 'react';
import EditTicketCardForm from '../EditTicketCardForm';

interface TicketCardInterface {
    className: string
    order: OrderInterface
    role: string,
    setOrderData: Dispatch<React.SetStateAction<OrderInterface[]>>
}

const TicketCard: StyledComponent = styled(({ 
    className, 
    order, 
    role, 
    setOrderData
}: TicketCardInterface) => {

    const {
        id,
        driverStatus,
        location: { county },
    } = order

    const [show, setShow] = useState(false);
	// const [shouldSubmit, setShouldSubmit] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

    return (
        <Card className={className} role={role}>
            <Card.Body>
                <Row className="card-label">
                    <p className="card-title">#{id} - {county}</p>
                    <Button className="card-edit-button" onClick={handleShow}>
                        <p>E</p>
                    </Button>
                </Row>
                <Row>
                    <p>Driver assigned - {driverStatus}</p>
                </Row>
            </Card.Body>
            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Ticket #{id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditTicketCardForm 
                        order={order} 
                        setOrderData={setOrderData} 
                        onClose={handleClose} />
                </Modal.Body>
            </Modal>
        </Card>
    );
})(style);
 
export default TicketCard;
