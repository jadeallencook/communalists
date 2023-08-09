import { createContext, useEffect, useState } from 'react';
import AccountInterface from '@interfaces/account';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import filterDocuments from '@utils/filter-documents';
import { AnyStageKeyType, RequestStageKeyType } from '@custom-types/stages';
import API from '@api/index';
import { INITIAL_ACCOUNT_VALUES } from '@objects/initial-account-values';
import app from '@api/init-app';
import DashboardContextInterface from './dashboard/DashboardContextInterface';
import { log } from '@helpers/log';
import useDashboard from './dashboard/useDashboard';
import OrganizationInterface from '@interfaces/organization';
import { FrontendActionInterface } from '@interfaces/action';
import { FeatureType } from '@custom-types/feature';
import { set } from 'firebase/database';

const auth = getAuth(app);
const DashboardContext = createContext<DashboardContextInterface>(null);

export const DashboardProvider = ({ children }) => {
    const {
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
    } = useDashboard();

    const [reads, setReads] = useState(0);
    const [writes, setWrites] = useState(0);
    const [initalLoad, setInitalLoad] = useState(false);

    const initalDashboardFetch: (myUID: string) => Promise<void> = async (
        myUID
    ) => {
        const myOrganizationsResponse = await API.getMyOrganizations();
        setMyOrganizations(Object.keys(myOrganizationsResponse));
        setOrganizations(myOrganizationsResponse);
        const myAccountResponse = await API.getMyAccount();
        setAccounts((previousState) => ({
            ...previousState,
            [myUID]: myAccountResponse,
        }));
        const displayNamesResponse = await API.getDisplayNames();
        setDisplayNames(displayNamesResponse);
        setReads(
            (previousState) =>
                previousState + 2 + Object.keys(myOrganizationsResponse).length
        );
        setInitalLoad(true);
    };

    useEffect(() => log(`${reads} reads / ${writes} writes`), [reads, writes]);

    // refetch actions when actionFilters change
    useEffect(() => {
        if (initalLoad) {
            const { length } = Object.keys(
                filterDocuments(actions, actionFilters)
            );
            if (!length) {
                fetchActions();
            }
        }
    }, [actionFilters]);

    useEffect(() => {
        onAuthStateChanged(auth, () => {
            setUid(auth?.currentUser?.uid ?? '');
            if (!auth?.currentUser?.uid) {
                clearCache();
                setIsLoading(false);
            } else {
                initalDashboardFetch(auth?.currentUser?.uid).then(() => {
                    setIsLoading(false);
                });
            }
        });
    }, []);

    useEffect(() => {
        if (
            !Object.entries(filterDocuments(requests, requestFilters)).length &&
            myOrganizations.length
        ) {
            fetchRequests();
        }
    }, [requestFilters]);

    const fetchAccount = async (id: string) => {
        setIsLoading(true);
        const account: AccountInterface = await API.getAccount(id);
        setAccounts((prevState) => ({
            ...prevState,
            [id]: account || INITIAL_ACCOUNT_VALUES,
        }));
        setReads((previousState) => previousState + 1);
        setIsLoading(false);
    };

    const updateAccount = async (id: string, account: AccountInterface) => {
        setIsLoading(true);
        await API.updateUserAccount(id, account);
        setAccounts((previousState) => ({
            ...previousState,
            [id]: account,
        }));
        setIsLoading(false);
    };

    const fetchOrganization = async (id: string) => {
        setIsLoading(true);
        setOrganizations((prevState) => ({
            ...prevState,
        }));
        setReads((previousState) => previousState + 1);
        setIsLoading(false);
    };

    const addOrganization = async (value: OrganizationInterface) => {
        setIsLoading(true);
        const id = await API.addOrganization(value);
        setOrganizations((prevState) => ({
            ...prevState,
            [id]: value,
        }));
        setMyOrganizations((prevState) => [...prevState, id]);
        setIsLoading(false);
    };

    const requestToJoinOrganization = async (
        userUID: string,
        organizationUID: string
    ) => {
        setIsLoading(true);
        setIsLoading(false);
    };

    const approveRequestToJoinOrganization = async (
        userUID: string,
        organizationUID: string
    ) => {
        setIsLoading(true);
        setIsLoading(false);
    };

    const fetchRequest = async (id: string, organization: string) => {
        setIsLoading(true);
        const request = await API.getIndividualRequest(id, organization);
        if (request) {
            setRequests((prevState) => ({
                ...prevState,
                [id]: request,
            }));
        }
        setReads((previousState) => previousState + 1);
        setIsLoading(false);
    };

    const updateStage = async (
        id: string,
        stage: AnyStageKeyType,
        organization: string,
        type: FeatureType
    ) => {
        setIsLoading(true);
        await API.updateStage(id, stage, organization, type);
        if (type === 'action') {
            setActions((previousState) => ({
                ...previousState,
                [id]: {
                    ...previousState[id],
                    stage,
                },
            }));
        } else if (type === 'request') {
            setRequests((previousState) => ({
                ...previousState,
                [id]: {
                    ...previousState[id],
                    stage,
                },
            }));
        }
        setIsLoading(false);
    };

    const fetchRequests = async () => {
        setIsLoading(true);
        const response = await API.getRequests(requestFilters, myOrganizations);
        setRequests((prevState) => ({
            ...prevState,
            ...response,
        }));
        setReads(
            (previousState) =>
                previousState + (Object.keys(response).length || 1)
        );
        setIsLoading(false);
    };

    const updateDisplayName = async (name: string) => {
        setIsLoading(true);
        await API.updateUserDisplayName(name);
        setDisplayNames((previousState) => ({
            ...previousState,
            [uid]: name,
        }));
        setIsLoading(false);
    };

    const fetchAction = async (id: string, organization: string) => {
        setIsLoading(true);
        const action = await API.getIndividualAction(id, organization);
        if (action) {
            setActions((prevState) => ({
                ...prevState,
                [id]: action,
            }));
        }
        setReads((previousState) => previousState + 1);
        setIsLoading(false);
    };

    const fetchActions = async () => {
        setIsLoading(true);
        const response = await API.getActions(actionFilters, myOrganizations);
        setActions((prevState) => ({
            ...prevState,
            ...response,
        }));
        setReads(
            (previousState) =>
                previousState + (Object.keys(response).length || 1)
        );
        setIsLoading(false);
    };

    const addAction = async (value: FrontendActionInterface) => {
        setIsLoading(true);
        const id = await API.addAction(value);
        setActions((prevState) => ({
            ...prevState,
            [id]: value,
        }));
        setWrites((previousState) => previousState + 1);
        setIsLoading(false);
    };

    return (
        <DashboardContext.Provider
            value={{
                isLoading,
                uid,
                fetchAccount,
                updateAccount,
                accounts,
                fetchOrganization,
                organizations,
                fetchRequest,
                updateStage,
                fetchRequests,
                requests,
                myOrganizations,
                requestToJoinOrganization,
                approveRequestToJoinOrganization,
                requestFilters,
                setRequestFilters,
                displayNames,
                updateDisplayName,
                actionFilters,
                setActionFilters,
                actions,
                fetchAction,
                fetchActions,
                addAction,
                addOrganization,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardContext;
