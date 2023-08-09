import getThread from '@api/get-thread';
import CommentsForm from '@forms/CommentsForm';
import ThreadInterface from '@interfaces/thread';
import timestampToCommentString from '@utils/timestamp-to-comment-string';
import { useContext, useEffect, useState } from 'react';
import { Alert, Form, Toast } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import Loading from '@components/Loading';
import DashboardContext from '../../../contexts/DashboardContext';
import { FeatureType } from '@custom-types/feature';

interface Props {
    className: string;
    id: string;
    type: FeatureType;
    organization: string;
}

const Comments: StyledComponent = styled(
    ({ className, id, type, organization }: Props) => {
        const [thread, setThread] = useState<ThreadInterface>({
            comments: [],
            lastModified: null,
        });
        const [isLoading, setIsLoading] = useState<boolean>(true);
        const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
        const { displayNames } = useContext(DashboardContext);

        useEffect(() => {
            if (!isSubmitting) {
                getThread(organization, id, type).then(async (response) => {
                    setThread(response);
                    setIsLoading(false);
                });
            }
        }, [isSubmitting]);
        return (
            <>
                {isLoading ? (
                    <div className={className}>
                        <Form.Label>Comment</Form.Label>
                        <Loading />
                    </div>
                ) : (
                    <>
                        <CommentsForm
                            id={id}
                            setIsSubmitting={setIsSubmitting}
                            className="animate__animated animate__fadeIn"
                            type={type}
                            organization={organization}
                        />
                        <br />
                        <br />
                        {thread?.comments.length ? (
                            thread?.comments.map(
                                ({ user, body, timestamp }, index) => (
                                    <Toast
                                        className={className}
                                        key={`comment-${index}`}
                                    >
                                        <Toast.Header closeButton={false}>
                                            <strong className="me-auto">
                                                {displayNames[user] ||
                                                    'Anonymous Comrade'}
                                            </strong>
                                            <small>
                                                {timestampToCommentString(
                                                    timestamp
                                                )}
                                            </small>
                                        </Toast.Header>
                                        <Toast.Body>{body}</Toast.Body>
                                    </Toast>
                                )
                            )
                        ) : (
                            <Alert variant="secondary">
                                <strong>No comments have been made yet.</strong>
                                <br />
                                Be the first to start the discussion.
                            </Alert>
                        )}
                        <br />
                        <br />
                    </>
                )}
            </>
        );
    }
)(style);

export default Comments;
