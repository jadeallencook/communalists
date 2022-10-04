import FirebaseContext from '../contexts/firebase.context';
import Header from '../components/organisms/Header';

const Home = () => {
	return (
		<FirebaseContext.Consumer>
			{(firebase) => {
				return <Header />;
			}}
		</FirebaseContext.Consumer>
	);
};

export default Home;
