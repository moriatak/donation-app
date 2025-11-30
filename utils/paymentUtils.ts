// utils/paymentUtils.ts
import { NextActionApp } from '@/config/mockConfig';

export const getAvailablePaymentMethods = (paymentOptions: any[], isMonthly: string) => {
  return paymentOptions
  .filter((method) => {
    // אם זה תשלום חודשי - הצג רק הוראת קבע
    if (isMonthly === 'true' && !method.type.includes('recurring_payment')) {
      return false;
    }
    // אם זה לא תשלום חודשי - אל תצג הוראת קבע
    if (isMonthly !== 'true' && method.type.includes('recurring_payment')) {
      return false;
    }
    return true;
  })
  .sort((a, b) => a.sort - b.sort);

};

// הפונקציה בודקת אם יש אפשרות של הוראת קבע באפשרויות תשלום
export const hasRecurringPaymentMethod = (paymentOptions: any[]): boolean => {
  return paymentOptions.some(method => method.type.includes('recurring_payment'));
};

export const navigateToPaymentMethod = (router: any, nextAction: NextActionApp, type: string, params: any) => {
  if (nextAction === 'iframe') {
    router.push({
      pathname: '/iframe-payment',
      params: { ...params, paymentMethod: type, nextAction }
    });
  } else if (nextAction === 'typing') {
    router.push({
      pathname: '/credit-card',
      params: { ...params, paymentMethod: type, nextAction }
    });
  } else if (nextAction === 'touch') {
    router.push({
      pathname: '/credit-card-touch',
      params: { ...params, paymentMethod: type, nextAction }
    });
  } else { // if nextAction === 'none'
    router.push({
      pathname: '/processing',
      params: { ...params, paymentMethod: 'none', nextAction }
    });
  }
};