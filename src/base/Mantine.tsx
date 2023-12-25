/*
    This file is used to for all the Mantine components.
    For example, if you want to add a theme to all the components,
    you can add it here.
*/

import React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
    white: '#fff',
    black: '#000',
    primaryColor: 'red',
    colors: {
        red: [
            '#e4afa0',
            '#de9b88',
            '#d78770',
            '#d07358',
            '#c95f41',
            '#c34b29',
            '#bc3711',
            '#a9320f',
            '#962c0e',
            '#84270c',
        ],
        gray: [
            '#a6a8a9',
            '#909294',
            '#7a7c7f',
            '#646669',
            '#4d5154',
            '#373b3e',
            '#212529',
            '#1e2125',
            '#1a1e21',
            '#171a1d',
        ],
    },
});

const Mantine = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider theme={theme}>{children}</MantineProvider>
);

export default Mantine;
