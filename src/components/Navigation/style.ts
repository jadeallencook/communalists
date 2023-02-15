const style = () => ({
    backgroundColor: 'var(--primary)!important',
    '.navbar-brand': {
        fontWeight: 'bold',
    },
    a: {
        color: 'var(--bs-nav-link-color)!important',
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
    'div#language-selector': {
        marginLeft: '5px',
        a: {
            padding: '5px',
            fontWeight: 'bold',
            borderRadius: '5px',
            backgroundColor: 'var(--bs-nav-link-color)',
            marginLeft: '5px',
            fontSize: '.75em',
            cursor: 'pointer',
            color: 'var(--primary)!important',
        },
        'a:hover, a.active': {
            backgroundColor: 'var(--white)',
        },
    },
    'button.btn-secondary': {
        marginLeft: '15px',
        float: 'right',
    },
    'a.dropdown-item.active, a.dropdown-item:active': {
        backgroundColor: 'var(--primary)',
    },
});

export default style;
