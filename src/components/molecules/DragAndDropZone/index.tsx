import { Row } from 'react-bootstrap';
import { useDrop } from 'react-dnd'
import styled, { StyledComponent } from 'styled-components';
import style from './style'

interface DragAndDropZone {
    className: string,
    data: any,
    onDrop: Function,
    itemType: string,
    height?: string
}

// TODO: make molecule instead of organism, this is reusable
const DragAndDropZone: StyledComponent = styled(({className, data, onDrop, itemType, height = '10px'}) => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: itemType, // replace with itemType
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop()
        }),
        drop: (item, monitor) => {
            onDrop(data, item)
        }
    }))


    const isHovered = isOver && canDrop;
    
    // TODO: Items should rearrange inside columns
    return (
        <Row className={className} ref={drop} style={{minHeight: height}}>
            <Row className={`'dropZone' ${ isHovered && 'hovered'}`} />
        </Row>
    )
})(style)

export default DragAndDropZone