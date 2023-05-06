import EventsTable from '@components/EventsTable';
import { Container } from 'react-bootstrap';

const EventsPage = () => {
    return (
        <Container>
            <h1>Weekly Community Events</h1>
            <p>
                Check out our list of weekly community events where you can find
                free food, showers, essential goods, medical care, and more. Our
                events page is regularly updated with new opportunities to
                support and be a part of the efforts in your area.
            </p>
            <EventsTable />
            <br />
            <p>
                Stay informed and get involved with your community through our
                events page.
            </p>
        </Container>
    );
};

export default EventsPage;
