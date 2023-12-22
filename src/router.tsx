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

const rootRoute = new RootRoute({
    component: () => <Outlet />,
});

const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>Hello World</h1>,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = new TanstackRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const Router = () => <RouterProvider router={router} />;

export default Router;
