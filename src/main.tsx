import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
