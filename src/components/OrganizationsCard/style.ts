const style = () => ({
    marginBottom: '15px',
    border: 'none',
    button: {
        marginTop: '5px',
        float: 'right',
    },
    'button:not(:first-child)': { marginRight: '5px' },
    '.card-header, .card-footer': {
        backgroundColor: 'var(--primary)',
    },
    '.text-muted': {
        color: 'var(--bs-gray-300)!important',
    },
    '.role-badge': {
        backgroundColor: 'var(--primary)!important',
    },
    '.badge': {
        marginRight: '5px',
    },
});

export default style;
