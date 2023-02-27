import { Badge, Spinner, Table } from 'react-bootstrap';
import locations from '@objects/locations';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import organizeApplicationsByDate from '@utils/organize-applications-by-date';
import roles from '@objects/roles';
import organizations from '@objects/organizations';

const ApplicationsTable: StyledComponent = styled(
    ({
        isLoading,
        className,
        applications = {},
        handler,
    }: {
        applications: { [key: string]: VolunteerApplicationInterface };
        isLoading: boolean;
        className: string;
        handler: (id: string) => void;
    }) => (
        <div className={className}>
            {!isLoading ? (
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th className="timestamp">Recieved</th>
                            <th className="name">Name</th>
                            <th className="name tablet-remove">Organization</th>
                            <th className="location tablet-remove">Location</th>
                            <th className="roles">Roles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizeApplicationsByDate(applications).map(
                            ([
                                id,
                                {
                                    name,
                                    location,
                                    timestamp,
                                    organization,
                                    role,
                                },
                            ]) => (
                                <tr
                                    key={id}
                                    className="table-row"
                                    onClick={() => handler(id)}
                                >
                                    <td>
                                        {getNumberOfDaysAfterDate(timestamp)}
                                    </td>
                                    <td className="name">{name}</td>
                                    <td className="name tablet-remove">
                                        {organizations[organization]}
                                    </td>
                                    <td className="location tablet-remove">
                                        {locations[location]}
                                    </td>
                                    <td className="language">
                                        {Object.entries(role).map(
                                            ([key, value]) =>
                                                value && (
                                                    <Badge key={`${id}-${key}`}>
                                                        {roles[key]}
                                                    </Badge>
                                                )
                                        )}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </Table>
            ) : (
                <Spinner animation="border" />
            )}
        </div>
    )
)(style);

export default ApplicationsTable;
