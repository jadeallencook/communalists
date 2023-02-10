import addComment from '@api/add-comment';
import RequestCommentInterface from '@interfaces/request-comment';
import { Timestamp } from 'firebase/firestore';
import { useFormik } from 'formik';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const CommentsForm: StyledComponent = styled(
    ({
        className,
        id,
        setIsSubmitting,
    }: {
        className: string;
        id: string;
        setIsSubmitting: any;
    }) => {
        const {
            handleChange,
            handleSubmit,
            isSubmitting,
            values: { body },
        } = useFormik<RequestCommentInterface>({
            initialValues: {
                uid: '@comrade',
                body: '',
                timestamp: Timestamp.fromDate(new Date()),
            },
            onSubmit: async (value, { resetForm }) => {
                if (value) {
                    setIsSubmitting(true);
                    await addComment(value, id);
                    resetForm();
                    setIsSubmitting(false);
                }
            },
        });
        return (
            <Form onSubmit={handleSubmit} className={className}>
                <Form.Label>Comments</Form.Label>
                <InputGroup>
                    <Form.Control
                        id="body"
                        name="body"
                        type="text"
                        onChange={handleChange}
                        value={body}
                        placeholder="Write your comment here..."
                        required
                        disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        Submit Comment
                    </Button>
                </InputGroup>
            </Form>
        );
    }
)(style);

export default CommentsForm;
