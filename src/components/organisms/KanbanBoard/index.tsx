import { Container, Col, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import KanbanBoardTicketCard from '../../molecules/KanbanBoardTicketCard';
import DragAndDropZone from '@molecules/DragAndDropZone'
import DragAndDropItem from '@components/molecules/DragAndDropItem';

type BoardType =
    | 'Aid Coordinator'
    | 'Driver'
    | 'Reimbursements'

interface KanbanBoardInterface {
    className: string,
    groupColorMap: any,
    // orders: { [key: string]: OrderInterface }[]
    orders: any
    type: BoardType,
    setOrderData: React.SetStateAction<any>
} 

// TODO: 
// Changed status field depends on which board we are looking at -> already done via passing props from parent?

const KanbanBoard: StyledComponent = styled(({ 
    className, 
    groupColorMap, 
    orders, 
    type, 
    setOrderData 
}: KanbanBoardInterface) => {
    // TODO: pull from orders when that pr gets merged
    const statusOptions = ['Unassigned', 'In Progress', 'Completed']

    const handleDrop = (dropZone, item) => {
        // dropZone is the data obj, for now column name
        // item seems to be the dropZone obj?
        const test = orders
        const updatedOrders = test.map((order) => {
            if(item.id === order.id){
                order.status = dropZone.column
            }
            return order
        })
        setOrderData(updatedOrders)
    }

	return (
		<Container className={className}>
            <h3>Kanban View - {type}</h3>
            <Row>
                {statusOptions.map((status) => (
                    <Col 
                        key={status} 
                        className={'kanban-col'}
                        >
                        <h5>{status}</h5>
                        {/* TODO: put a ternary here to add a marginTop to KanbanBoardDroopZone where length is 0 */}
                        {/* <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType='Aid Coordinator' />  */}
                            {orders && orders
                                // @ts-ignore order.status is not read as a string even though it is
                                .filter((order) => {return order.status === status})
                                .map((order) => (
                                    <Row key={JSON.stringify(order.id)}>
                                    <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType='Aid Coordinator'/> 
                                    <DragAndDropItem type={type} key={JSON.stringify(order.id)} orderId={order.id}>
                                        <KanbanBoardTicketCard
                                            groupColorMap={groupColorMap} 
                                            order={order} 
                                            type={type}
                                        />
                                    </DragAndDropItem>
                                    </Row>
                                ))}
                        {/* Only have two KanbanBoardDropZones if orders are in column */}
                        {/* @ts-ignore order.status is not read as a string even though it is */}
                        {/* {console.log(orders, status)} */}
                        {/* {console.log("test -> ", orders.filter((order: OrderInterface) => {return order.status === status}))} */}
                        {/* {orders && orders.filter((order: OrderInterface) => {return order.status === status}).length !== 0 &&
                            <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType='Aid Coordinator' /> } */}
                        <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType='Aid Coordinator' height='100%'/>
                    </Col>
                ))}
            </Row>
        </Container>
	);
})(style);

export default KanbanBoard;