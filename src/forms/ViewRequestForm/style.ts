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
        filter: 'invert(100%)',
    },
});

export default style;
