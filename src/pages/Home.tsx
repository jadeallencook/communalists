import FirebaseContext from '../contexts/firebase.context';

const Home = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return <h1>Communalists Homepage</h1>;
			}}
		</FirebaseContext.Consumer>
	);
};

export default Home;
