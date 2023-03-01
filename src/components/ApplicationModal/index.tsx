import { Modal } from 'react-bootstrap';
import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import ViewApplicationForm from '@forms/ViewApplicationForm';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';

const ApplicationModal = styled(
    ({
        application,
        setApplication,
        className,
    }: {
        application: VolunteerApplicationInterface;
        setApplication: any;
        className: string;
    }) => {
        if (!application) {
            return null;
        }
        const { timestamp } = application;
        return (
            <Modal show={true} size="lg" className={className}>
                <Modal.Header>
                    <Modal.Title>
                        Application Submitted{' '}
                        {getNumberOfDaysAfterDate(timestamp)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ViewApplicationForm
                        application={application}
                        setApplication={setApplication}
                    />
                </Modal.Body>
            </Modal>
        );
    }
)(style);

export default ApplicationModal;
