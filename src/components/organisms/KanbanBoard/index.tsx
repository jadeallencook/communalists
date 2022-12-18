import { Container } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import { OrderInterface } from '@interfaces/order';

interface KanbanBoardInterface {
    className: string
    orders: { [key: string]: OrderInterface }
}

const KanbanBoard: StyledComponent = styled(({ className, orders }: KanbanBoardInterface) => {
    const statusOptions = ['Unassigned', 'In Progress', 'Completed']
    
	return (
		<Container>

        </Container>
	);
})(style);

export default KanbanBoard;