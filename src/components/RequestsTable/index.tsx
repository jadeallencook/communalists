import { Badge, Spinner, Table } from 'react-bootstrap';
import LoadingImage from '@assets/loading.gif';
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
                    <thead>
                        <tr>
                            <th>Recieved</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Language</th>
                            <th>Driver</th>
                            <th>Stage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizeRequestsByDate(requests).map(
                            ([
                                id,
                                {
                                    name,
                                    location,
                                    language,
                                    stage,
                                    timestamp,
                                    driver,
                                },
                            ]) => (
                                <tr key={id} onClick={() => handler(id)}>
                                    <td>
                                        {getNumberOfDaysAfterDate(timestamp)}
                                    </td>
                                    <td>{name}</td>
                                    <td>{locations[location]}</td>
                                    <td>{languages[language]}</td>
                                    <td>
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
                                    <td>
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
