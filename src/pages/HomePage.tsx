import Header from '@components/Shared/Header';
import { Button, Container } from 'react-bootstrap';
import NetworkPNG from '@assets/network.png';
import FAQ from '@components/Home/FAQ';
import EventsTable from '@components/EventsTable';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <>
            <Header>
                <h1>Welcome To Communalists</h1>
                <p>
                    We give communties the tools they need to empower themselves
                    through mutual aid.
                </p>
                <Link to="/request-aid">
                    <Button variant="primary">Make A Request</Button>
                </Link>
                <Link to="/sign-up">
                    <Button variant="secondary">Become A Volunteer</Button>
                </Link>
            </Header>
            <Container>
                <h4>Building Stronger Communities</h4>
                <p>
                    We are a platform dedicated to fostering mutual aid,
                    collaboration, and community empowerment. Our mission is to
                    provide online tools that enable individuals and
                    organizations to connect, support one another, and make a
                    meaningful impact in their communities. We aim to facilitate
                    the coordination of tasks, fulfillment of requests,
                    organization of events, and management of resources. Whether
                    you are a community organization, a volunteer, or someone in
                    need, we are here to help you connect, collaborate, and make
                    a difference.
                </p>
                <h4>From Surplus to Support</h4>
                <p>
                    There are various situations where valuable items are
                    available for redistribution. For instance, restaurants may
                    be liquidating perishable food items, or community members
                    may have furniture or other goods they no longer need. By
                    leveraging the features of our platform, our volunteers
                    ensure that these valuable items find their way to those who
                    can truly benefit, reducing waste and addressing immediate
                    needs. Join our growing network of individuals and
                    organizations dedicated to creating stronger, more resilient
                    communities where everyone's needs are met.
                </p>
                <h4>Frequently Asked Questions</h4>
                <FAQ />
                <h4>Events Today In San Jose</h4>
                <EventsTable hasFilters={false} />
            </Container>
        </>
    );
};

export default HomePage;
