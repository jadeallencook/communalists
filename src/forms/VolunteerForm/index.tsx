import updateVolunteer from '@api/update-volunteer';
import { RoleKeyType } from '@custom-types/role';
import { useContext, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import DashboardContext from '../../contexts/DashboardContext';

const VolunteerForm = ({
    volunteer,
    requestId,
    label,
    type,
    collection,
}: {
    volunteer: string;
    requestId: string;
    label: string;
    type: RoleKeyType;
    collection: 'requests' | 'donations';
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [cachedVolunteer, setCachedVolunteer] = useState<string | null>(
        !!volunteer ? volunteer : null
    );
    const { displayNames, uid } = useContext(DashboardContext);
    const displayName = cachedVolunteer
        ? displayNames[cachedVolunteer]
            ? displayNames[cachedVolunteer]
            : 'Anonymous'
        : 'None Assigned';

    const handler = async (remove: boolean) => {
        setLoading(true);
        const response = await updateVolunteer(
            requestId,
            remove,
            type,
            collection
        );
        setCachedVolunteer(!response && !remove ? uid : null);
        setLoading(false);
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            <InputGroup>
                <Form.Control disabled value={displayName} />
                <Button
                    variant="secondary"
                    disabled={!cachedVolunteer || loading}
                    onClick={() => handler(true)}
                >
                    Remove
                </Button>
                <Button
                    variant="primary"
                    disabled={!!cachedVolunteer || loading}
                    onClick={() => handler(false)}
                >
                    Volunteer
                </Button>
            </InputGroup>
        </Form.Group>
    );
};

export default VolunteerForm;
