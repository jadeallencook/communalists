import React from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({});

const App = () => (
    <MantineProvider theme={theme}>
        <h1>Hello World</h1>
    </MantineProvider>
);

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
