import AccountInterface from '@interfaces/account';
import {
    RequestFiltersInterface,
    SharedFiltersInterface,
    ActionFiltersInterface,
} from '@interfaces/filters';
import OrganizationInterface from '@interfaces/organization';
import { FrontendRequestInterface } from '@interfaces/request';
import { FrontendActionInterface } from '@interfaces/action';
import { useState } from 'react';

const sharedDefaultFilters: SharedFiltersInterface = {
    coordinator: '',
    organization: '',
};

const defaultRequestFilters: RequestFiltersInterface = {
    ...sharedDefaultFilters,
    location: '',
    language: '',
    driver: '',
    stage: 'submitted',
};

const defaultActionFilters: ActionFiltersInterface = {
    ...sharedDefaultFilters,
    stage: 'submitted',
};

const useDashboard = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [uid, setUid] = useState<string>('');
    const [myOrganizations, setMyOrganizations] = useState<string[]>([]);

    const [requestFilters, setRequestFilters] =
        useState<RequestFiltersInterface>(defaultRequestFilters);

    const [actionFilters, setActionFilters] =
        useState<ActionFiltersInterface>(defaultActionFilters);

    const [accounts, setAccounts] = useState<{
        [key: string]: AccountInterface;
    }>({});

    const [organizations, setOrganizations] = useState<{
        [key: string]: OrganizationInterface;
    }>({});

    const [requests, setRequests] = useState<{
        [key: string]: FrontendRequestInterface;
    }>({});

    const [actions, setActions] = useState<{
        [key: string]: FrontendActionInterface;
    }>({});

    const [displayNames, setDisplayNames] = useState<{
        [key: string]: string;
    }>({});

    const clearCache = () => {
        setAccounts({});
        setOrganizations({});
        setRequests({});
    };

    return {
        isLoading,
        setIsLoading,
        uid,
        setUid,
        requestFilters,
        setRequestFilters,
        myOrganizations,
        setMyOrganizations,
        accounts,
        setAccounts,
        organizations,
        setOrganizations,
        requests,
        setRequests,
        displayNames,
        setDisplayNames,
        clearCache,
        actionFilters,
        setActionFilters,
        actions,
        setActions,
    };
};

export default useDashboard;
