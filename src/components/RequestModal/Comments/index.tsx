import getComments from '@api/get-commets';
import CommentsForm from '@forms/CommentsForm';
import RequestCommentInterface from '@interfaces/request-comment';
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
        useEffect(() => {
            if (!isSubmitting) {
                getComments(id).then((response) => {
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
                                ([key, { uid, body, timestamp }], index) => (
                                    <Toast
                                        className={`${className} animate__animated animate__flipInX`}
                                        key={key}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                    >
                                        <Toast.Header closeButton={false}>
                                            <strong className="me-auto">
                                                {uid}
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
                            <Alert
                                variant="secondary"
                                className="animate__animated animate__flipInX"
                                style={{
                                    animationDelay: '0.1s',
                                }}
                            >
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
