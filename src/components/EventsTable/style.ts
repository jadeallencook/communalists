const style = () => ({
    '.list-group-item': {
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        '> .address-container': {
            textAlign: 'right',
        },
    },
    '.badge:not(.bg-secondary)': {
        marginRight: '5px',
        display: 'inline-block',
        textTransform: 'capitalize',
    },
    '.badge.bg-secondary': {
        marginLeft: '5px',
    },
    '.input-group': {
        marginBottom: '15px',
        '*': { textTransform: 'capitalize' },
    },
    '@media only screen and (max-width: 768px)': {
        '.list-group-item': {
            gridTemplateColumns: '1fr',
            '> .address-container': {
                textAlign: 'left',
                marginTop: '15px',
            },
        },
    },
});

export default style;
