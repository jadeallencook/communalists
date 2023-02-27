const style = () => ({
    '.badge:not(:first-child)': {
        marginLeft: '5px',
    },
    '.badge': {
        backgroundColor: 'var(--primary)!important',
    },
    'tbody > tr': {
        cursor: 'pointer',
    },
    '.spinner-border': {
        margin: '25px auto',
        display: 'block',
    },
});

export default style;
