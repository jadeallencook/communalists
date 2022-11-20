import React from 'react';
import ReactDOM from 'react-dom/client';

// router
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// firebase
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase.config';

// style
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import './normalize.css';

// pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import SignIn from './pages/SignIn';

// dashboard
import DashboardProfile from './pages/DashboardProfile';
import DashboardListings from './pages/DashboardListings';
import DashboardOrganizations from './pages/DashboardOrganizations';
import DashboardOrders from './pages/DashboardOrders';
import DashboardSettings from './pages/DashboardSettings';
import DashboardAdmin from './pages/DashboardAdmin';

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
				<Route path="/listings" element={<Listings />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/dashboard" element={<DashboardOrders />}></Route>
				<Route
					path="/dashboard/profile"
					element={<DashboardProfile />}
				></Route>
				<Route
					path="/dashboard/listings"
					element={<DashboardListings />}
				></Route>
				<Route
					path="/dashboard/organizations"
					element={<DashboardOrganizations />}
				></Route>
				<Route
					path="/dashboard/orders"
					element={<DashboardOrders />}
				></Route>
				<Route
					path="/dashboard/settings"
					element={<DashboardSettings />}
				></Route>
				<Route
					path="/dashboard/admin"
					element={<DashboardAdmin />}
				></Route>
				<Route path="/sign-in" element={<SignIn />}></Route>
				<Route
					path="/create-account"
					element={<CreateAccount />}
				></Route>
			</Routes>
			<Footer />
		</Router>
	</React.StrictMode>
);
