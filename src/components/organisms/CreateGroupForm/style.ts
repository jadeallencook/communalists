const style = () => ({
	input: {
		maxWidth: '500px',
	},
	'select, input[name="phone"], input[name="email"], input[name="city"], input[name="zipcode"], input[name="county"]': {
		maxWidth: '250px',
	},
    'select[name="state"]': {
        maxWidth: '100px'
    },
    'p.help.is-danger': {
        color: 'red',
        marginTop: '0.6rem'
    }
});

export default style;
