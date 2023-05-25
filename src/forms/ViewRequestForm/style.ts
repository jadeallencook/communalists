const style = () => ({
    '.modal-footer': {
        paddingRight: '0px',
        paddingLeft: '0px',
        paddingBottom: '0px',
        '> button': {
            marginRight: '0px',
        },
    },
    'button.accordion-button': {
        color: 'var(--white)',
    },
    'button.accordion-button::after': {
        filter: 'invert(100%) grayscale(100%)',
    },
    '.pronouns-field-container': {
        width: '100%',
        margin: '0 0 16px 0',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    '.pronouns-field-control': {
        width: '45%',
    },
});

export default style;
