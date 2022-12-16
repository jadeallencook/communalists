import React from 'react';
import ReactDOM from 'react-dom/client';

// router
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes';

// style
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import './normalize.css';

// components
import Navigation from '@organisms/Navigation';
import Footer from '@organisms/Footer';
import { GlobalProvider } from './context';

const elem = document.getElementById('root')!;
const root = ReactDOM.createRoot(elem);

root.render(
	<React.StrictMode>
		<GlobalProvider>
			<Router>
				<Navigation />
				<Routes>
					{routes.map(({ path, element }) => (
						<Route key={path} path={path} element={element}></Route>
					))}
				</Routes>
				<Footer center />
			</Router>
		</GlobalProvider>
	</React.StrictMode>
);
