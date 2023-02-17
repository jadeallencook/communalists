const style = () => ({
	marginTop: '15px',
	borderColor: 'var(--primary)!important',
	'.nav-item > a' : {
		color: 'var(--primary)!important'
	},
	'.nav-item > a:hover' : {
		borderColor: 'var(--primary)!important',
	},
	'.nav-item > a.active' : {
		color: 'var(--white)!important',
		backgroundColor: 'var(--primary)!important',
		borderColor: 'var(--primary)!important',
	}
});

export default style;
