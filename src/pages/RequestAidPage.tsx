import getFormStatus from '@api/get-form-status';
import Loading from '@components/Loading';
import RequestAidForm from '@forms/RequestAidForm/index';
import { useContext } from 'react';
import { Container } from 'react-bootstrap';
import RequestFormStatusContext from '../contexts/RequestFormStatusContext';

const RequestAidPage = () => (
    <Container>
        {/* <RequestAidForm /> */}
        <h1>Request Aid Form</h1>
        <p>
            Due to an overwhelming response and limited volunteer capacity, we
            have temporarily taken down the request aid form. We want to ensure
            that each request receives the attention and support it deserves,
            and for that, we need more helping hands. We invite compassionate
            individuals who share our mission to step forward and become a part
            of our volunteer team. By dedicating your time and skills, you can
            make a tangible impact on the lives of those in need. Whether you
            only have a couple hours to spare each month or more, your
            contribution can make a significant difference in our collective
            effort to support the community.
            <br />
            <br />
            <a href="mailto:support@communalists.org?subject=Mutual Aid Volunteer Request">
                support@communalists.org
            </a>
        </p>
    </Container>
);

export default RequestAidPage;
