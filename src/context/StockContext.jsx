'use client';

import { createContext, useContext, useState } from 'react';
import { SessionStorageService } from '@/lib/utils';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stockData, setStockDataState] = useState(() => {
    return SessionStorageService.get('stock_detail_item');
  });

  const setStockData = (data) => {
    setStockDataState(data);
    SessionStorageService.set('stock_detail_item', data);
  };

  const getStockData = (id) => {
    // If id is provided, verify it matches the current stock data
    if (id && stockData?.productId?.toString() !== id.toString()) {
      return null;
    }
    return stockData;
  };

  return (
    <StockContext.Provider value={{ setStockData, getStockData, stockData }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};
