const style = () => ({
    color: 'var(--black)',
    '> .card': {
        backgroundColor: 'var(--bs-gray-700)!important',
        marginBottom: 'var(--spacing-large)',
    },
    '.accordion-item': {
        borderColor: 'var(--bs-gray-900) !important',
        borderWidth: 'var(--bs-card-border-width)  !important',
    },
    '.accordion-body': {
        backgroundColor: 'var(--bs-gray-300) !important',
    },
    '.accordion-item > .accordion-header > button': {
        backgroundColor: 'var(--bs-gray-800) !important',
        color: 'var(--white) !important',
    },
    '.accordion-item > .accordion-header > button::after': {
        filter: 'invert(42%) brightness(119%) contrast(119%)',
    },
});

export default style;
