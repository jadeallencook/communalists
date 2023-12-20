import React from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import {
    Outlet,
    RouterProvider,
    Router,
    Route,
    RootRoute,
} from '@tanstack/react-router';

const rootRoute = new RootRoute({
    component: () => (
        <Layout>
            <Outlet />
        </Layout>
    ),
});

const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>Hello World</h1>,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const theme = createTheme({});

const Layout = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
);

const App = () => (
    <MantineProvider theme={theme}>
        <Layout>
            <RouterProvider router={router} />
        </Layout>
    </MantineProvider>
);

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
