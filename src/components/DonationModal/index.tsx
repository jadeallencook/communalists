import { Modal } from 'react-bootstrap';
import timestampToDateString from '@utils/timestamp-to-date-string';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import CalendarSVG from '@assets/calendar.svg';
import Tooltip from '@components/Tooltip';
import DonationInterface from '@interfaces/donation';
import ViewDonationForm from '@forms/ViewDonationForm';

const DonationModal = ({
    show,
    handler,
    donation,
    selected,
}: {
    show: boolean;
    handler: (id?: string, shouldRefetch?: boolean) => void;
    donation: DonationInterface;
    selected: string;
}) => {
    const { timestamp } = donation;

    return (
        <Modal show={show} onHide={handler} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className="mobile-remove">Donation</span> Recieved{' '}
                    <b>{getNumberOfDaysAfterDate(timestamp)}</b>{' '}
                    <Tooltip position="right" iconSrc={CalendarSVG}>
                        <div>{timestampToDateString(timestamp)}</div>
                    </Tooltip>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ViewDonationForm
                    donation={donation}
                    handler={handler}
                    selected={selected}
                    isModal={true}
                />
            </Modal.Body>
        </Modal>
    );
};

export default DonationModal;
