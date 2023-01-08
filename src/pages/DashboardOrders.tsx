import Dashboard from './Dashboard';
import OrdersContainer from '@components/organisms/OrdersContainer';

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
	driverStatus: 'Unassigned',
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
		driverStatus: 'Unassigned',
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
		driverStatus: 'Unassigned',
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
		driverStatus: 'Unassigned',
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
		driverStatus: 'Unassigned',
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
		driverStatus: 'Unassigned',
		lastUpdated: 'string',
		color:''
	},
]

const DashboardOrders = () => {
	return (
		<Dashboard>
			<OrdersContainer mockOrderData={mockOrderData}/>
		</Dashboard>
	);
};

export default DashboardOrders;
