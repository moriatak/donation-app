export interface IntentResponse {
  success: boolean;
  intentId: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: string;
}

export interface ReceiptResponse {
  success: boolean;
}

export interface DonationData {
  target: string;
  amount: string | number;
  name: string;
  phone: string;
  idNumber?: string;
  email?: string;
  dedication?: string;
}

export const TaktzivitAPI = {
  createIntent: async (data: DonationData): Promise<IntentResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { 
      success: true, 
      intentId: 'INT' + Date.now() 
    };
  },
  
  processPayment: async (
    intentId: string, 
    paymentData: { amount: string | number; phone: string }
  ): Promise<PaymentResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.1;
    
    if (success) {
      return { 
        success: true, 
        transactionId: 'TRX' + Date.now(), 
        status: 'completed' 
      };
    } else {
      throw new Error('תקלה בעיבוד התשלום. נסה שנית.');
    }
  },
  
  sendReceipt: async (
    transactionId: string, 
    method: 'sms' | 'email', 
    contact: string
  ): Promise<ReceiptResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};
export const DonorAPI = {
  checkDonorExists: async (phone: string): Promise<{ exists: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // סימולציה: אם הטלפון מסתיים ב-5 או 0, התורם קיים
    const lastDigit = phone.slice(-1);
    return { exists: lastDigit === '5' || lastDigit === '0' };
  },
  
  sendVerificationCode: async (phone: string): Promise<{ success: boolean; expiresIn: number }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`קוד אימות נשלח ל-${phone}: 123456`); // בפרודקשן זה יישלח ב-SMS
    return { success: true, expiresIn: 300 }; // 5 דקות
  },
  
  verifyCode: async (phone: string, code: string): Promise<{
    success: boolean;
    donorData?: {
      name: string;
      phone: string;
      idNumber: string;
      email: string;
    };
  }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // סימולציה: קוד נכון הוא תמיד "123456"
    if (code === '123456') {
      return {
        success: true,
        donorData: {
          name: 'יוסי כהן',
          phone: phone,
          idNumber: '123456789',
          email: 'yossi@example.com'
        }
      };
    }
    
    return { success: false };
  }
};