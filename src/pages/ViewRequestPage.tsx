import getIndividualRequest from '@api/get-individual-request';
import Loading from '@components/Loading';
import ViewRequestForm from '@forms/ViewRequestForm';
import RequestAidInterface from '@interfaces/request-aid';
import timestampToDateString from '@utils/timestamp-to-date-string';
import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const ViewRequestPage = () => {
    const { uid } = useParams();
    const [request, setRequest] = useState<RequestAidInterface | undefined>(
        undefined
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        getIndividualRequest(uid).then((res) => {
            setRequest(res);
            setIsLoading(false);
        });
    }, []);

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {request ? (
                        <div
                            className="modal show modal-lg"
                            style={{ display: 'block', position: 'initial' }}
                        >
                            <Modal.Dialog>
                                <Modal.Header>
                                    <Modal.Title>
                                        Request for {request.name} made on{' '}
                                        {timestampToDateString(
                                            request.timestamp
                                        )}
                                    </Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                    <ViewRequestForm
                                        uid={uid}
                                        request={request}
                                        selected={uid}
                                    />
                                </Modal.Body>
                            </Modal.Dialog>
                        </div>
                    ) : (
                        <div
                            style={{
                                width: '100vw',
                                margin: '50px auto',
                                textAlign: 'center',
                            }}
                        >
                            <h2>404: Request not found</h2>
                        </div>
                    )}
                </>
            )}
        </>
    );
};
export default ViewRequestPage;
