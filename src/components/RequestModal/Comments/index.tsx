import getComments from '@api/get-commets';
import CommentsForm from '@forms/CommentsForm';
import RequestCommentInterface from '@interfaces/request-comment';
import organizeCommentsByTime from '@utils/organize-comments-by-time';
import timestampToCommentString from '@utils/timestamp-to-comment-string';
import { useEffect, useState } from 'react';
import { Toast } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const Comments: StyledComponent = styled(
    ({ className, id }: { className: string; id: string }) => {
        const [comments, setComments] = useState<{
            [key: string]: RequestCommentInterface;
        }>({});
        const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
        useEffect(() => {
            if (!isSubmitting) {
                getComments(id).then((response) => setComments(response));
            }
        }, [isSubmitting]);
        return (
            <>
                <CommentsForm id={id} setIsSubmitting={setIsSubmitting} />
                {organizeCommentsByTime(comments).map(
                    ([key, { uid, body, timestamp }], index) => (
                        <Toast className={className} key={key}>
                            <Toast.Header closeButton={false}>
                                <strong className="me-auto">{uid}</strong>
                                <small>{timestampToCommentString(timestamp)}</small>
                            </Toast.Header>
                            <Toast.Body>{body}</Toast.Body>
                        </Toast>
                    )
                )}
            </>
        );
    }
)(style);

export default Comments;