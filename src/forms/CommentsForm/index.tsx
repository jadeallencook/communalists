import addComment from '@api/add-comment';
import RequestCommentInterface from '@interfaces/request-comment';
import { Timestamp } from 'firebase/firestore';
import { useFormik } from 'formik';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
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
                setIsSubmitting(true);
                await addComment(value, id);
                resetForm();
                setIsSubmitting(false);
            },
        });
        return (
            <Form onSubmit={handleSubmit} className={className}>
                <Form.Label>Comments</Form.Label>
                <Container>
                    <Row>
                        <Col>
                            <Form.Control
                                id="body"
                                name="body"
                                type="text"
                                onChange={handleChange}
                                value={body}
                                required
                                disabled={isSubmitting}
                            />
                        </Col>
                        <Col>
                            <Button type="submit" disabled={isSubmitting}>
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </Form>
        );
    }
)(style);

export default CommentsForm;
