import { Badge, InputGroup, Spinner } from 'react-bootstrap';
import updateFormStatus from '@api/update-form-status';
import getFormStatus from '@api/get-form-status';
import { useQuery } from 'react-query';

const FormStatusForm = () => {
    const { data: status, refetch } = useQuery({
        queryKey: ['getFormStatus'],
        queryFn: () => getFormStatus(),
    });

    const handleToggle = async () => {
        await updateFormStatus(!status);
        await refetch();
    };

    return (
        <>
            {status !== undefined && (
                <InputGroup.Checkbox
                    checked={status}
                    aria-label=""
                    onChange={handleToggle}
                    style={{ cursor: 'pointer' }}
                />
            )}
            <InputGroup.Text>
                {status === undefined ? (
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
