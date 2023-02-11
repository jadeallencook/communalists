const style = () => ({
    img: {
        height: '50px',
        display: 'block',
        margin: '25px auto',
    },
    tbody: {
        cursor: 'pointer',
    },
    'span.badge': {
        display: 'block',
        marginTop: '2px',
        maxWidth: '125px',
    },
    'span.started': {
        backgroundColor: '#7a2f2f!important',
    },
    'span.ready, span.has-driver': {
        backgroundColor: 'var(--primary)!important',
    },
    'span.complete': {
        backgroundColor: 'grey!important',
    },
    'span.has-no-driver, span.submitted': {
        backgroundColor: '#8c7474!important',
    },
    'span#information-tooltip': {
        fontSize: '0.5em',
        cursor: 'pointer',
    },
});

export default style;
