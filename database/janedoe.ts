import { DatabaseInterface } from '../interfaces/database';

export const janedoe: DatabaseInterface = {
	resources: {
		'santa-clara': {
			janedoe: {
				janedoeresource1: {
					product: 'bedframe',
					warehouse: 'organization1warehouse',
					stock: 1,
					description: '',
					image: '',
					type: 1,
				},
				janedoeresource2: {
					product: 'bodysoap',
					warehouse: 'organization1warehouse',
					stock: 5,
					description: '',
					image: '',
					type: 1,
				},
			},
		},
	},
	organizations: {
		organization1: {
			name: 'South Bay Mutual Aid',
			bio: '',
			website: '',
			phone: 5555555555,
			email: '',
			address: {
				street: '46 Santa Clara Avenue',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
				county: 'Santa Clara',
			},
		},
	},
	warehouses: {
		organization1: {
			organization1warehouse: {
				street: '23 Second Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95113,
				county: 'Santa Clara',
			},
		},
	},
	users: {
		janedoe: {
			name: 'Jane Doe',
			organizations: { organization1: 0 },
			address: {
				street: '954 Main Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
				county: 'Santa Clara',
			},
			subjectPronoun: 'she',
			objectPronoun: 'her',
			isRemote: true,
		},
	},
};
