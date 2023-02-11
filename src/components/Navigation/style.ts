const style = () => ({
    backgroundColor: 'var(--primary)!important',
    '.navbar-brand': {
        fontWeight: 'bold',
    },
    a: {
        color: 'var(--bs-nav-link-color)!important',
    },
    'div.justify-content-end > a': {
        marginLeft: '15px',
    },
    'a:hover': {
        color: 'var(--white)!important',
    },
    'a.active': {
        color: 'var(--white)!important',
    },
    img: {
        width: '30px',
        marginRight: '10px',
        marginTop: '-5px',
    },
    '@media only screen and (max-width: 500px)': {
        'span.navbar-brand > a > span': {
            display: 'none',
        },
    },
});

export default style;
