import {
    Dispatch,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
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
import filterRequests from '@utils/filter-requests';
import { useNavigate } from 'react-router-dom';
import getIndividualRequest from '@api/get-individual-request';
import { StageKeyType } from '@custom-types/stages';
import updateRequestStage from '@api/update-request-stage';
import getOrganizations from '@api/get-organizations';
import getAccount from '@api/get-account';
import accountInitialValues from '@objects/account-initial-values';
import updateUserAccount from '@api/update-user-account';
import updateOrganizationRequests from '@api/update-organization-requests';
import toast from 'react-hot-toast';
import SnippetContext from './SnippetContext';
import getDisplayNames from '@api/get-display-names';
import updateUserDisplayName from '@api/update-user-display-name';

interface DashboardContextInterface {
    isLoading: boolean;
    uid: string;
    requestFilters: FiltersInterface;
    setRequestFilters: Dispatch<FiltersInterface>;
    donationFilters: FiltersInterface;
    setDonationFilters: Dispatch<FiltersInterface>;
    myOrganizations: string[];
    fetchAccount: (uid: string) => void;
    updateAccount: (uid: string, account: AccountInterface) => void;
    accounts: {
        [key: string]: AccountInterface;
    };
    fetchOrganization: (uid: string) => void;
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
    displayNames: {
        [key: string]: string;
    };
    fetchDisplayNames: () => void;
    updateDisplayName: (name: string) => void;
    fetchRequest: (uid: string) => void;
    updateStage: (uid: string, request: StageKeyType) => void;
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

export const log: (message: string) => void = (message) =>
    console.log(
        `%c[communalists] ${message}`,
        `
            background-color: #bc3737;
            color: #fff;
            padding: 2px 5px;
            border-radius: 3px;
            margin: 5px 0;
        `
    );

export const DashboardProvider = ({ children }) => {
    const navigate = useNavigate();
    const { snippet } = useContext(SnippetContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [uid, setUid] = useState<string>('');
    const [myOrganizations, setMyOrganizations] = useState<string[]>([]);

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

    const [displayNames, setDisplayNames] = useState<{
        [key: string]: string;
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
        const myOrganizationsResponse = await getMyOrganizations();
        setMyOrganizations(myOrganizationsResponse);
        log('fetching all organizations');
        const organizationsResponse = await getOrganizations();
        setOrganizations(organizationsResponse);
        log('fetching user account');
        const myAccountResponse = await getMyAccount();
        setAccounts((previousState) => ({
            ...previousState,
            [myUID]: myAccountResponse,
        }));
        log('fetching display names');
        const displayNamesResponse = await getDisplayNames();
        setDisplayNames(displayNamesResponse);
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
        if (
            !Object.entries(filterRequests(requests, requestFilters)).length &&
            myOrganizations.length
        ) {
            fetchRequests();
        }
    }, [requestFilters]);

    const signIn = async (email: string, password: string) => {
        log('signing user in');
        const success = await authSignIn(email, password);
        if (success) {
            toast.success(snippet('signin.success', 'log-in-form'));
            navigate('/dashboard');
        } else {
            toast.error(snippet('signin.error', 'log-in-form'));
        }
    };

    const signOut = async () => {
        log('signing user out');
        const success = await authSignOut();
        if (success) {
            navigate('/');
        }
    };

    const fetchAccount = async (id: string) => {
        log(`fetching account: ${id}`);
        setIsLoading(true);
        const account: AccountInterface = await getAccount(id);
        setAccounts((prevState) => ({
            ...prevState,
            [id]: account || accountInitialValues,
        }));
        setIsLoading(false);
    };

    const updateAccount = async (id: string, account: AccountInterface) => {
        log(`updating account: ${id}`);
        setIsLoading(true);
        await updateUserAccount(id, account);
        setAccounts((previousState) => ({
            ...previousState,
            [id]: account,
        }));
        setIsLoading(false);
    };

    const fetchOrganization = async (id: string) => {
        log(`fetching organization: ${id}`);
        setIsLoading(true);
        setOrganizations((prevState) => ({
            ...prevState,
        }));
        setIsLoading(false);
    };

    const requestToJoinOrganization = async (
        userUID: string,
        organizationUID: string
    ) => {
        log(
            `user ${userUID} requesting to join organization ${organizationUID}`
        );
        setIsLoading(true);
        const previousOrganizationState = organizations[organizationUID];
        const request = await updateOrganizationRequests(
            userUID,
            organizationUID,
            'requests'
        );
        if (request) {
            setOrganizations((previousState) => ({
                ...previousState,
                [organizationUID]: {
                    ...previousOrganizationState,
                    requests: previousOrganizationState?.requests
                        ? [...previousOrganizationState.requests, userUID]
                        : [userUID],
                },
            }));
        }
        setIsLoading(false);
    };

    const approveRequestToJoinOrganization = async (
        userUID: string,
        organizationUID: string
    ) => {
        log(
            `approving user ${userUID} to join organization ${organizationUID}`
        );
        setIsLoading(true);
        const previousOrganizationState = organizations[organizationUID];
        const request = await updateOrganizationRequests(
            userUID,
            organizationUID,
            'members'
        );
        if (request) {
            setOrganizations((previousState) => ({
                ...previousState,
                [organizationUID]: {
                    ...previousOrganizationState,
                    requests: previousOrganizationState?.requests.filter(
                        (item) => item !== userUID
                    ),
                    members: [...previousOrganizationState.members, userUID],
                },
            }));
        }
        setIsLoading(false);
    };

    const fetchRequest = async (id: string) => {
        log(`fetching request: ${id}`);
        setIsLoading(true);
        const request = await getIndividualRequest(id);
        if (request) {
            setRequests((prevState) => ({
                ...prevState,
                [id]: request,
            }));
        }
        setIsLoading(false);
    };

    const updateStage = async (
        id: string,
        stage: StageKeyType,
        isDonation?: boolean
    ) => {
        log(`updating ${isDonation ? 'donation' : 'request'} stage: ${id}`);
        setIsLoading(true);
        if (isDonation) {
            // TODO: add logic for donation stage
        } else {
            await updateRequestStage(id, stage);
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
        log(`fetching requests using filters`);
        setIsLoading(true);
        const response = await getRequests(requestFilters);
        setRequests((prevState) => ({
            ...prevState,
            ...response,
        }));
        setIsLoading(false);
    };

    const fetchDonation = async (id: string) => {
        log(`fetching donation: ${id}`);
        setIsLoading(true);
        setDonations((prevState) => ({
            ...prevState,
        }));
        setIsLoading(false);
    };

    const fetchDisplayNames = async () => {
        log('fetching display names');
        setIsLoading(true);
        //
        setIsLoading(false);
    };

    const updateDisplayName = async (name: string) => {
        log(`updating user's display name`);
        setIsLoading(true);
        await updateUserDisplayName(name);
        setDisplayNames((previousState) => ({
            ...previousState,
            [uid]: name,
        }));
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
                fetchDonation,
                donations,
                myOrganizations,
                requestToJoinOrganization,
                approveRequestToJoinOrganization,
                requestFilters,
                setRequestFilters,
                donationFilters,
                setDonationFilters,
                displayNames,
                fetchDisplayNames,
                updateDisplayName,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardContext;
