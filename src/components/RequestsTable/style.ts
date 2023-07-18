const style = () => ({
    img: {
        height: '50px',
        display: 'block',
        margin: '25px auto',
    },
    tbody: {
        cursor: 'pointer',
    },
    '@media only screen and (max-width: 992px)': {
        'tr > td:nth-last-child(-n+1), tr > th:nth-last-child(-n+1)': {
            display: 'none',
        },
    },
    '@media only screen and (max-width: 767px)': {
        'tr > td:nth-last-child(-n+2), tr > th:nth-last-child(-n+2)': {
            display: 'none',
        },
    },
});

export default style;
