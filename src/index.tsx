import ReactDOM from 'react-dom/client';

// router
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes';

// style
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import './normalize.css';
import Navigation from '@components/Navigation';
import Footer from '@components/Footer';
import { SnippetProvider } from './contexts/SnippetContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DashboardProvider } from './contexts/DashboardContext';

// components
const elem = document.getElementById('root')!;
const root = ReactDOM.createRoot(elem);

const queryClient = new QueryClient();

root.render(
    <QueryClientProvider client={queryClient}>
        <DashboardProvider>
            <SnippetProvider>
                <Router>
                    <Navigation />
                    <Routes>
                        {routes.map(({ path, element }) => (
                            <Route
                                key={path}
                                path={path}
                                element={element}
                            ></Route>
                        ))}
                    </Routes>
                    <Footer />
                </Router>
            </SnippetProvider>
        </DashboardProvider>
    </QueryClientProvider>
);
