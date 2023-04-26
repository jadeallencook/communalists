const style = () => ({
    'input, select, .alert': {
        maxWidth: '500px',
    },
    'div.form-check': {
        display: 'inline-block',
        width: '25%',
    },
    '@media only screen and (max-width: 992px)': {
        'div.form-check': {
            display: 'inline-block',
            width: '50%',
        },
    },
    'div.form-check > *': {
        cursor: 'pointer',
    },
});

export default style;
