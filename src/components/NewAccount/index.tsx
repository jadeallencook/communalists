import styled, { StyledComponent } from 'styled-components';
import style from './style';

const NewAccount: StyledComponent = styled(
    ({ className }: { className: string }) => (
        <div className={className}>
            <h1>Workers of the World, Unite</h1>
            <p>You have two options to get started:</p>
            <ol>
                <li>
                    <b>Join an Existing Organization:</b> Reach out to a current
                    member or organization moderator for an invite link. They'll
                    be happy to welcome you into their group, and you'll gain
                    access to all the organization's tools and resources.
                    <br />
                    <br />
                </li>
                <li>
                    <b>Create Your Own Organization:</b> Start your own
                    organization and lead your community initiatives. You'll
                    have the freedom to set your organization's goals, connect
                    with like-minded individuals, and make a difference
                    together.
                </li>
            </ol>
            <p>
                Whichever path you choose, we're here to support you every step
                of the way!
            </p>
        </div>
    )
)(style);

export default NewAccount;
