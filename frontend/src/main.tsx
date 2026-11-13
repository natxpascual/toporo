import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { useTopologyStore } from './store/useTopologyStore';
import { ARCHITECTURE_TEMPLATES } from './data/architectureTemplates';

if (typeof window !== 'undefined') {
  (window as any).__STUDIO_STORE__ = useTopologyStore;
  (window as any).useTopologyStore = useTopologyStore;
  (window as any).__ARCH_TEMPLATES__ = ARCHITECTURE_TEMPLATES;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

