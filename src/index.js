import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import './styles/design-system.css';
import App from './App';
import DailyWordPage from './pages/DailyWordPage';
import ToepenPage from './pages/ToepenPage';
import PestenPage from './pages/PestenPage';
import StreamDashboardPage from './pages/StreamDashboardPage';
import StreamChatPage from './pages/StreamChatPage';
import SP500CalculatorPage from './pages/SP500CalculatorPage';
import LabPage from './pages/LabPage';
import ProjectCasePage from './pages/ProjectCasePage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';

const savedTheme = window.localStorage.getItem('portfolio-theme');
document.documentElement.setAttribute('data-theme', savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/word-lee" element={<DailyWordPage />} />
        <Route path="/daily-word" element={<Navigate to="/word-lee" replace />} />
        <Route path="/toepen" element={<ToepenPage />} />
        <Route path="/pesten" element={<PestenPage />} />
        <Route path="/stream" element={<StreamDashboardPage />} />
        <Route path="/stream/chat" element={<StreamChatPage />} />
        <Route path="/sp500-calculator" element={<SP500CalculatorPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/projects/:slug" element={<ProjectCasePage />} />
        <Route path="/nl" element={<App />} />
        <Route path="/nl/word-lee" element={<DailyWordPage />} />
        <Route path="/nl/daily-word" element={<Navigate to="/nl/word-lee" replace />} />
        <Route path="/nl/toepen" element={<ToepenPage />} />
        <Route path="/nl/pesten" element={<PestenPage />} />
        <Route path="/nl/stream" element={<StreamDashboardPage />} />
        <Route path="/nl/stream/chat" element={<StreamChatPage />} />
        <Route path="/nl/sp500-calculator" element={<SP500CalculatorPage />} />
        <Route path="/nl/lab" element={<LabPage />} />
        <Route path="/nl/projects/:slug" element={<ProjectCasePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
