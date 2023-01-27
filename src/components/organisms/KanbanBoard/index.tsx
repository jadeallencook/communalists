import { Container, Col, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import KanbanBoardTicketCard from '@molecules/KanbanBoardTicketCard';
import DragAndDropZone from '@molecules/DragAndDropZone'
import DragAndDropItem from '@components/molecules/DragAndDropItem';
import { Dispatch } from 'react';

type BoardType =
    | 'Aid Coordinator'
    | 'Driver'
    | 'Reimbursements'

interface KanbanBoardInterface {
    className: string,
    orders: OrderInterface[]
    type: BoardType,
    setOrderData: Dispatch<React.SetStateAction<OrderInterface[]>>,
    statusOptions: string[],
    sortField: string
} 

const KanbanBoard: StyledComponent = styled(({ 
    className, 
    orders, 
    type, 
    setOrderData,
    statusOptions,
    sortField
}: KanbanBoardInterface) => {

    const handleDrop = (dropZone: any, item: OrderInterface) => {
        const updatedOrders = orders.map((order) => {
            if(item.id === order.id){
                order[sortField] = dropZone.column
            }
            return order
        })
        setOrderData(updatedOrders)
    }

	return (
		<Container className={className}>
            <Row className="test" style={{width: Math.max(250 * statusOptions.length, document.body.clientWidth * 0.8)}}>
                {statusOptions.map((status) => (
                    <Col key={status}>
                        <Row>
                        <h5>{status}</h5>
                            <Col 
                                key={status} 
                                className={'kanban-col'}
                                >
                                    {orders && orders
                                        .filter((order: OrderInterface) => {return order[sortField] === status})
                                        .map((order: OrderInterface) => (
                                            <Row key={order.id} className='order-row'>
                                                <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType={type}/> 
                                                <DragAndDropItem type={type} key={order.id} id={order.id}>
                                                    <KanbanBoardTicketCard
                                                        order={order} 
                                                        type={type}
                                                    />
                                                </DragAndDropItem>
                                            </Row>
                                        ))}
                                <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType={type} minHeight={
                                    orders && orders.filter((order: OrderInterface) => {return order[sortField] === status}).length === 0 ? '40vh': '10px'
                                }/>
                            </Col>
                        </Row>
                    </Col>
                ))}
            </Row>
        </Container>
	);
})(style);

export default KanbanBoard;