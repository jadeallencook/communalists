import Dashboard from './Dashboard';
import { DropdownButton, Form, Table } from 'react-bootstrap';
import KanbanBoard from '@components/organisms/KanbanBoard';
import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ToggleButtonGroup from '@molecules/ToggleButtonGroup'
import { colorArray } from '../const/colors';
import { getNextColor, addToColorArray } from '@utils/kanbanBoardUtils'

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
	const [groups, setGroups] = useState<string[]>([])
	const [filters, setFilters] = useState({})
	const [viewType, setViewType] = useState('0')
	// TODO: Should we create a groupColorMap {group: color} and pass into child?
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
		<Dashboard>
			<Form>
				<ToggleButtonGroup 
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

			{viewType === '1' && 
				<DndProvider backend={HTML5Backend}>
					<KanbanBoard 
						groupColorMap={groupColorMap}
						orders={filteredOrderData}
						type={'Aid Coordinator'}
						setOrderData={setOrderData}/>
				</DndProvider>
			}	
		</Dashboard>
	);
};

export default DashboardOrders;
