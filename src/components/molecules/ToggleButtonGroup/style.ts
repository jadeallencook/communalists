const style = () => ({
    display: 'flex',
    // width: 'fit-content',
    justifyContent: 'flex-end',
    '.toggle': {
        maxWidth:'120px'
    },
    '.active': {
        background: 'var(--bs-nav-link-color)'
    },
    '.inactive': {
        background: 'var(--bs-primary)'
    }
});

export default style;
