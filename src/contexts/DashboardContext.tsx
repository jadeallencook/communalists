import { Dispatch, createContext, useEffect, useState } from 'react';
import RequestAidInterface from '@interfaces/request-aid';
import DonationInterface from '@interfaces/donation';
import OrganizationInterface from '@interfaces/organization';
import AccountInterface from '@interfaces/account';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '@api/init-app';
import getMyOrganizations from '@api/get-my-organizations';
import getMyAccount from '@api/get-my-account';
import { FiltersInterface } from '@interfaces/filters';
import getRequests from '@api/get-requests';

interface DashboardContextInterface {
    isLoading: boolean;
    uid: string;
    requestFilters: FiltersInterface;
    setRequestFilters: Dispatch<FiltersInterface>;
    donationFilters: FiltersInterface;
    setDonationFilters: Dispatch<FiltersInterface>;
    signIn: (email: string, password: string) => void;
    signOut: () => void;
    myOrganizations: string[];
    fetchAccount: (uid: string) => void;
    accounts: {
        [key: string]: AccountInterface;
    };
    fetchOrganization: (uid: string) => void;
    organizations: {
        [key: string]: OrganizationInterface;
    };
    fetchRequest: (uid: string) => void;
    fetchRequests: () => void;
    requests: {
        [key: string]: RequestAidInterface;
    };
    fetchDonation: (uid: string) => void;
    donations: {
        [key: string]: DonationInterface;
    };
}

const auth = getAuth(app);
const DashboardContext = createContext<DashboardContextInterface>(null);
const defaultFilters: FiltersInterface = {
    location: '',
    language: '',
    driver: '',
    stage: 'submitted',
    coordinator: '',
};

const log: (message: string) => void = (message) =>
    console.log(
        `%c[communalists] ${message}`,
        'background-color: #bc3737; color: #fff; padding: 0 5px;'
    );

export const DashboardProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [uid, setUid] = useState<string>('');
    const [myOrganizations, setMyOrganizations] = useState<string[]>([]);

    /*
    these caches store filters used in previous fetchs

    string: *|*|*|submitted|*
    description: wild cards for all filters except stage

    string: san-jose-ca|english|assigned|submitted|uid-123
    description: all filters have been set

    this allows us to check if requests have been fetched
    we don't need to fetch second example if the first one exists

*/
    const [requestsCache, setRequestsCache] = useState<Set<string>>(new Set());
    const [donationsCache, setDonationsCache] = useState<Set<string>>(
        new Set()
    );
    const getCacheStringFromFilters = (filters: FiltersInterface) => {
        const { location, language, driver, stage, coordinator } = filters;
        return `${location || '*'}|${language || '*'}|${
            driver || '*'
        }|${stage}|${coordinator || '*'}`;
    };
    const isRequestCached = (filters: FiltersInterface, cache: Set<string>) => {
        const [location, language, driver, stage, coordinator] =
            getCacheStringFromFilters(filters).split('|');
        return [location, language, driver, stage, coordinator];
    };

    const [requestFilters, setRequestFilters] =
        useState<FiltersInterface>(defaultFilters);

    const [donationFilters, setDonationFilters] =
        useState<FiltersInterface>(defaultFilters);

    const [accounts, setAccounts] = useState<{
        [key: string]: AccountInterface;
    }>({});

    const [organizations, setOrganizations] = useState<{
        [key: string]: OrganizationInterface;
    }>({});

    const [requests, setRequests] = useState<{
        [key: string]: RequestAidInterface;
    }>({});

    const [donations, setDonations] = useState<{
        [key: string]: DonationInterface;
    }>({});

    const clearCache = () => {
        setAccounts({});
        setOrganizations({});
        setRequests({});
        setDonations({});
    };

    const initalDashboardFetch: (myUID: string) => Promise<void> = async (
        myUID
    ) => {
        log('fetching user organizations');
        const myOrganizationsresponse = await getMyOrganizations();
        setMyOrganizations(myOrganizationsresponse);
        log('fetching user account');
        const myAccountResponse = await getMyAccount();
        setAccounts((previousState) => ({
            ...previousState,
            [myUID]: myAccountResponse,
        }));
    };

    useEffect(() => {
        log('initial dashboard fetch');
        onAuthStateChanged(auth, () => {
            log('user auth state changed');
            setUid(auth?.currentUser?.uid ?? '');
            if (!auth?.currentUser?.uid) {
                log('cleared cached data');
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
        fetchRequests();
    }, [requestFilters]);

    const signIn = async (email: string, password: string) => {
        log('signing user in');
    };
    const signOut = async () => {
        log('signing user out');
    };

    const fetchAccount = async (uid: string) => {
        log(`fetching account: ${uid}`);
        setIsLoading(true);
        setAccounts((prevState) => ({
            ...prevState,
        }));
        setIsLoading(false);
    };

    const fetchOrganization = async (uid: string) => {
        log(`fetching organization: ${uid}`);
        setIsLoading(true);
        setOrganizations((prevState) => ({
            ...prevState,
        }));
        setIsLoading(false);
    };

    const fetchRequest = async (uid: string) => {
        log(`fetching request: ${uid}`);
        setIsLoading(true);
        setRequests((prevState) => ({
            ...prevState,
        }));
        setIsLoading(false);
    };

    const fetchRequests = async () => {
        log(`fetching requests using filters`);
        setIsLoading(true);
        const response = await getRequests(requestFilters);
        setRequests((prevState) => ({
            ...prevState,
            ...response,
        }));
        setIsLoading(false);
    };

    const fetchDonation = async (uid: string) => {
        log(`fetching donation: ${uid}`);
        setIsLoading(true);
        setDonations((prevState) => ({
            ...prevState,
        }));
        setIsLoading(false);
    };

    return (
        <DashboardContext.Provider
            value={{
                isLoading,
                uid,
                fetchAccount,
                accounts,
                fetchOrganization,
                organizations,
                fetchRequest,
                fetchRequests,
                requests,
                fetchDonation,
                donations,
                signIn,
                signOut,
                myOrganizations,
                requestFilters,
                setRequestFilters,
                donationFilters,
                setDonationFilters,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardContext;
