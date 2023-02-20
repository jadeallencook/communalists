import { Badge, Spinner, Table } from 'react-bootstrap';
import locations from '@objects/locations';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import organizeApplicationsByDate from '@utils/organize-applications-by-date';

const ApplicationsTable: StyledComponent = styled(
    ({
        isLoading,
        className,
        applications = {},
    }: {
        applications: { [key: string]: VolunteerApplicationInterface };
        isLoading: boolean;
        className: string;
    }) => (
        <div className={className}>
            {!isLoading ? (
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th className="timestamp">Recieved</th>
                            <th className="name">Name</th>
                            <th className="name tablet-remove">Email</th>
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
                                    driver,
                                    coordinator,
                                    email,
                                },
                            ]) => (
                                <tr key={id} className="table-row">
                                    <td>
                                        {getNumberOfDaysAfterDate(timestamp)}
                                    </td>
                                    <td className="name">{name}</td>
                                    <td className="name tablet-remove">
                                        {email}
                                    </td>
                                    <td className="location tablet-remove">
                                        {locations[location]}
                                    </td>
                                    <td className="language">
                                        {driver && <Badge>Driver</Badge>}
                                        {coordinator && (
                                            <Badge>Coordinator</Badge>
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
