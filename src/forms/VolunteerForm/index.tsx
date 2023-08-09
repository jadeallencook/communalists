import updateVolunteer from '@api/update-volunteer';
import { RoleKeyType } from '@custom-types/role';
import { useContext, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import DashboardContext from '../../contexts/DashboardContext';
import { FeatureType } from '@custom-types/feature';

const VolunteerForm = ({
    volunteer,
    id,
    label,
    type,
    role,
    organization,
}: {
    volunteer: string;
    id: string;
    label: string;
    type: FeatureType;
    role: RoleKeyType;
    organization: string;
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
            id,
            remove,
            role,
            type,
            organization
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
