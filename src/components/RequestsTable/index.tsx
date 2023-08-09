import { Table } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import Loading from '@components/Loading';
import formatRequests from '@utils/format-requests';
import { ReactNode } from 'react';

export type Column = { key: string; title: string };
export type Columns = [Column, Column, Column, Column];

interface RequestsTableInterface {
    requests: { [key: string]: any; id: string }[];
    handler: (id?: string) => void;
    loaded: boolean;
    className: string;
    columns: Columns;
    formatters?: { [key: string]: (value: any) => string | ReactNode };
    type: 'Request' | 'Action';
}

const ResultCount = ({ count, type }: { count: number; type: string }) => (
    <h3>
        {count} <span style={{ textTransform: 'capitalize' }}>{type}</span>
        {count > 1 || !count ? 's' : ''}
    </h3>
);

const RequestsTable: StyledComponent = styled(
    ({
        requests,
        handler,
        loaded = true,
        className,
        columns,
        formatters = {},
        type,
    }: RequestsTableInterface) => {
        requests = formatRequests(requests);
        return !loaded ? (
            <Loading />
        ) : (
            <div className={className}>
                <ResultCount count={requests.length} type={type} />
                <Table striped bordered hover variant="dark">
                    {requests.length ? (
                        <>
                            <thead>
                                <tr>
                                    {columns.map(({ key, title }) => (
                                        <th className={key} key={key}>
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(({ id, ...rest }, index) => (
                                    <tr key={id} onClick={() => handler(id)}>
                                        {columns.map(({ key }) => (
                                            <td
                                                className={key}
                                                key={`${key}-${index}`}
                                            >
                                                {formatters[key]
                                                    ? formatters[key](rest[key])
                                                    : `${rest[key]}`}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </>
                    ) : (
                        <tbody>
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>
                                    <b>
                                        There are currently no {type}s that
                                        match that search criteria.
                                    </b>
                                    <br />
                                    <small>
                                        Please adjust the filters above to find
                                        matching {type}s.
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
