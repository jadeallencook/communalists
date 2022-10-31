import { DatabaseInterface } from './interfaces/database';

export const database: DatabaseInterface = {
	products: {
		kjhsd123: {
			title: 'Kitchen Table',
			unit: 'units',
		},
		lkjdsf45: {
			title: 'Linens',
			unit: 'yards',
		},
		kjhfeu72: {
			title: 'Bar Soap',
			unit: 'ounces',
		},
	},
	resources: {
		sfbayarea: {
			user123: {
				e37c5a6: {
					product: 'kjhsd123',
					warehouse: 'lijsdf723',
					stock: 1,
					desciption: '',
					image: '',
				},
			},
			sbma: {
				d25n8da: {
					product: 'lkjdsf45',
					warehouse: 'lkjsdf98',
					stock: 5,
					desciption: '',
					image: '',
				},
			},
		},
	},
	warehouses: {
		sbma: {
			lkjsdf98: {
				street: '83 William Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
				county: 'Santa Clara',
			},
		},
		dsacalifornia: {
			iuhf8234: {
				street: '83 William Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
                county: 'Santa Clara'
			},
			dskjfh82: {
				street: '6545 Second Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95113,
                county: 'Santa Clara'
			},
			kjsn2345: {
				street: '123 Main Street',
				city: 'Las Vegas',
				state: 'NV',
				zipcode: 84345,
                county: 'Las Vegas'
			},
		},
	},
	organizations: {
		sbma: {
			name: 'South Bay Mutual Aid',
			bio: '',
			website: '',
			phone: '',
			email: '',
			address: {
				street: '83 William Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
                county: 'Santa Clara'
			},
		},
		dsacalifornia: {
			name: 'Democratic Socialists of America',
			bio: '',
			website: '',
			phone: '',
			email: '',
			address: {
				street: '83 William Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
                county: 'Santa Clara'
			},
		},
	},
	users: {
		user123: {
            organizations: {
                dsacalifornia: 0,
                sbma: 1,
            },
			name: 'John Doe',
			address: {
				street: '83 William Street',
				city: 'San Jose',
				state: 'CA',
				zipcode: 95112,
			},
			warehouses: {
				sfbayarea: {
					lijsdf723: {
						street: '83 William Street',
						city: 'San Jose',
						state: 'CA',
						zipcode: 95112,
					},
				},
			},
		},
	},
};
