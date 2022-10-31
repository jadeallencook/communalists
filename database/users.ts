import { UserInterface } from '../interfaces/user';

export const users: { [key: string]: UserInterface } = {
	user1: {
		name: 'John Doe',
		organizations: {
			organization1: 1,
		},
		address: {
			street: '1 Main Street',
			city: 'San Jose',
			state: 'CA',
			zipcode: 95112,
			county: 'Santa Clara',
		},
		subjectPronoun: 'they',
		objectPronoun: 'them',
		isRemote: true,
	},
};
