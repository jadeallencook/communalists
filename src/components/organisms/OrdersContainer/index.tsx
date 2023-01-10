import { Row, DropdownButton, Form, Table } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { DndProvider } from 'react-dnd'
import { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanBoard from '@organisms/KanbanBoard';
import ToggleButtonGroup from '@molecules/ToggleButtonGroup'

interface OrdersContainerInterface {
    className: string,
    groupColorMap: any,
    mockOrderData: any
} 

const OrdersContainer: StyledComponent = styled(({ 
    className, 
    mockOrderData
}: OrdersContainerInterface) => {
    const [orderData, setOrderData] = useState(mockOrderData)
	const [viewType, setViewType] = useState('1')

	const viewTypes = [
		{ name: 'List View', value: '0' },
		{ name: 'Kanban View', value: '1' },
	];

    // TODO: add filtering search bar (tag based?)

	return (
        <Row className={className}>
            <Form className="orders-controls">
                <ToggleButtonGroup 
                    className="toggle-view"
                    radios={viewTypes}
                    state={viewType}
                    handleSetState={setViewType}
                />
            </Form>
            {viewType === '0' &&
                <>
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center' }}>
                                    You do not currently have any orders placed...
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center' }}>
                                    No one has placed any orders for your listings...
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </>
            }

            {viewType === '1' && 
                <DndProvider backend={HTML5Backend}>
                    <KanbanBoard 
                        orders={orderData}
                        type={'Aid Coordinator'}
                        setOrderData={setOrderData}
                        statusOptions={['Unassigned', 'In Progress', 'Completed']}
                        sortField='status'/>
                    <KanbanBoard 
                        orders={orderData}
                        type={'Driver'}
                        setOrderData={setOrderData}
                        statusOptions={['Unassigned', 'In Progress', 'Completed']}
                        sortField='driverStatus'/>
                </DndProvider>
            }	
        </Row>
	);
})(style);

export default OrdersContainer;