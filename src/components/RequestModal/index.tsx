import {
    Modal,
    OverlayTrigger,
    Tooltip,
} from 'react-bootstrap';
import timestampToDateString from '@utils/timestamp-to-date-string';
import RequestAidInterface from '@interfaces/request-aid';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';
import ViewRequestForm from '@forms/ViewRequestForm';

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
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="tooltip-right">
                                {timestampToDateString(timestamp)}
                            </Tooltip>
                        }
                    >
                        <img src={CalendarSVG} style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
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
