import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// misc
import './theme.css';
import './normalize.css';

const elem = document.getElementById('root')!;
const root = ReactDOM.createRoot(elem);

root.render(
	<React.StrictMode>
		<Router>
			<Routes>
				<Route path="/" element={<h1>Communalists</h1>}></Route>
			</Routes>
		</Router>
	</React.StrictMode>
);
