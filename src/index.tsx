/*
    This is the entry point of the application.
    It is used to render the application.
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './base/Router';
import Layout from './base/Layout';
import Mantine from './base/Mantine';

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
