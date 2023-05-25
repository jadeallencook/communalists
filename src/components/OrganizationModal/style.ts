const style = () => ({
    '.badge': {
        width: '80px',
        marginRight: '10px',
    },
    '.badge.bg-primary': {
        backgroundColor: 'var(--primary)!important',
    },
    '.badge.bg-primary.approve-request:hover': {
        cursor: 'pointer',
        opacity: '0.75',
    },
    'img.reveal-name': {
        width: '15px',
        marginLeft: '5px',
        cursor: 'pointer',
        marginTop: '-3px',
    },
});

export default style;
