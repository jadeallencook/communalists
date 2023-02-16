import getRequests from '@api/get-requests';
import RequestAidInterface from '@interfaces/request-aid';
import { useEffect, useState } from 'react';
import { Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import RequestsTable from '@components/RequestsTable';
import RequestModal from '@components/RequestModal';
import InfoSVG from '@assets/info.svg';

const DashboardPage = () => {
    const [requests, setRequests] = useState<{
        [key: string]: RequestAidInterface;
    }>({});

    const [loaded, setLoaded] = useState<boolean>(false);
    const [refetch, setRefetch] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();
    const handler = (id?: string): void => {
        setSelected(id);
        setShow((prev) => !prev);
        setRefetch(true);
    };

    useEffect(() => {
        getRequests().then((requests) => {
            setRequests(requests);
            setLoaded(true);
        });
        setRefetch(false);
    }, [refetch]);

    return (
        <Container>
            <h1 className="animate__animated animate__fadeIn">
                <span className="mobile-remove">Help Meet</span> Community Needs{' '}
                <OverlayTrigger
                    placement="bottom"
                    overlay={
                        <Tooltip id="tooltip-bottom">
                            <div
                                style={{
                                    textAlign: 'left',
                                    padding: '10px',
                                }}
                            >
                                Our mutual aid volunteer dashboard serves as a
                                central hub for volunteers to view and respond
                                to requests from community members.
                            </div>
                        </Tooltip>
                    }
                >
                    <img
                        src={InfoSVG}
                        style={{
                            cursor: 'pointer',
                            animationDelay: '1s',
                        }}
                        className="animate__animated animate__tada"
                    />
                </OverlayTrigger>
            </h1>
            <RequestsTable
                requests={requests}
                handler={handler}
                loaded={loaded}
            />
            {selected && (
                <RequestModal
                    show={show}
                    handler={handler}
                    selected={selected}
                    request={requests[selected]}
                />
            )}
            <p
                style={{
                    display: !loaded ? 'none' : 'inherit',
                }}
            >
                <small>
                    Our mission is to connect those in need with volunteers who
                    are eager to help, and this tab is a crucial part of that
                    mission. If you are looking to volunteer your time and
                    resources, this tab provides a platform for making that
                    happen. Browse through current requests, find one that
                    resonates with you, and join the movement to build a
                    stronger, more supportive community. Your contributions can
                    make a real difference in the lives of those around you, and
                    we are grateful for your support. If you have any technical
                    issues or ideas for new features that would improve your
                    experience on our mutual aid volunteer dashboard, don't
                    hesitate to reach out to our tech team at for support at{' '}
                    <a href="mailto: support@communalists.com?subject=Communalists Volunteer Dashboard Support Request">
                        support@communalists.com
                    </a>
                    . We value your feedback and are committed to creating a
                    platform that meets the needs of both volunteers and those
                    in need.
                </small>
            </p>
        </Container>
    );
};

export default DashboardPage;
