import { Badge, Table } from 'react-bootstrap';
import LoadingImage from '@assets/loading.gif';
import locations from '@objects/locations';
import languages from '@objects/languages';
import stages from '@objects/stages';
import RequestAidInterface from '@interfaces/request-aid';
import styled, { StyledComponent } from 'styled-components';
import style from './style';
import timestampToDateString from '@utils/timestamp-to-date-string';
import getBadgeBgForStage from '@utils/get-badge-bg-for-stage';

const RequestsTable: StyledComponent = styled(
	({
		requests,
		handler,
		loaded,
		className,
	}: {
		requests: { [key: string]: RequestAidInterface };
		handler: (id?: string) => void;
		loaded: boolean;
		className: string;
	}) => (
		<div className={className}>
			{loaded ? (
				<Table striped bordered hover variant="dark">
					<thead>
						<tr>
							<th>Submitted</th>
							<th>Name</th>
							<th>Location</th>
							<th>Language</th>
							<th>Stage</th>
						</tr>
					</thead>
					<tbody>
						{Object.entries(requests).map(
							([
								id,
								{ name, location, language, stage, submitted },
							]) => (
								<tr key={id} onClick={() => handler(id)}>
									<td>{timestampToDateString(submitted)}</td>
									<td>{name}</td>
									<td>{locations[location]}, CA</td>
									<td>{languages[language]}</td>
									<td>
										<Badge bg={getBadgeBgForStage(stage)}>
											{stages[stage]}
										</Badge>
									</td>
								</tr>
							)
						)}
					</tbody>
				</Table>
			) : (
				<img src={LoadingImage} />
			)}
		</div>
	)
)(style);

export default RequestsTable;
