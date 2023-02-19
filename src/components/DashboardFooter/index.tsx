import styled, { StyledComponent } from 'styled-components';
import style from './style';

const DashboardFooter: StyledComponent = styled(
    ({ className }: { className: string }) => (
        <p className={className}>
            <small>
                Our mission is to connect those in need with volunteers who are
                eager to help, and this tab is a crucial part of that mission.
                If you are looking to volunteer your time and resources, this
                tab provides a platform for making that happen. Browse through
                current requests, find one that resonates with you, and join the
                movement to build a stronger, more supportive community. Your
                contributions can make a real difference in the lives of those
                around you, and we are grateful for your support. If you have
                any technical issues or ideas for new features that would
                improve your experience on our mutual aid volunteer dashboard,
                don't hesitate to reach out to our tech team at for support at{' '}
                <a href="mailto: support@communalists.com?subject=Communalists Volunteer Dashboard Support Request">
                    support@communalists.com
                </a>
                . We value your feedback and are committed to creating a
                platform that meets the needs of both volunteers and those in
                need.
            </small>
        </p>
    )
)(style);

export default DashboardFooter;
