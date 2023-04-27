import { Badge, Table } from 'react-bootstrap';
import locations from '@objects/locations';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import organizeApplicationsByDate from '@utils/organize-applications-by-date';
import roles from '@objects/roles';
import AccountInterface from '@interfaces/account';
import { Dispatch } from 'react';
import Loading from '@components/Loading';

const ApplicationsTable: StyledComponent = styled(
    ({
        isLoading,
        className,
        applications = {},
        setUID,
    }: {
        applications: { [key: string]: AccountInterface };
        isLoading: boolean;
        className: string;
        setUID: Dispatch<string>;
    }) => {
        const organizedApplications = organizeApplicationsByDate(applications);
        return (
            <div className={className}>
                {!isLoading ? (
                    <Table striped bordered hover variant="dark">
                        {!organizedApplications.length ? (
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <b>
                                            There are currently no volunteer
                                            applications to review.
                                        </b>
                                        <br />
                                        <small>
                                            Check back later or consider sharing
                                            our website with others who may be
                                            interested in volunteering.
                                        </small>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <>
                                <thead>
                                    <tr>
                                        <th className="timestamp">Recieved</th>
                                        <th className="name">Name</th>
                                        <th className="location tablet-remove">
                                            Location
                                        </th>
                                        <th className="roles">Roles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizedApplications.map(
                                        ([
                                            id,
                                            { name, location, joined, role },
                                        ]) => (
                                            <tr
                                                key={id}
                                                className="table-row"
                                                onClick={() => setUID(id)}
                                            >
                                                <td>
                                                    {getNumberOfDaysAfterDate(
                                                        joined
                                                    )}
                                                </td>
                                                <td className="name">{name}</td>
                                                <td className="location tablet-remove">
                                                    {locations[location]}
                                                </td>
                                                <td className="language">
                                                    {Object.entries(role).map(
                                                        ([key, value]) =>
                                                            value && (
                                                                <Badge
                                                                    key={`${id}-${key}`}
                                                                >
                                                                    {roles[key]}
                                                                </Badge>
                                                            )
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </>
                        )}
                    </Table>
                ) : (
                    <Loading />
                )}
            </div>
        );
    }
)(style);

export default ApplicationsTable;
