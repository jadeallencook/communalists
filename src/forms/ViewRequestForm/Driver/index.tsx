import updateDriver from '@api/update-driver';
import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

const Driver = ({ driver, id }: { driver: string; id: string }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [cachedDriver, setCachedDriver] = useState<boolean>(!!driver);

    const handler = async (remove: boolean) => {
        setLoading(true);
        const response = await updateDriver(id, remove);
        if (!response && !remove) {
            setCachedDriver(true);
        } else if (!response && remove) {
            setCachedDriver(false);
        }
        setLoading(false);
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>Assigned Driver (If Applicable)</Form.Label>
            <InputGroup>
                <Button
                    variant="secondary"
                    disabled={!cachedDriver || loading}
                    className="tablet-remove"
                >
                    View Driver
                </Button>
                <Form.Control
                    disabled
                    className="tablet-remove"
                    value={
                        cachedDriver
                            ? '••••••••••••••••••'
                            : 'No Driver Assigned'
                    }
                />
                <Form.Control
                    disabled
                    className="tablet-show"
                    value={cachedDriver ? '••••••••' : 'No Driver'}
                />
                <Button
                    variant="secondary"
                    disabled={!cachedDriver || loading}
                    onClick={() => handler(true)}
                >
                    Remove <span className="mobile-remove">Driver</span>
                </Button>
                <Button
                    variant="primary"
                    disabled={!!cachedDriver || loading}
                    onClick={() => handler(false)}
                >
                    Volunteer <span className="mobile-remove">To Drive</span>
                </Button>
            </InputGroup>
        </Form.Group>
    );
};

export default Driver;
