import addComment from '@api/add-comment';
import RequestCommentInterface from '@interfaces/comment';
import { Timestamp } from 'firebase/firestore';
import { useFormik } from 'formik';
import { Button, Form, InputGroup, Row } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { FeatureType } from '@custom-types/feature';

interface Props {
    className: string;
    id: string;
    setIsSubmitting: any;
    organization: string;
    type: FeatureType;
}

const CommentsForm: StyledComponent = styled(
    ({ className, id, setIsSubmitting, organization, type }: Props) => {
        const {
            handleChange,
            handleSubmit,
            isSubmitting,
            values: { body },
        } = useFormik<RequestCommentInterface>({
            initialValues: {
                user: '',
                body: '',
                timestamp: Timestamp.fromDate(new Date()),
                isArchived: false,
            },
            onSubmit: async (value, { resetForm }) => {
                if (value) {
                    setIsSubmitting(true);
                    await addComment(
                        {
                            ...value,
                            timestamp: Timestamp.fromDate(new Date()),
                        },
                        id,
                        organization,
                        type
                    );
                    resetForm();
                    setIsSubmitting(false);
                }
            },
        });
        return (
            <Form onSubmit={handleSubmit} className={className}>
                <Form.Label>Leave Comment</Form.Label>
                <InputGroup>
                    <Form.Control
                        id="body"
                        name="body"
                        type="text"
                        onChange={handleChange}
                        value={body}
                        placeholder="Enter your comment"
                        required
                        disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        Post
                    </Button>
                </InputGroup>
            </Form>
        );
    }
)(style);

export default CommentsForm;
