import Comments from '@forms/ViewRequestForm/Comments';
import { FrontendActionInterface } from '@interfaces/action';
import { Card, Modal } from 'react-bootstrap';

interface Props {
    action: FrontendActionInterface;
    actionId: string;
    show: boolean;
    toggle: () => void;
}

const ViewActionModal = ({ action, actionId, show, toggle }: Props) => {
    return (
        <Modal show={show} onHide={toggle} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{action?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card>
                    <Card.Body>{action?.body}</Card.Body>
                </Card>
                <br />
                <Comments
                    id={actionId}
                    organization={action?.organization}
                    type="action"
                />
            </Modal.Body>
        </Modal>
    );
};

export default ViewActionModal;
