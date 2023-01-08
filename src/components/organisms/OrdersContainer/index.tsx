import { Row, DropdownButton, Form, Table } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { DndProvider } from 'react-dnd'
import { useEffect, useState } from 'react';
import { getNextColor, addToColorArray, resetColorArray } from '@utils/kanbanBoardUtils';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanBoard from '../KanbanBoard';
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
	const [filteredOrderData, setFilteredOrderData] = useState(mockOrderData)
	const [groups, setGroups] = useState<string[]>([])
	const [filters, setFilters] = useState({})
	const [viewType, setViewType] = useState('1')
	const [groupColorMap, setGroupColorMap] = useState(new Map())

	const viewTypes = [
		{ name: 'List View', value: '0' },
		{ name: 'Kanban View', value: '1' },
	];

	// TODO: groups should come from user data, not orders
	useEffect(() => {
		let newGroups = []
		orderData.map((order) => {
			// push {group: group, color: #fff} ?
			if(!newGroups.includes(order.group)) newGroups.push(order.group)
		})
		setGroups(newGroups)
	}, [])

	// runs on initial data load -> turns first 5 groups 'on'
	// Note that groups/orderData should not change without a page reload
	//TODO: consolidate
	useEffect(() => {
		let newFilters = {}
		// arbitrary limit on number of groups -> need to limit this due to color constraints
		groups.map((group) =>
			(Object.keys(newFilters).length < 5) ? newFilters[group] = true	: newFilters[group] = false)
		setFilters({...filters, ...newFilters})

		const initialGroupColorMap = new Map()
        // When tabs change, colorArray is empty and must be reset
        resetColorArray()
		groups.forEach((group, index) => {
			const newColor = (index < 5) ? getNextColor() : ''
			initialGroupColorMap.set(group, newColor) 
		})
		setGroupColorMap(initialGroupColorMap)
	},[groups])

	const handleChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newColor = (e.target.checked) ? 
			getNextColor() : 
			addToColorArray(groupColorMap.get(e.target.name))
		
		setGroupColorMap((prev) => new Map(prev).set(e.target.name, newColor))
		setFilters({...filters, [e.target.name]: e.target.checked})
	}

	// for now filters are only group based
	useEffect(() => {
		setFilteredOrderData(orderData.filter((order) => {
			let shouldShow = false
			Object.entries(filters).forEach(([filter, value]) => {
				if(order.group === filter && value) {
					shouldShow = true
				}
			})
			return shouldShow
		}))
	}, [filters, orderData])

	return (
        <Row className={className}>
            <Form className="orders-controls">
                <ToggleButtonGroup 
                    className="toggle-view"
                    radios={viewTypes}
                    state={viewType}
                    handleSetState={setViewType}
                />
                <DropdownButton title="Groups">
                    {groups && groups.map((group) => (
                        <Form.Check
                            key={group}
                            type="checkbox"
                            disabled={!filters[group] && Object.values(filters).filter(filter => filter === true).length >= 5}
                            label={group}
                            value={filters[group]}
                            checked ={filters[group]}
                            name={group}
                            onChange={handleChangeFilter}
                            // Temporarily doing this as I figure out how to style the checkbox with js
                            style={{backgroundColor: groupColorMap.get(group)}}
                        />
                    ))}
                </DropdownButton>
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

            {/* TODO: sortField should be renamed and tied to the type in a separate object */}
            {viewType === '1' && 
                <DndProvider backend={HTML5Backend}>
                    <KanbanBoard 
                        groupColorMap={groupColorMap}
                        orders={filteredOrderData}
                        type={'Aid Coordinator'}
                        setOrderData={setOrderData}
                        statusOptions={['Unassigned', 'In Progress', 'Completed']}
                        sortField='status'/>
                    <KanbanBoard 
                        groupColorMap={groupColorMap}
                        orders={filteredOrderData}
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