import { OrganizationInterface } from '../interfaces/organization';

export const organizations: { [key: string]: OrganizationInterface } = {
	organization1: {
		name: 'Organization 1',
		bio: '',
		website: '',
		phone: 5555555555,
		email: '',
		address: {
			street: '1 Main Street',
			city: 'San Jose',
			state: 'CA',
			zipcode: 95112,
			county: 'Santa Clara',
		},
	},
};
