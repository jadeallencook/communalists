import { Badge, Spinner, Table } from 'react-bootstrap';
import locations from '@objects/locations';
import languages from '@objects/languages';
import stages from '@objects/stages';
import RequestAidInterface from '@interfaces/request-aid';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import getNumberOfDaysAfterDate from '@utils/get-number-of-days-after-date';
import organizeRequestsByDate from '@utils/organize-requests-by-date';

const RequestsTable: StyledComponent = styled(
    ({
        requests,
        handler,
        loaded,
        className,
    }: {
        requests: { [key: string]: RequestAidInterface };
        handler: (id?: string) => void;
        loaded: boolean;
        className: string;
    }) => (
        <div className={className}>
            {loaded ? (
                <Table striped bordered hover variant="dark">
                    <thead className="animate__animated animate__flipInX">
                        <tr>
                            <th className="timestamp">Recieved</th>
                            <th className="name">Name</th>
                            <th className="location">Location</th>
                            <th className="language">Language</th>
                            <th className="driver">Driver</th>
                            <th className="stage">Stage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizeRequestsByDate(requests).map(
                            (
                                [
                                    id,
                                    {
                                        name,
                                        location,
                                        language,
                                        stage,
                                        timestamp,
                                        driver,
                                    },
                                ],
                                index
                            ) => (
                                <tr
                                    key={id}
                                    onClick={() => handler(id)}
                                    className="animate__animated animate__flipInX"
                                    style={{
                                        animationDelay: `${index * 0.05}s`,
                                    }}
                                >
                                    <td className="timestamp">
                                        {getNumberOfDaysAfterDate(timestamp)}
                                    </td>
                                    <td className="name">{name}</td>
                                    <td className="location">
                                        {locations[location]}
                                    </td>
                                    <td className="language">
                                        {languages[language]}
                                    </td>
                                    <td className="driver">
                                        <Badge
                                            className={
                                                driver
                                                    ? 'has-driver'
                                                    : 'has-no-driver'
                                            }
                                        >
                                            {driver
                                                ? 'Assigned'
                                                : 'Not Assigned'}
                                        </Badge>
                                    </td>
                                    <td className="stage">
                                        <Badge className={stage}>
                                            {stages[stage]}
                                        </Badge>
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

export default RequestsTable;
