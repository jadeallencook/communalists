import { Modal } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import ViewApplicationForm from '@forms/ViewApplicationForm';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import AccountInterface from '@interfaces/account';

const ApplicationModal = styled(
    ({
        application,
        setUID,
        className,
        uid,
    }: {
        application: AccountInterface;
        setUID: any;
        className: string;
        uid: string;
    }) => {
        if (!application) {
            return null;
        }
        const { joined } = application;
        return (
            <Modal show={!!application} size="lg" className={className}>
                <Modal.Header>
                    <Modal.Title>
                        Application Submitted {getNumberOfDaysAfterDate(joined)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ViewApplicationForm
                        uid={uid}
                        application={application}
                        setUID={setUID}
                    />
                </Modal.Body>
            </Modal>
        );
    }
)(style);

export default ApplicationModal;
