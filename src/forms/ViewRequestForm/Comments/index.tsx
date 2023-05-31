import getComments from '@api/get-thread';
import getUsernames from '@api/get-usernames';
import CommentsForm from '@forms/CommentsForm';
import ThreadInterface from '@interfaces/thread';
import getUIDsFromComments from '@utils/get-uids-from-comments';
import timestampToCommentString from '@utils/timestamp-to-comment-string';
import { useEffect, useState } from 'react';
import { Alert, Form, Toast } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import Loading from '@components/Loading';

const Comments: StyledComponent = styled(
    ({ className, id }: { className: string; id: string }) => {
        const [thread, setThread] = useState<ThreadInterface>({
            comments: [],
            lastModified: null,
        });
        const [isLoading, setIsLoading] = useState<boolean>(true);
        const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
        const [usernames, setUsernames] = useState<{ [key: string]: string }>(
            {}
        );
        useEffect(() => {
            if (!isSubmitting) {
                getComments(id).then(async (response) => {
                    if (response?.comments?.length) {
                        const uids = getUIDsFromComments(response?.comments);
                        const names = await getUsernames(uids);
                        setUsernames(names);
                    }
                    setThread(response);
                    setIsLoading(false);
                });
            }
        }, [isSubmitting]);
        return (
            <>
                {isLoading ? (
                    <div className={className}>
                        <Form.Label>Leave a Message</Form.Label>
                        <Loading />
                    </div>
                ) : (
                    <>
                        <CommentsForm
                            id={id}
                            setIsSubmitting={setIsSubmitting}
                            className="animate__animated animate__fadeIn"
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
                                                {usernames[user] || '@comrade'}
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
                                Be the first volunteer to start the discussion
                                for this request!
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
