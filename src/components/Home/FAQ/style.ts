const style = () => ({
    marginBottom: 'var(--spacing-large)',
    '.accordion-item': {
        borderColor: 'var(--bs-gray-500) !important',
    },
    '.accordion-header > button': {
        color: 'var(--white)!important',
    },
    '.accordion-button::after': {
        filter: 'invert(100%) sepia(0%) saturate(0%) brightness(100%)',
    },
});

export default style;
