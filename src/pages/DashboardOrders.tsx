import Dashboard from './Dashboard';
import { Col, Dropdown, DropdownButton, Form, Row, Table } from 'react-bootstrap';
import KanbanBoard from '@components/organisms/KanbanBoard';
import React, { useEffect, useState } from 'react';
import { OrderInterface } from '@interfaces/order';

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
	},
	{
		id: '101010102',
		requester: 'abhinav',
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
		},
]

const DashboardOrders = () => {
	const [orderData, setOrderData] = useState(mockOrderData)
	const [groups, setGroups] = useState<string[]>([])
	const [filters, setFilters] = useState({})

	// TODO: groups should come from user data, not orders
	useEffect(() => {
		let newGroups = []
		orderData.map((order) => {
			if(!newGroups.includes(order.group)) newGroups.push(order.group)
		})
		setGroups(newGroups)
	}, [])

	useEffect(() => {
		let newFilters = {}
		groups.map((group) => newFilters[group] = false)
		setFilters({...filters, ...newFilters})
	},[groups])

	const handleChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters({...filters, [e.target.name]: e.target.checked})
	}

	// for now filters are only group based
	useEffect(() => {
		setOrderData(mockOrderData.filter((order) => {
			let shouldShow = false
			Object.entries(filters).forEach(([filter, value]) => {
				if(order.group === filter && value) shouldShow = true
			})
			return shouldShow
		}))
	}, [filters])

	return (
		<Dashboard>
			<DropdownButton title="group-filter">
				<Form>
					{groups && groups.map((group) => (
						<Form.Check
							type="checkbox"
							label={group}
							value={filters[group]}
							name={group}
							onChange={handleChangeFilter}
						/>
					))}
				</Form>
			</DropdownButton>
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

			<KanbanBoard orders={orderData}/>
		</Dashboard>
	);
};

export default DashboardOrders;
