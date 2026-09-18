import React, { createContext, useContext, useState } from 'react';
import { CountryCurrency, SUPPORTED_COUNTRIES } from '../data/countries';

interface CurrencyContextType {
  selectedCountry: CountryCurrency;
  setCountryByCurrency: (currencyCode: string) => void;
  isLoadingCurrency: boolean;
  setIsLoadingCurrency: (loading: boolean) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCurrency>(() => {
    const saved = localStorage.getItem('selectedCurrency');
    const found = SUPPORTED_COUNTRIES.find(c => c.currency === saved);
    return found || SUPPORTED_COUNTRIES[0]; // Default: India (INR)
  });

  const [isLoadingCurrency, setIsLoadingCurrency] = useState<boolean>(false);

  const setCountryByCurrency = (currencyCode: string) => {
    const found = SUPPORTED_COUNTRIES.find(c => c.currency === currencyCode);
    if (found) {
      setIsLoadingCurrency(true);
      setSelectedCountry(found);
      localStorage.setItem('selectedCurrency', found.currency);
      setTimeout(() => setIsLoadingCurrency(false), 400);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCountry,
        setCountryByCurrency,
        isLoadingCurrency,
        setIsLoadingCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return ctx;
};
