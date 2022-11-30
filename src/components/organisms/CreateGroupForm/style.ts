const style = () => ({
	input: {
		maxWidth: '500px',
	},
	'select, input[name="phone"], input[name="email"], input[name="address.city"], input[name="address.zipcode"]': {
		maxWidth: '250px',
	},
    'select[name="state"]': {
        maxWidth: '100px'
    },
    'p.help.is-danger': {
        color: 'red',
        marginTop: '0.6rem'
    },
    '#submit-button': {
		display: 'none'
	}
});

export default style;
