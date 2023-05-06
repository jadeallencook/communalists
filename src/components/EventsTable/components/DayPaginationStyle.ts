const style = () => ({
    display: 'block',
    textAlign: 'center',
    marginBottom: '15px',
    '> li': {
        display: 'inline-block',
        width: '120px',
        textTransform: 'capitalize',
        '> a': {
            backgroundColor: 'var(--primary)!important',
            borderColor: 'var(--primary)!important',
            color: '#fff!important',
            fontWeight: 'bold',
            outline: 0,
            boxShadow: 'none!important',
        },
    },
});

export default style;
