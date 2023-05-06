import { Badge } from 'react-bootstrap';

export const Tags = ({ tags, id }) =>
    tags.map((tag) => (
        <Badge bg="dark" key={`${id}-${tag}`}>
            {tag}
        </Badge>
    ));
