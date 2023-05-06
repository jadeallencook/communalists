import { DashboardRouteLinkType } from '@custom-types/dashboard-route-link';
import { ReactElement } from 'react';

export interface DashboardRouteInterface {
    text: string;
    component: ReactElement;
    isRestricted: boolean;
}

export type DashboardRoutesInterface = {
    [key in DashboardRouteLinkType]: DashboardRouteInterface;
};
