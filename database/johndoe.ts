import { DatabaseInterface } from '../interfaces/database';

export const johndoe: DatabaseInterface = {
	listings: {
		'santa-clara-ca': {
			johndoe: {
				johndoelisting1: {
					item: 'bedframe',
					location: 'johndoelocation',
					stock: 1,
					description: '',
					image: '',
					attributes: [['size', 'king']],
				},
				johndoelisting2: {
					item: 'bodysoap',
					location: 'johndoelocation',
					stock: 5,
					description: '',
					image: '',
					attributes: [['size', 'eight']],
				},
			},
		},
	},
	locations: {
		johndoe: {
			johndoelocation: {
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
