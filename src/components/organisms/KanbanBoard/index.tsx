import { Container, Col, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import KanbanBoardTicketCard from '../KanbanBoardTicketCard';
import { useEffect } from 'react';

interface KanbanBoardInterface {
    className: string
    orders: { [key: string]: OrderInterface }[]
}

const KanbanBoard: StyledComponent = styled(({ className, orders }: KanbanBoardInterface) => {
    const statusOptions = ['Unassigned', 'In Progress', 'Completed']

	return (
		<Container>
            <Row>
                {statusOptions.map((status) => (
                    <Col key={status}>
                        <p>{status}</p>
                        {orders
                            // @ts-ignore for some reason order.status is not read as a string even though it is
                            .filter((order) => {return order.status === status})
                            .map((order) => (
                                <KanbanBoardTicketCard key={order.id} order={order}/>
                            ))}
                    </Col>
                ))}
            </Row>
        </Container>
	);
})(style);

export default KanbanBoard;