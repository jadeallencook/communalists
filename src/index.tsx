/*
    This is the entry point of the application.
    It is used to render the application.
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './base/Router';
import Layout from './base/Layout';
import Mantine from './base/Mantine';
import { Provider } from 'react-redux';
import store from './store';

const App = () => (
    <Provider store={store}>
        <Mantine>
            <Layout>
                <Router />
            </Layout>
        </Mantine>
    </Provider>
);

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
