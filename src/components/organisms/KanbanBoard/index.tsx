import { Container, Col, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';
import KanbanBoardTicketCard from '../../molecules/KanbanBoardTicketCard';
import { useDrag } from 'react-dnd'
import DragAndDropZone from '@molecules/DragAndDropZone'
import { colorArray } from '../../../const/colors'
import { useEffect } from 'react';
import DragAndDropItem from '@components/molecules/DragAndDropItem';

type BoardType =
    | 'Aid Coordinator'
    | 'Driver'
    | 'Reimbursements'

interface KanbanBoardInterface {
    className: string,
    groupColorMap: any,
    orders: { [key: string]: OrderInterface }[]
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
        console.log(updatedOrders)
    }

	return (
		<Container className={className}>
            <p>Kanban View - {type}</p>
            <Row>
                {statusOptions.map((status) => (
                    <Col 
                        key={status} 
                        className={'kanban-col'}
                        >
                        <h5>{status}</h5>
                        {/* TODO: put a ternary here to add a marginTop to KanbanBoardDroopZone where length is 0 */}
                        <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType='Aid Coordinator' /> 
                            {orders && orders
                                // @ts-ignore order.status is not read as a string even though it is
                                .filter((order) => {return order.status === status})
                                .map((order) => (
                                        // <DragAndDropItem 
                                        //     groupColorMap={groupColorMap} 
                                        //     order={order} type={type} 
                                        //     key={JSON.stringify(order.id)}/>
                                    <DragAndDropItem type={type} key={JSON.stringify(order.id)}>
                                        <KanbanBoardTicketCard
                                            groupColorMap={groupColorMap} 
                                            order={order} 
                                            type={type} 
                                        
                                        />
                                    </DragAndDropItem>
                                ))}
                        {/* Only have two KanbanBoardDropZones if orders are in column */}
                        {/* @ts-ignore order.status is not read as a string even though it is */}
                        {orders && orders.filter((order) => {return order.status === status}).length !==0 &&
                            <DragAndDropZone data={{column: status}} onDrop={handleDrop} itemType='Aid Coordinator' /> }
                    </Col>
                ))}
            </Row>
        </Container>
	);
})(style);

export default KanbanBoard;