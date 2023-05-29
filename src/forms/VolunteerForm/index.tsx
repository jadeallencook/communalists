import updateVolunteer from '@api/update-volunteer';
import { RoleKeyType } from '@custom-types/role';
import { getAuth } from 'firebase/auth';
import { useContext, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useMutation, useQuery } from 'react-query';
import DashboardContext from '../../contexts/DashboardContext';

const auth = getAuth();

const VolunteerForm = ({
    volunteer: initialVolunteer,
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
    const [view, setView] = useState(false);
    const { fetchAccount, accounts } = useContext(DashboardContext);

    const {
        mutate: handler,
        isLoading: loading,
        data: volunteer = initialVolunteer,
    } = useMutation({
        mutationFn: async (remove: boolean): Promise<string> => {
            await updateVolunteer(requestId, remove, type, collection);

            // If the user just volunteered (remove=false) we should confirm to the
            // user that they've volunteered for the task successfully by showing
            // them their account name on the page.
            // If they removed the current volunteer (remove=true), we should show
            // them the default value of the `View` button,
            // since the view button is now disabled, and having it say "Hide" kinda
            // doesn't make sense.
            setView(!remove);

            if (remove) {
                return '';
            } else {
                return auth.currentUser.uid;
            }
        },
        onError: (e, remove) =>
            console.error(
                `"update-volunteer(remove=${remove})" had error: ${String(e)}`
            ),
    });

    const { data: volunteerAccount } = useQuery({
        queryKey: ['get-account', volunteer] as const,
        queryFn: (ctx) => {
            const [_, volunteer] = ctx.queryKey;
            if (!volunteer) return undefined;

            const cachedAccount = accounts[volunteer];
            if (cachedAccount) {
                return cachedAccount;
            }

            return fetchAccount(volunteer);
        },
    });

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            <InputGroup>
                <Button
                    variant="secondary"
                    disabled={!volunteer || loading}
                    className="tablet-remove"
                    onClick={() => setView((prev) => !prev)}
                >
                    {view ? 'Hide' : 'View'}
                </Button>
                <Form.Control
                    disabled
                    type={view || !volunteer ? 'text' : 'password'}
                    value={
                        volunteerAccount?.name || volunteer || 'None Assigned'
                    }
                />
                <Button
                    variant="secondary"
                    disabled={!volunteer || loading}
                    onClick={() => handler(true)}
                >
                    Remove
                </Button>
                <Button
                    variant="primary"
                    disabled={!!volunteer || loading}
                    onClick={() => handler(false)}
                >
                    Volunteer
                </Button>
            </InputGroup>
        </Form.Group>
    );
};

export default VolunteerForm;
