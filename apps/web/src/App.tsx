import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { CommodityDetailPage } from './pages/CommodityDetailPage';
import { HistoricalPage } from './pages/HistoricalPage';
import { ContractsPage } from './pages/ContractsPage';
import { PricingPage } from './pages/PricingPage';
import { ExportPage } from './pages/ExportPage';

export const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/commodities/:commoditySymbol" element={<CommodityDetailPage />} />
            <Route path="/historical" element={<HistoricalPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CurrencyProvider>
  );
};

export default App;
