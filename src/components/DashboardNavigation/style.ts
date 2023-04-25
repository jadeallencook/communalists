const style = () => ({
    margin: '15px 0px',
    borderColor: 'var(--primary)!important',
    '.nav-item > a': {
        color: 'var(--white)!important',
        backgroundColor: 'var(--bs-gray-700)!important',
        margin: '0 5px 5px 0',
    },
    '.nav-item > a:hover': {
        borderColor: 'var(--primary)!important',
    },
    '.nav-item > a.active': {
        color: 'var(--white)!important',
        backgroundColor: 'var(--primary)!important',
        borderColor: 'var(--primary)!important',
    },
});

export default style;
