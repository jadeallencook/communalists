import { DatabaseInterface } from '../interfaces/database';

export const johndoe: DatabaseInterface = {
	resources: {
		'santa-clara-ca': {
			johndoe: {
				johndoeresource1: {
					product: 'bedframe',
					warehouse: 'johndoewarehouse',
					stock: 1,
					description: '',
					image: '',
					attributes: [['size', 'king']],
				},
				johndoeresource2: {
					product: 'bodysoap',
					warehouse: 'johndoewarehouse',
					stock: 5,
					description: '',
					image: '',
					attributes: [['size', 'eight']],
				},
			},
		},
	},
	warehouses: {
		johndoe: {
			johndoewarehouse: {
				street: '23 Second Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95113,
				county: 'Santa Clara',
			},
		},
	},
	users: {
		johndoe: {
			name: 'John Doe',
			address: {
				street: '12 Washington Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
				county: 'Santa Clara',
			},
			subjectPronoun: 'they',
			objectPronoun: 'them',
			isRemote: true,
		},
	},
};
