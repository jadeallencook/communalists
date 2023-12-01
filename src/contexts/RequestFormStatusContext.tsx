import { createContext, useEffect, useState } from 'react';
import getFormStatus from '@api/get-form-status';

interface RequestFormStatusContext {}

const RequestFormStatusContext = createContext<{
    requestFormStatus: boolean;
    hasFetchedRequestFormStatus: boolean;
}>(null);

export const RequestFormStatusProvider = ({ children }) => {
    const [hasFetchedRequestFormStatus, setHasFetchedRequestFormStatus] =
        useState<boolean>(false);
    const [requestFormStatus, setRequestFormStatus] = useState<boolean>(false);

    useEffect(() => {
        getFormStatus().then((response) => {
            setRequestFormStatus(response);
            setHasFetchedRequestFormStatus(true);
        });
    }, []);

    return (
        <RequestFormStatusContext.Provider
            value={{
                requestFormStatus,
                hasFetchedRequestFormStatus,
            }}
        >
            {children}
        </RequestFormStatusContext.Provider>
    );
};

export default RequestFormStatusContext;
