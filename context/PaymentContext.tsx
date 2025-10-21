// PaymentContext.tsx
import React, { createContext, useContext, useState } from 'react';

type CardData = {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  idNumber: string;
};

type PaymentContextType = {
  sensitiveCardData: CardData | null;
  setSensitiveCardData: (data: CardData | null) => void;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [sensitiveCardData, setSensitiveCardData] = useState<CardData | null>(null);

  return (
    <PaymentContext.Provider value={{ sensitiveCardData, setSensitiveCardData }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};