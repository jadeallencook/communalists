/* 
    This is a sample router file. It is not used in the project.
    It is here to show how to use the @tanstack/react-router library.
    This file is not used in the project.
*/

import React from 'react';
import {
    Outlet,
    RouterProvider,
    Router as TanstackRouter,
    Route,
    RootRoute,
} from '@tanstack/react-router';
import Home from '../pages/home';
import Login from '../pages/Login';
import Form from '../pages/Form';
import Dashboard from '../pages/Dashboard';

const rootRoute = new RootRoute({
    component: () => <Outlet />,
});

const homeRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/home',
    component: () => <Home />,
});

const loginRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <Login />,
});

const formRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/form',
    component: () => <Form />,
});

const dashboardRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <Dashboard />,
});

const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <Home />,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    homeRoute,
    loginRoute,
    formRoute,
    dashboardRoute,
]);

const router = new TanstackRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const Router = () => <RouterProvider router={router} />;

export default Router;
