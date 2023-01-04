import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import { AddressInterface } from '@interfaces/address';

interface KanbanBoardTicketCardInterface {
    className: string
    order: OrderInterface
    role: string,
    dragRef: any,
    color: string
}

const KanbanBoardTicketCard: StyledComponent = styled(({ 
    className, 
    order, 
    role, 
    dragRef, 
    color = '#fff' 
}: KanbanBoardTicketCardInterface) => {

    const shortenString = (str: string) => {
        if (str.length <= 15) return str
        return `${str.slice(0, 15)}...`
    }

    const addressToString = (address: AddressInterface) => {
        return `${address.street}, ${address.city}, ${address.county}, ${address.state}, ${address.zipcode}`
    }

    return (
        <Card className={className} role={role} ref={dragRef} style={{borderLeft: `${color} 5px solid`}}>
            <Card.Body>
                <Row>
                    <p>{order.requester}</p>
                    {/* <p>{order.location.city}</p> */}
                    {/* <Button onClick={() => props.onShowEditTicketCardModal(props.id)}>
                        <EditIcon />
                    </Button> */}
                </Row>
                <Row>
                    <p>Address:</p>
                    <p>{shortenString(addressToString(order.location))}</p>
                    {/* <p>Requester</p>
                    <p>{shortenString(order.requester)}</p>
                    <p>Description:</p>
                    <p>{shortenString(order.description)}</p>
                    <p>Assigned To:</p>
                    <p>{shortenString(order.assignedTo)}</p> */}
                </Row>
            </Card.Body>
        </Card>
    );
})(style);
 
export default KanbanBoardTicketCard;
