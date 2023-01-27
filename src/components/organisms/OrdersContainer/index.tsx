import { Row, Dropdown, DropdownButton, Form, Table } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { DndProvider } from 'react-dnd'
import { useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanBoard from '@organisms/KanbanBoard';
import ToggleButtonGroup from '@molecules/ToggleButtonGroup'
import { AidCoordinatorStatusOptions, DriverStatusOptions } from '@consts/kanbanBoard';

interface OrdersContainerInterface {
    className: string,
    initialOrderData: any
} 

const OrdersContainer: StyledComponent = styled(({ 
    className, 
    initialOrderData
}: OrdersContainerInterface) => {
    const [orderData, setOrderData] = useState(initialOrderData)
  
	const [viewType, setViewType] = useState('1')

    const [viewRole, setViewRole] = useState('Aid Coordinator')

	const viewTypes = [
		{ name: 'List View', value: '0' },
		{ name: 'Kanban View', value: '1' },
	];

    const roles = [
        'Aid Coordinator',
        'Driver'
    ]

	return (
        <Row className={className}>
            <Row>
                <Form className="orders-controls">
                    <DropdownButton
                        align="end"
                        title={viewRole}
                        className="kanban-dropdown"
                        >
                        {roles.map((role, index) => (
                            <Dropdown.Item 
                                eventKey={index} 
                                key={role} 
                                title={role} 
                                onClick={(e: any) => setViewRole(e.target.title)}
                                >
                                {role}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                    <ToggleButtonGroup 
                        className="toggle-view"
                        radios={viewTypes}
                        state={viewType}
                        handleSetState={setViewType}
                    />
                </Form>
            </Row>
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
                    {/* Using a ternary here causes some issues in updating the sortField */}
                    {viewRole === 'Aid Coordinator' &&
                        <KanbanBoard 
                            orders={orderData}
                            type={'Aid Coordinator'}
                            setOrderData={setOrderData}
                            statusOptions={AidCoordinatorStatusOptions}
                            sortField='status'/>}
                    {viewRole === 'Driver' &&    
                        <KanbanBoard 
                            orders={orderData}
                            type={'Driver'}
                            setOrderData={setOrderData}
                            statusOptions={DriverStatusOptions}
                            sortField='driverStatus'/>
                    }
                </DndProvider>
            }	
        </Row>
	);
})(style);

export default OrdersContainer;