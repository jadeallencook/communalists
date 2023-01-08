import { Card, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import { AddressInterface } from '@interfaces/address';
import { useEffect, useState } from 'react';

interface KanbanBoardTicketCardInterface {
    className: string
    groupColorMap: any,
    order: OrderInterface
    role: string,
}

const KanbanBoardTicketCard: StyledComponent = styled(({ 
    className, 
    groupColorMap,
    order, 
    role, 
}: KanbanBoardTicketCardInterface) => {

    const [color, setColor] = useState('#fff')

    // Move to utils and restyle the card
    const shortenString = (str: string) => {
        if (str.length <= 15) return str
        return `${str.slice(0, 15)}...`
    }

    const addressToString = (address: AddressInterface) => {
        return `${address.street}, ${address.city}, ${address.county}, ${address.state}, ${address.zipcode}`
    }

    useEffect(() => {
        setColor(groupColorMap.get(order.group))
        console.log("settings colors", order.group, groupColorMap.get(order.group), groupColorMap)
    }, [groupColorMap])

    return (
        <Card className={className} role={role}  style={{borderLeft: `${color} 5px solid`}}>
            <Card.Body>
                <Row>
                    <p>Order: {order.id}</p>
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
