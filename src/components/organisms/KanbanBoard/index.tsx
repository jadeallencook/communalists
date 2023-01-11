import { Container, Col, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import KanbanBoardTicketCard from '@molecules/KanbanBoardTicketCard';
import DragAndDropZone from '@molecules/DragAndDropZone'
import DragAndDropItem from '@components/molecules/DragAndDropItem';

type BoardType =
    | 'Aid Coordinator'
    | 'Driver'
    | 'Reimbursements'

interface KanbanBoardInterface {
    className: string,
    orders: OrderInterface[]
    type: BoardType,
    setOrderData: React.SetStateAction<any>,
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

    const handleDrop = (dropZone, item) => {
        // dropZone is the data obj, for now column name
        // item seems to be the dropZone obj?
        const test = orders
        const updatedOrders = test.map((order) => {
            if(item.id === order.id){
                order[sortField] = dropZone.column
            }
            return order
        })
        setOrderData(updatedOrders)
    }

	return (
		<Container className={className}>
            <h4>Kanban View - {type}</h4>
            <Row>
                {statusOptions.map((status) => (
                    <Col key={status}>
                        <Row>
                        <h5>{status}</h5>
                            <Col 
                                key={status} 
                                className={'kanban-col'}
                                >
                                    {orders && orders
                                        // @ts-ignore order.status is not read as a string even though it is
                                        .filter((order: OrderInterface) => {return order[sortField] === status})
                                        .map((order: OrderInterface) => (
                                            <Row key={JSON.stringify(order.id)} className='order-row'>
                                                <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType={type}/> 
                                                <DragAndDropItem type={type} key={JSON.stringify(order.id)} id={order.id}>
                                                    <KanbanBoardTicketCard
                                                        order={order} 
                                                        type={type}
                                                    />
                                                </DragAndDropItem>
                                            </Row>
                                        ))}
                                <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType={type} minHeight={
                                    orders && orders.filter((order: OrderInterface) => {return order[sortField] === status}).length === 0 ? '100%': '30%'
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