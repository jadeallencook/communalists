import { Accordion } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const FAQ: StyledComponent = styled(({ className }: { className: string }) => (
    <Accordion className={className}>
        <Accordion.Item eventKey="0">
            <Accordion.Header>What is mutual aid?</Accordion.Header>
            <Accordion.Body>
                Mutual aid is a philosophy and practice rooted in community
                support and solidarity. It involves individuals and groups
                coming together to provide assistance, resources, and care to
                one another, particularly during times of need or crisis. Mutual
                aid emphasizes collective action, where people pool their
                skills, resources, and strengths to address common challenges
                and promote well-being within their communities. It goes beyond
                traditional forms of charity by focusing on reciprocal
                relationships, shared responsibilities, and empowering
                individuals to actively participate in helping one another.
                Communalists embraces the principles of mutual aid and provides
                an online platform to facilitate and amplify these efforts,
                connecting people and organizations to collaborate and foster
                community resilience.
            </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
            <Accordion.Header>How does it work?</Accordion.Header>
            <Accordion.Body>
                Our platform simplifies mutual aid by providing a centralized
                hub for individuals and organizations. Users sign up, join or
                create organizations, and gain access to a range of
                collaborative tools. They can track tasks, fulfill requests,
                manage resources, organize events, and connect with other
                organizations for mutual support. This streamlined approach
                empowers users to efficiently coordinate efforts, respond to
                community needs, and foster meaningful collaboration.
            </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
            <Accordion.Header>Is it free to join?</Accordion.Header>
            <Accordion.Body>
                Yes, joining our platform is completely free. We believe in
                removing barriers to participation and promoting inclusivity in
                mutual aid efforts. Our goal is to support communities by
                providing accessible tools and resources for collective action.
            </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
            <Accordion.Header>How can I get involved?</Accordion.Header>
            <Accordion.Body>
                There are several ways to get involved! You can start by signing
                up on our platform and joining or creating an organization. Once
                you're part of an organization, you can contribute by tracking
                tasks, fulfilling requests, organizing events, managing
                resources, and connecting with other organizations. You can also
                engage with the community by volunteering your time, sharing
                resources, and participating in mutual aid initiatives.
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
))(style);

export default FAQ;
