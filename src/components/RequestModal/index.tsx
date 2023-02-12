import {
    Button,
    Modal,
    OverlayTrigger,
    Popover,
    Row,
    Tooltip,
} from 'react-bootstrap';
import timestampToDateString from '@utils/timestamp-to-date-string';
import RequestAidInterface from '@interfaces/request-aid';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';
import ViewRequestForm from '@forms/ViewRequestForm';
import { useEffect, useState } from 'react';

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

    const [showPopover, setShowPopover] = useState<boolean>(false)

    const handleCopyLinkToClipboard = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/#/view-request/${selected}`)
        setShowPopover(true)
    }

    useEffect(() => {
        if (showPopover) {
            const hidePopoverTimer = setTimeout(() => {
                setShowPopover(false)
            }, 1500)

            return () => clearTimeout(hidePopoverTimer)
        }
    }, [showPopover])

    return (
        <Modal show={show} onHide={handler} size="lg">
            <Modal.Header closeButton>
                <Modal.Title
                    style={{
                        color: 'var(--primary)',
                        fontWeight: '900',
                        textTransform: 'capitalize',
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginRight: '10px'
                    }}
                >
                    <div>
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
                    </div>
                    <OverlayTrigger
                        trigger="click"
                        show={showPopover}
                        onToggle={handleCopyLinkToClipboard}
                        placement='bottom'
                        overlay={<Popover><Popover.Body>Link copied!</Popover.Body></Popover>}
                    >
                        <Button >Copy Link</Button>
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
