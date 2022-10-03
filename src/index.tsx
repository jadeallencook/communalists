import React from 'react';
import ReactDOM from 'react-dom/client';

// router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// firebase
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase.config';
import FirebaseContext from './contexts/firebase.context';

// style
import './theme.css';
import './normalize.css';

// pages
import Home from './pages/Home';

const elem = document.getElementById('root')!;
const root = ReactDOM.createRoot(elem);
const app = initializeApp(firebaseConfig);

root.render(
	<React.StrictMode>
		<FirebaseContext.Provider value={{ app }}>
			<Router>
				<Routes>
					<Route path="/" element={<Home />}></Route>
				</Routes>
			</Router>
		</FirebaseContext.Provider>
	</React.StrictMode>
);
