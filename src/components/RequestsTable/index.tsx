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
    }) => {
        const organized = organizeRequestsByDate(requests);

        if (!loaded) {
            return (
                <div className={className}>
                    <Spinner animation="border" />
                </div>
            );
        }

        return (
            <div className={className}>
                <Table striped bordered hover variant="dark">
                    {organized.length ? (
                        organized.map(
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
                                <>
                                    <thead>
                                        <tr>
                                            <th className="timestamp">
                                                Recieved
                                            </th>
                                            <th className="name">Name</th>
                                            <th className="location">
                                                Location
                                            </th>
                                            <th className="language">
                                                Language
                                            </th>
                                            <th className="driver">Driver</th>
                                            <th className="stage">Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            key={id}
                                            onClick={() => handler(id)}
                                            style={{
                                                animationDelay: `${
                                                    index * 0.05
                                                }s`,
                                            }}
                                        >
                                            <td className="timestamp">
                                                {getNumberOfDaysAfterDate(
                                                    timestamp
                                                )}
                                            </td>
                                            <td className="name">{name}</td>
                                            <td className="location">
                                                {locations[location] ||
                                                    'Location Unknown'}
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
                                    </tbody>
                                </>
                            )
                        )
                    ) : (
                        <tbody>
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>
                                    <b>
                                        There are currently no requests that
                                        match that search criteria.
                                    </b>
                                    <br />
                                    <small>
                                        Please adjust the filters above to find
                                        matching requests.
                                    </small>
                                </td>
                            </tr>
                        </tbody>
                    )}
                </Table>
            </div>
        );
    }
)(style);

export default RequestsTable;
