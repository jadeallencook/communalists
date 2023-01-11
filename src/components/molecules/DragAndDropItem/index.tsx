import { Row } from 'react-bootstrap';
import { useDrag } from 'react-dnd';
import styled, { StyledComponent } from 'styled-components';
import style from './style'

interface DragAndDropItem {
    className: string,
    type: string,
    id: string
}

const DragAndDropItem: StyledComponent = styled(({className, children, type, id}) => {
    const [, drag ] = useDrag(() => ({
        type: type,
        item: {
            // TODO: do we need type?
            type: 'ROW',
            id: id
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }))

    return (
        <Row role="Handle" ref={drag} className={className}>
            {children}
        </Row>
    )
})(style)

export default DragAndDropItem