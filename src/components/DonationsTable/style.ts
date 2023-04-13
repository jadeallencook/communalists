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
        maxWidth: '115px',
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
    'div.spinner-border': {
        display: 'block',
        margin: '25px auto',
    },
    '@media only screen and (max-width: 992px)': {
        '.name': {
            display: 'none',
        },
    },
    '@media only screen and (max-width: 768px)': {
        '.location': {
            display: 'none',
        },
    },
    '@media only screen and (max-width: 576px)': {
        '.language': {
            display: 'none',
        },
    },
});

export default style;
