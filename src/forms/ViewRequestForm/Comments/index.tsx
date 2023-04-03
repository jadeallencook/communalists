import getComments from '@api/get-commets';
import getUsernames from '@api/get-usernames';
import CommentsForm from '@forms/CommentsForm';
import RequestCommentInterface from '@interfaces/comment';
import getUIDsFromComments from '@utils/get-uids-from-comments';
import organizeCommentsByTime from '@utils/organize-comments-by-time';
import timestampToCommentString from '@utils/timestamp-to-comment-string';
import { useEffect, useState } from 'react';
import { Alert, Form, Spinner, Toast } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Comments: StyledComponent = styled(
    ({ className, id }: { className: string; id: string }) => {
        const [comments, setComments] = useState<{
            [key: string]: RequestCommentInterface;
        }>({});
        const [isLoading, setIsLoading] = useState<boolean>(true);
        const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
        const [usernames, setUsernames] = useState<{ [key: string]: string }>(
            {}
        );
        useEffect(() => {
            if (!isSubmitting) {
                getComments(id).then(async (response) => {
                    if (Object.keys(response).length) {
                        const uids = getUIDsFromComments(response);
                        const names = await getUsernames(uids);
                        setUsernames(names);
                    }
                    setComments(response);
                    setIsLoading(false);
                });
            }
        }, [isSubmitting]);
        return (
            <>
                {isLoading ? (
                    <div className={className}>
                        <Form.Label>Leave a Message</Form.Label>
                        <Spinner animation="border" />
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
                        {Object.entries(comments).length ? (
                            organizeCommentsByTime(comments).map(
                                ([key, { user, body, timestamp }]) => (
                                    <Toast className={className} key={key}>
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
