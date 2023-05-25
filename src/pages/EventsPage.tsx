import EventsTable from '@components/EventsTable';
import { Container } from 'react-bootstrap';
import SnippetContext from '../contexts/SnippetContext';
import { useContext } from 'react';

const EventsPage = () => {
    const { snippet } = useContext(SnippetContext);

    return (
        <Container>
            <h1>{snippet('header', 'events-page')}</h1>
            <p>{snippet('description', 'events-page')}</p>
            <EventsTable />
            <br />
            <p>{snippet('footer', 'events-page')}</p>
        </Container>
    );
};

export default EventsPage;
