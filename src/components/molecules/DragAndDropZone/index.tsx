import { useEffect } from 'react';
import { useDrop } from 'react-dnd'
import styled, { StyledComponent } from 'styled-components';
import style from './style'

interface DragAndDropZone {
    className: string,
    data: any,
    onDrop: Function,
    itemType: string
}

// TODO: make molecule instead of organism, this is reusable
const DragAndDropZone: StyledComponent = styled(({className, data, onDrop, itemType}) => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: itemType, // replace with itemType
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop()
        }),
        drop: (item, monitor) => {
            console.log("dropped, ", item, monitor)
            onDrop(data, item)
        }
    }))


    const isHovered = isOver && canDrop;
    
    // TODO: Items should rearrange inside columns
    return (
        // TODO, can we have className and hovered both on top level components?
        <div className={className} ref={drop}>
            <div
                className={`'dropZone' ${ isHovered && 'hovered'}`}
            />
        </div>
    )
})(style)

export default DragAndDropZone