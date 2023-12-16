import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
    <div>
        <h1>Hello World</h1>
    </div>
);

const root = document.getElementById('root');
createRoot(root).render(<App />);
