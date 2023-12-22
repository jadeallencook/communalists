/*
    This is the entry point of the application.
    It is used to render the application.
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './router';
import Layout from './layout';
import Mantine from './mantine';
import './global.css';

const App = () => (
    <Mantine>
        <Layout>
            <Router />
        </Layout>
    </Mantine>
);

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
