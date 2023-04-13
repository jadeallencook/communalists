import updateVolunteer from '@api/update-volunteer';
import { RoleKeyType } from '@custom-types/role';
import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

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
    const [cachedVolunteer, setCachedVolunteer] = useState<boolean>(
        !!volunteer
    );

    const handler = async (remove: boolean) => {
        setLoading(true);
        const response = await updateVolunteer(
            requestId,
            remove,
            type,
            collection
        );
        if (!response && !remove) {
            setCachedVolunteer(true);
        } else if (!response && remove) {
            setCachedVolunteer(false);
        }
        setLoading(false);
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            <InputGroup>
                <Button
                    variant="secondary"
                    disabled={!cachedVolunteer || loading}
                    className="tablet-remove"
                >
                    View
                </Button>
                <Form.Control
                    disabled
                    value={cachedVolunteer ? '••••••••••••' : 'None Assigned'}
                />
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
