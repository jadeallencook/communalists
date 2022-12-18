import { Button, Card, Container, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';

interface KanbanBoardTicketCardInterface {
    className: string
    order: OrderInterface
}

const KanbanBoardTicketCard: StyledComponent = styled(({ className, order }: KanbanBoardTicketCardInterface) => {

    const shortenString = (str: string) => {
        if (str.length <= 15) return str
        return `${str.slice(0, 15)}...`
    }

    return (
        <Card>
            <Card.Body>
                <Row>
                    <p>{order.city}</p>
                    {/* <Button onClick={() => props.onShowEditTicketCardModal(props.id)}>
                        <EditIcon />
                    </Button> */}
                </Row>
                <Row sx={{ display: 'grid', gridTemplateColumns: '45% 45%', textAlign: 'start', margin: '5% 0 5% 0' }}>
                    <p>Address:</p>
                    <p>{shortenString(order.address)}</p>
                    <p>Requester</p>
                    <p>{shortenString(order.name)}</p>
                    <p>Description:</p>
                    <p>{shortenString(order.description)}</p>
                    <p>Assigned To:</p>
                    <p>{shortenString(order.assignedTo)}</p>
                </Row>
            </Card.Body>
        </Card>
    );
})(style);

export default KanbanBoardTicketCard;
