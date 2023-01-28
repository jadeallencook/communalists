const style = () => ({
    backgroundColor: 'var(--bs-secondary)',
    margin: '0 auto',
    width:'90%',
    height: 'fit-content',
    'p': {
        margin: '0px',
        padding: '0px',
        whiteSpace: 'nowrap',
        overflow:'hidden',
        textOverflow: 'ellipsis',
        fontSize: '0.8em'
    },
    '.card-label': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    '.card-title': {
        width: '80%'
    },
    '.card-edit-button': {
        padding: '0 5px',
        width: 'fit-content'
    }
});

export default style;