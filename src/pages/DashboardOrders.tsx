import Dashboard from './Dashboard';
import { ButtonGroup, Col, Dropdown, DropdownButton, Form, Row, Table, ToggleButton } from 'react-bootstrap';
import KanbanBoard from '@components/organisms/KanbanBoard';
import React, { useEffect, useState } from 'react';
import { OrderInterface } from '@interfaces/order';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ToggleButtonGroup from '@molecules/ToggleButtonGroup'
import { colorArray } from '../const/colors';
import { truncate } from 'fs/promises';

const mockOrderData = [
	{
    id: '101010101',
    requester: 'abhinav',
    requestDate: 'Jan 1, 1980',
    group: 'self',
    type: 'PICKUP',
    description: 'string',
    location: {
        street: '123string',
        city: 'string',
        state: 'CA',
        zipcode: 95126,
        county: 'Santa Clara'
    },
    assignedTo: 'string',
    status: 'Unassigned',
    lastUpdated: 'string',
	color:''
	},
	{
		id: '101010102',
		requester: 'alex',
		requestDate: 'Jan 1, 1980',
		group: 'sbma',
		type: 'PICKUP',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: 95126,
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Completed',
		lastUpdated: 'string',
		color:''
	},
	{
		id: '101010103',
		requester: 'abhinav',
		requestDate: 'Jan 1, 1980',
		group: 'fnb',
		type: 'PICKUP',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: 95126,
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Unassigned',
		lastUpdated: 'string',
		color:''
	},
	{
		id: '101010104',
		requester: 'alex',
		requestDate: 'Jan 1, 1980',
		group: 'da',
		type: 'PICKUP',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: 95126,
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Completed',
		lastUpdated: 'string',
		color:''
	},
	{
		id: '101010105',
		requester: 'abhinav',
		requestDate: 'Jan 1, 1980',
		group: 'asdf',
		type: 'PICKUP',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: 95126,
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Unassigned',
		lastUpdated: 'string',
		color:''
		},
	{
		id: '101010106',
		requester: 'alex',
		requestDate: 'Jan 1, 1980',
		group: 'fdsa',
		type: 'PICKUP',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: 95126,
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Completed',
		lastUpdated: 'string',
		color:''
	},
]

const DashboardOrders = () => {
	const [orderData, setOrderData] = useState(mockOrderData)
	const [filteredOrderData, setFilteredOrderData] = useState(mockOrderData)
	const [groups, setGroups] = useState<any[]>([])
	const [filters, setFilters] = useState({})
	const [viewType, setViewType] = useState('0')

	const viewTypes = [
		{ name: 'List View', value: '0' },
		{ name: 'Kanban View', value: '1' },
	];

	// TODO: groups should come from user data, not orders
	useEffect(() => {
		let newGroups = []
		orderData.map((order) => {
			if(!newGroups.includes(order.group)) newGroups.push(order.group)
		})
		setGroups(newGroups)
	}, [])

	// Add colors for groups here? Then change check mark colors based on group color?
	// runs on initial data load -> turns first 5 groups 'on'
	useEffect(() => {
		let newFilters = {}
		groups.map((group) => {
			// arbitrary limit on number of groups -> need to limit this due to color constraints
			if(Object.keys(newFilters).length < 5){
				newFilters[group] = true
			} else {
				newFilters[group] = false
			}
			console.log('group', group)
		})
		setFilters({...filters, ...newFilters})
	},[groups])

	const handleChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters({...filters, [e.target.name]: e.target.checked})
	}

	// for now filters are only group based
	useEffect(() => {
		setFilteredOrderData(orderData.map((order) => {
			let newOrder = order
			Object.entries(filters).forEach(([filter, value]) => {
				if(order.group === filter && value && !newOrder.color) {
					const newColor = colorArray.values().next()
					newOrder['color'] = newColor.value
					colorArray.delete(newColor.value)
				}else if(order.group === filter && !value && newOrder.color){
					colorArray.add(newOrder.color)
					newOrder['color'] = ''
				}
			})
			return newOrder
		})
		.filter((order) => {
			let shouldShow = false
			Object.entries(filters).forEach(([filter, value]) => {
				if(order.group === filter && value) {
					shouldShow = true
				}
			})
			return shouldShow
		}))
	}, [filters, orderData])

	useEffect(() => {
		console.log("test -> ", orderData, filteredOrderData)
	}, [orderData, filteredOrderData])

	return (
		// TODO: Needs a toggle for list/kanban view
		// Needs color grouping for kanban tickets based on group
		<Dashboard>
			<Form>
				<ToggleButtonGroup 
					radios={viewTypes}
					state={viewType}
					handleSetState={setViewType}
				/>
				<DropdownButton title="Groups">
					{/* map by filtered order data to access color? */}
					{groups && groups.map((group) => (
						// TODO: On useEffect, the value is not set correctly
						<Form.Check
							key={group}
							type="checkbox"
							disabled={!filters[group] && Object.values(filters).filter(filter => filter === true).length >= 5}
							label={group}
							value={filters[group]}
							checked ={filters[group]}
							name={group}
							onChange={handleChangeFilter}
							// style={{backgroundColor: }}
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

			{viewType === '1' && 
				<DndProvider backend={HTML5Backend}>
					<KanbanBoard 
						orders={filteredOrderData}
						type={'Aid Coordinator'}
						setOrderData={setOrderData}/>
				</DndProvider>
			}	
		</Dashboard>
	);
};

export default DashboardOrders;
