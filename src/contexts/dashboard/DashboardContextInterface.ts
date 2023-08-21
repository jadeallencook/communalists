import { AnyStageKeyType, RequestStageKeyType } from '@custom-types/stages';
import AccountInterface from '@interfaces/account';
import {
    RequestFiltersInterface,
    ActionFiltersInterface,
} from '@interfaces/filters';
import OrganizationInterface from '@interfaces/organization';
import { FrontendRequestInterface } from '@interfaces/request';
import { FrontendActionInterface } from '@interfaces/action';
import { Dispatch } from 'react';
import { FeatureType } from '@custom-types/feature';

export default interface DashboardContextInterface {
    // system
    isLoading: boolean;

    // accounts
    uid: string;
    myOrganizations: string[];
    fetchAccount: (uid: string) => void;
    updateAccount: (uid: string, account: AccountInterface) => void;
    accounts: {
        [key: string]: AccountInterface;
    };

    // organizations
    fetchOrganization: (id: string) => void;
    requestToJoinOrganization: (
        userUID: string,
        organizationUID: string
    ) => void;
    approveRequestToJoinOrganization: (
        userUID: string,
        organizationUID: string
    ) => void;
    organizations: {
        [key: string]: OrganizationInterface;
    };
    addOrganization: (organization: OrganizationInterface) => void;

    // display names
    displayNames: {
        [key: string]: string;
    };
    updateDisplayName: (name: string) => void;

    // requests
    requestFilters: RequestFiltersInterface;
    setRequestFilters: Dispatch<RequestFiltersInterface>;
    fetchRequest: (uid: string, organization: string) => void;
    fetchRequests: () => void;
    requests: {
        [key: string]: FrontendRequestInterface;
    };

    // actions
    actionFilters: ActionFiltersInterface;
    setActionFilters: Dispatch<ActionFiltersInterface>;
    actions: {
        [key: string]: FrontendActionInterface;
    };
    fetchActions: () => void;
    fetchAction: (id: string, organization: string) => void;
    addAction: (action: FrontendActionInterface) => void;

    // etc
    updateStage: (
        id: string,
        stage: AnyStageKeyType,
        organization: string,
        type: FeatureType
    ) => void;
}
