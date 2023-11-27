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
        <Form>
            <InputGroup size="sm">
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
                    ) : status ? (
                        <>
                            Request Form Is
                            <Badge bg="danger" style={{ marginLeft: '5px' }}>
                                Live
                            </Badge>
                        </>
                    ) : (
                        <>
                            Request Form Is
                            <Badge bg="dark" style={{ marginLeft: '5px' }}>
                                Offline
                            </Badge>
                        </>
                    )}
                </InputGroup.Text>
            </InputGroup>
        </Form>
    );
};

export default FormStatusForm;
