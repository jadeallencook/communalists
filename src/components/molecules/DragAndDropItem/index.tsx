import { useDrag } from 'react-dnd';
import styled, { StyledComponent } from 'styled-components';
import style from './style'

interface DragAndDropItem {
    className: string,
    type: string,
}

const DragAndDropItem: StyledComponent = styled(({className, children, type}) => {
    // TODO: for some reason deleting this ',' causes the ref on the div to throw an error
    const [, drag ] = useDrag(() => ({
        type: type,
        item: {
            type: 'ROW',
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }))

    return (
        <div role="Handle" ref={drag} className={className}>
            {children}
        </div>
    )
})(style)

export default DragAndDropItem