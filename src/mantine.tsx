/*
    This file is used to for all the Mantine components.
    For example, if you want to add a theme to all the components,
    you can add it here.
*/

import React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({});

const Mantine = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider theme={theme}>{children}</MantineProvider>
);

export default Mantine;
