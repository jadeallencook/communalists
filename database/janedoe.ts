import { DatabaseInterface } from '../interfaces/database';

export const janedoe: DatabaseInterface = {
	listings: {
		'santa-clara-ca': {
			janedoe: {
				janedoelisting1: {
					item: 'bedframe',
					location: 'group1location',
					stock: 1,
					description: '',
					image: '',
					attributes: [['size', 'twin']],
				},
				janedoelisting2: {
					item: 'shampoo',
					location: 'group1location',
					stock: 5,
					description: '',
					image: '',
					attributes: [['size', 'eight']],
				},
			},
		},
	},
	groups: {
		group1: {
			name: 'South Bay Mutual Aid',
			bio: '',
			website: '',
			phone: '+15555555555',
			email: '',
			address: {
				street: '46 Santa Clara Avenue',
				city: 'San Jose',
				state: 'CA',
				zipcode: '95112',
				county: 'Santa Clara',
			},
		},
	},
	locations: {
		group1: {
			group1location: {
				street: '23 Second Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: '95113',
				county: 'Santa Clara',
			},
		},
	},
	users: {
		janedoe: {
			name: 'Jane Doe',
			groups: { group1: 0 },
			address: {
				street: '954 Main Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: '95112',
				county: 'Santa Clara',
			},
			subjectPronoun: 'she',
			objectPronoun: 'her',
			isRemote: true,
		},
	},
};
