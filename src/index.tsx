import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
    <div>
        <h1>Hello World</h1>
    </div>
);

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
