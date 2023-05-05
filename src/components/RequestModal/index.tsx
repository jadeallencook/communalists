import { Modal } from 'react-bootstrap';
import timestampToDateString from '@utils/timestamp-to-date-string';
import RequestAidInterface from '@interfaces/request-aid';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';
import ViewRequestForm from '@forms/ViewRequestForm';
import Tooltip from '@components/Tooltip';
import { useContext, useEffect } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';

const RequestModal = ({
    show,
    handler,
    request,
    selected,
}: {
    show: boolean;
    handler: (id?: string, shouldRefetch?: boolean) => void;
    request: RequestAidInterface;
    selected: string;
}) => {
    const { timestamp } = request;
    const { fetchRequest, isLoading } = useContext(DashboardContext);

    useEffect(() => {
        fetchRequest(selected);
    }, []);

    return (
        <Modal show={show} onHide={handler} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className="mobile-remove">Request</span> Recieved{' '}
                    <b>{getNumberOfDaysAfterDate(timestamp)}</b>{' '}
                    <Tooltip position="right" iconSrc={CalendarSVG}>
                        <div>{timestampToDateString(timestamp)}</div>
                    </Tooltip>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <Loading />
                ) : (
                    <ViewRequestForm
                        request={request}
                        handler={handler}
                        selected={selected}
                        isModal={true}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};

export default RequestModal;
