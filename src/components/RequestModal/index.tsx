import {
    Modal,
} from 'react-bootstrap';
import timestampToDateString from '@utils/timestamp-to-date-string';
import RequestAidInterface from '@interfaces/request-aid';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';
import ViewRequestForm from '@forms/ViewRequestForm';
import Tooltip from '@components/Tooltip';

const RequestModal = ({
    show,
    handler,
    request,
    selected,
}: {
    show: boolean;
    handler: (id?: string) => void;
    request: RequestAidInterface;
    selected: string;
}) => {
    const {
        timestamp,
    } = request;

    return (
        <Modal show={show} onHide={handler} size="lg">
            <Modal.Header closeButton>
                <Modal.Title
                    style={{
                        color: 'var(--primary)',
                        fontWeight: '900',
                        textTransform: 'capitalize',
                    }}
                >
                    <span className="mobile-remove">Request</span> Recieved{' '}
                    <b>{getNumberOfDaysAfterDate(timestamp)}</b>{' '}
                    <Tooltip
                        position="right"
                        iconSrc={CalendarSVG}
                        // element={<img src={CalendarSVG} style={{ cursor: 'pointer' }} />}
                    >
                        <div>{timestampToDateString(timestamp)}</div>
                    </Tooltip>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ViewRequestForm
                    request={request}
                    handler={handler}
                    selected={selected}
                    isModal={true} />
            </Modal.Body>
        </Modal>
    );
};

export default RequestModal;
