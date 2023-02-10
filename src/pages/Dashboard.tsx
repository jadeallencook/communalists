import getRequests from '@api/get-requests';
import RequestAidInterface from '@interfaces/request-aid';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import RequestsTable from '@components/RequestsTable';
import RequestModal from '@components/RequestModal';

const Dashboard = () => {
	const [requests, setRequests] = useState<{
		[key: string]: RequestAidInterface;
	}>({});

	const [loaded, setLoaded] = useState<boolean>(false);
	const [show, setShow] = useState<boolean>(false);
	const [selected, setSelected] = useState<string>();
	const handler = (id?: string): void => {
		setSelected(id);
		setShow((prev) => !prev);
	};

	useEffect(() => {
		getRequests().then((requests) => {
			setRequests(requests);
			setLoaded(true);
		});
	}, []);

	return (
		<Container>
			<h1>Requests</h1>
			<RequestsTable
				requests={requests}
				handler={handler}
				loaded={loaded}
			/>
			{selected && (
				<RequestModal
					show={show}
					handler={handler}
					selected={selected}
					request={requests[selected]}
				/>
			)}
		</Container>
	);
};

export default Dashboard;
