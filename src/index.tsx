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
import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from 'react-query';
import { DashboardProvider, log } from './contexts/DashboardContext';
import toast, { ToastBar, Toaster } from 'react-hot-toast';
import { Button } from 'react-bootstrap';

// components
const elem = document.getElementById('root')!;
const root = ReactDOM.createRoot(elem);

const queryClient = new QueryClient({
    // These defaults can help with development, but should
    // be replaced before merging.
    defaultOptions: {
        queries: {
            onError: (error: any) =>
                void toast.error(error.message || String(error)),
        },
        mutations: {
            onError: (error: any) =>
                void toast.error(error.message || String(error)),
        },
    },

    // onError on the cache will ALWAYS be called, regardless of the query.
    // This means that we always get logging for query or mutation errors.
    queryCache: new QueryCache({
        onError: (error: any) => log(error.message || String(error)),
    }),
    mutationCache: new MutationCache({
        onError: (error: any) => log(error.message || String(error)),
    }),
});

root.render(
    <SnippetProvider>
        <QueryClientProvider client={queryClient}>
            <Router>
                <DashboardProvider>
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
                </DashboardProvider>
            </Router>

            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration:
                        process.env.NODE_ENV === 'development' ? 1000000 : 5000,
                    style: { maxWidth: 'unset' },
                }}
            >
                {(t) => (
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <div
                                className={'d-flex flex-row align-items-center'}
                            >
                                {icon}
                                <div style={{ width: '12rem' }}>{message}</div>

                                {t.type !== 'loading' && (
                                    <Button onClick={() => toast.dismiss(t.id)}>
                                        Dismiss
                                    </Button>
                                )}
                            </div>
                        )}
                    </ToastBar>
                )}
            </Toaster>
        </QueryClientProvider>
    </SnippetProvider>
);
