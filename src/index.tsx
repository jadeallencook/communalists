import React from 'react';
import ReactDOM from 'react-dom/client';

// router
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// firebase
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase.config';
import { database } from '../database';

// style
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import './normalize.css';

// pages
import Home from './pages/Home';
import Resources from './pages/Resources';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateAccount from './pages/CreateAccount';

// components
import Navigation from './components/organisms/Navigation';
import Footer from './components/organisms/Footer';

const elem = document.getElementById('root')!;
const root = ReactDOM.createRoot(elem);
const app = initializeApp(firebaseConfig);

root.render(
	<React.StrictMode>
		<Router>
			<Navigation />
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/resources" element={<Resources />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/dashboard" element={<Dashboard />}></Route>
				<Route
					path="/create-account"
					element={<CreateAccount />}
				></Route>
			</Routes>
			<Footer />
		</Router>
	</React.StrictMode>
);
