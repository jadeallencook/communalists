const style = () => ({
    '.container': {
        paddingTop: '8px',
        paddingBottom: '8px',
    },
    '.row': {
        gap: '8px',
    },
    '.col': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0',
    },
    '.col > div, button': {
        width: '100%',
    },
    '@media only screen and (max-width: 576px)': {
        '.row': {
            flexDirection: 'column',
        },
    },
});

export default style;
