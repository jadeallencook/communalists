import Dashboard from './Dashboard';
import OrdersContainer from '@components/organisms/OrdersContainer';
import { OrderInterface } from '@interfaces/order';

const mockOrderData: OrderInterface[] = [
	{
    id: '101010101',
    requester: 'abhinavsadfasdf',
    requestDate: new Date(),
    group: 'self',
    type: 'Pickup',
    description: 'string',
    location: {
        street: '123string',
        city: 'string',
        state: 'CA',
        zipcode: '95126',
        county: 'Santa Clara'
    },
    assignedTo: 'string',
    status: 'Unassigned',
	driverStatus: 'Unassigned',
    lastUpdated: 'string',
	},
	{
		id: '101010102',
		requester: 'alex',
		requestDate: new Date(),
		group: 'sbma',
		type: 'Pickup',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: '95126',
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Completed',
		driverStatus: 'Unassigned',
		lastUpdated: 'string',
	},
	{
		id: '101010103',
		requester: 'abhinav',
		requestDate: new Date(),
		group: 'sbma',
		type: 'Pickup',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: '95126',
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Unassigned',
		driverStatus: 'Unassigned',
		lastUpdated: 'string',
	},
	{
		id: '101010104',
		requester: 'alex',
		requestDate: new Date(),
		group: 'sbma',
		type: 'Pickup',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: '95126',
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Completed',
		driverStatus: 'Unassigned',
		lastUpdated: 'string',
	},
	{
		id: '101010105',
		requester: 'abhinav',
		requestDate: new Date(),
		group: 'sbma',
		type: 'Pickup',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: '95126',
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Unassigned',
		driverStatus: 'Unassigned',
		lastUpdated: 'string',
	},
	{
		id: '101010106',
		requester: 'alex',
		requestDate: new Date(),
		group: 'sbma',
		type: 'Pickup',
		description: 'string',
		location: {
			street: '123string',
			city: 'string',
			state: 'CA',
			zipcode: '95126',
			county: 'Santa Clara'
		},
		assignedTo: 'string',
		status: 'Completed',
		driverStatus: 'Unassigned',
		lastUpdated: 'string',
	},
]

const DashboardOrders = () => {
	return (
		<Dashboard>
			<OrdersContainer initialOrderData={mockOrderData}/>
		</Dashboard>
	);
};

export default DashboardOrders;
