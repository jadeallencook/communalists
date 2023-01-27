import { Card, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import { AddressInterface } from '@interfaces/address';
import { useEffect, useState } from 'react';

interface KanbanBoardTicketCardInterface {
    className: string
    order: OrderInterface
    role: string,
}

const KanbanBoardTicketCard: StyledComponent = styled(({ 
    className, 
    order, 
    role, 
}: KanbanBoardTicketCardInterface) => {

    const {
        id,
        driverStatus,
        location: { county },
    } = order

    // Move to utils and restyle the card
    // const shortenString = (str: string) => {
    //     if (str.length <= 15) return str
    //     return `${str.slice(0, 15)}...`
    // }

    // const addressToString = (address: AddressInterface) => {
    //     return `${address.street}, ${address.city}, ${address.county}, ${address.state}, ${address.zipcode}`
    // }

    return (
        <Card className={className} role={role}>
            <Card.Body>
                <Row className="card-label">
                    <p>#{id} - {county}</p>
                    {/* <Button onClick={() => props.onShowEditTicketCardModal(props.id)}>
                        <EditIcon />
                    </Button> */}
                </Row>
                <Row>
                    <p>Driver assigned - {driverStatus}</p>
                </Row>
            </Card.Body>
        </Card>
    );
})(style);
 
export default KanbanBoardTicketCard;
