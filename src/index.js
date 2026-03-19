import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import DailyWordPage from './pages/DailyWordPage';
import ToepenPage from './pages/ToepenPage';
import StreamDashboardPage from './pages/StreamDashboardPage';
import StreamChatPage from './pages/StreamChatPage';
import SP500CalculatorPage from './pages/SP500CalculatorPage';
import LabPage from './pages/LabPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/daily-word" element={<DailyWordPage />} />
        <Route path="/toepen" element={<ToepenPage />} />
        <Route path="/stream" element={<StreamDashboardPage />} />
        <Route path="/stream/chat" element={<StreamChatPage />} />
        <Route path="/sp500-calculator" element={<SP500CalculatorPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
