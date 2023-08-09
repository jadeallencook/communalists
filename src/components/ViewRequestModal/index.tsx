import { Modal } from 'react-bootstrap';
import timestampToDateString from '@utils/timestamp-to-date-string';
import { FrontendRequestInterface } from '@interfaces/request';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';
import ViewRequestForm from '@forms/ViewRequestForm';
import Tooltip from '@components/Tooltip';
import { useContext, useEffect } from 'react';
import DashboardContext from '../../contexts/DashboardContext';
import Loading from '@components/Loading';

interface Props {
    show: boolean;
    handler: (id?: string, shouldRefetch?: boolean) => void;
    request: FrontendRequestInterface;
    selected: string;
}

const ViewRequestModal = ({ show, handler, request, selected }: Props) => {
    const { timestamp, organization } = request;
    const { fetchRequest, isLoading } = useContext(DashboardContext);

    useEffect(() => {
        fetchRequest(selected, organization);
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
                        uid={selected}
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

export default ViewRequestModal;
