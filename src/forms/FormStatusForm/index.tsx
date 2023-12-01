import { useContext, useEffect, useState } from 'react';
import { Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import updateFormStatus from '@api/update-form-status';
import RequestFormStatusContext from '../../contexts/RequestFormStatusContext';

const FormStatusForm = () => {
    const [status, setStatus] = useState<boolean>(false);

    const { requestFormStatus, hasFetchedRequestFormStatus } = useContext(
        RequestFormStatusContext
    );

    useEffect(() => {
        setStatus(requestFormStatus);
    }, [requestFormStatus]);

    const handleToggle = () => {
        updateFormStatus(!status);
        setStatus((prev) => !prev);
    };

    return (
        <>
            {hasFetchedRequestFormStatus && (
                <InputGroup.Checkbox
                    checked={status}
                    aria-label=""
                    onChange={handleToggle}
                    style={{ cursor: 'pointer' }}
                />
            )}
            <InputGroup.Text>
                {!hasFetchedRequestFormStatus ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            style={{ marginRight: '15px' }}
                        />
                        Getting Request Form Status
                    </>
                ) : (
                    <>
                        {' '}
                        Request Form Status{' '}
                        {status ? (
                            <Badge
                                bg="danger"
                                style={{ marginLeft: '5px', width: '50px' }}
                            >
                                Live
                            </Badge>
                        ) : (
                            <Badge
                                bg="dark"
                                style={{ marginLeft: '5px', width: '50px' }}
                            >
                                Offline
                            </Badge>
                        )}
                    </>
                )}
            </InputGroup.Text>
        </>
    );
};

export default FormStatusForm;
