const style = () => ({
    marginBottom: '15px',
    'select, button, .form-check-input': {
        cursor: 'pointer',
    },
    '.form-check-input': {
        marginTop: 0,
    },
    '.form-check-input:checked': {
        backgroundColor: 'var(--primary)',
        borderColor: 'var(--primary)',
    },
    '.input-group-text': {
        backgroundColor: 'var(--bs-gray-600)',
        color: 'var(--white)',
        border: 'none',
    },
    'button.search-btn': {
        backgroundColor: 'var(--black) !important',
        border: 'none',
    },
    '.bg-danger': {
        backgroundColor: 'var(--primary) !important',
    },
});

export default style;
