import React from 'react';
import AccessLevel from './access-level';

/*
 * This file contains the routes that will be used in the application.
 * The routes are used to generate the navbar and to determine which
 * components should be rendered.
 *
 * The routes are stored in a Record<string, Route> object, where the
 * key is the name of the route and the value is the Route object.
 *
 * Each Route object contains the following properties:
 * - name: this is the name that will be displayed in the sidebar
 * - description: this is the text that will be displayed below the name
 * - access: this is the access level that the user needs to have to access the route
 */

export interface Route {
    name: string;
    description: string;
    access: AccessLevel;
}

const ROUTES: Record<string, Route> = {
    HOME: {
        name: 'Home',
        description: '',
        access: AccessLevel.Guest,
    },
    FORMS: {
        name: 'Forms',
        description: '',
        access: AccessLevel.Member,
    },
};

export default ROUTES;
