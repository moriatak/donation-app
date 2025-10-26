import { MOCK_QR_CONFIG } from '../config/mockConfig';
const config = MOCK_QR_CONFIG;

export interface IntentResponse {
  success: boolean;
  intentId: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: string;
  shvaCode: string;
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
    paymentDataToPAy: { 
      amount: string | number; 
      phone: string;
      donorFirstName: string;
      donorLastName: string;
      donorEmail: string;
      donorPhone: string;
      targetId: string;
      targetName: string;
      paymentMethod: string;
      transactionId: string;
      cardData?: {
        cardNumber: string;
        expiry: string;
        cvv: string;
        idNumber: string;
      } | null
    }
  ): Promise<PaymentResponse | any> => {
    try {
      // יצירת אובייקט הבקשה שיישלח
      const requestBody = {
        companyId: config.settings.companyId,
        token: config.settings.copmainingToken,
        parentName: paymentDataToPAy.transactionId,
        copmainingToken: config.settings.copmainingId, // Campaign ID
        source: 'android', // חשוב! חייב להיות android
        
        paymentMethod: { 
          type: paymentDataToPAy.paymentMethod
        },
        
        customerData: {
          firstname: paymentDataToPAy.donorFirstName,
          lastname: paymentDataToPAy.donorLastName,
          email: paymentDataToPAy.donorEmail,
          phone: paymentDataToPAy.donorPhone
        },
        
        transaction: {
          items: [
            { 
              itemId: '3', // גדרה
              // itemId: '305', // מעמק
              // itemId: String(paymentData.targetId), 
              name: paymentDataToPAy.targetName, 
              unitAmount: Number(paymentDataToPAy.amount), 
              quantity: 1 
            }
          ]
        },
        // todo ----> להוסיף בדיקה מה סוג השליחה ואם צריך להיות פרטי אשראי, לבדוק שבאמת יש
        // פרטי כרטיס אשראי - רק לאנדרואיד!
        paymentData: paymentDataToPAy.cardData ? {
          creditCard: paymentDataToPAy.cardData.cardNumber,
          creditCardDateMmYy: paymentDataToPAy.cardData.expiry,
          cvv2: paymentDataToPAy.cardData.cvv,
          id: paymentDataToPAy.cardData.idNumber
        } : undefined  // או אפשר לא לכלול בכלל את paymentData אם אין cardData
      };

      // יצירת עותק של הבקשה להדפסת לוג עם הסתרת פרטים רגישים
      const safeLogObject = JSON.parse(JSON.stringify(requestBody));
      // הסתרת פרטים רגישים בלוג
      if (safeLogObject.paymentData) {
        if (safeLogObject.paymentData.creditCard) {
          const lastFour = safeLogObject.paymentData.creditCard.slice(-4);
          safeLogObject.paymentData.creditCard = `****-****-****-${lastFour}`;
        }
        if (safeLogObject.paymentData.cvv2) {
          safeLogObject.paymentData.cvv2 = '***';
        }
        if (safeLogObject.paymentData.id) {
          const lastDigits = safeLogObject.paymentData.id.slice(-4);
          safeLogObject.paymentData.id = `*****${lastDigits}`;
        }
      }

      // הדפסת הבקשה ללוג לפני שליחה
      console.log('======== PAYMENT REQUEST ========');
      console.log('URL: https://tak.co.il/apiPayment/api/ecommerce/shop-payment');
      console.log('METHOD: POST');
      console.log('HEADERS: Content-Type: application/json');
      console.log('BODY:', JSON.stringify(safeLogObject, null, 2));
      console.log('================================');

      // לפני שליחת הבקשה, ודא שכל הפרמטרים קיימים
      if (!requestBody.transaction?.items?.[0]?.itemId) {
        throw new Error('חסר מזהה פריט (itemId) בבקשת התשלום');
      }

      const response = await fetch('https://tak.co.il/apiPayment/api/ecommerce/shop-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
  
      const result = await response.json();
  
      // הדפסת התשובה שהתקבלה
      console.log('======== PAYMENT RESPONSE ========');
      console.log(JSON.stringify(result, null, 2));
      console.log('=================================');

      if (result.success) {
        
        switch (paymentDataToPAy.paymentMethod) {
          case 'credit-tap':
            if (result.shvaCode && result.shvaCode.startsWith('000')) {
              console.log('התשלום אושר!');
              console.log('קוד אישור:', result.shvaCode);
              
              return { 
                success: true, 
                transactionId: result.transactionId || ('TRX' + Date.now()), 
                status: 'completed',
                shvaCode: result.shvaCode
              };
            } else {
              console.log('התשלום נדחה:', result.shvaCode);
              throw new Error(`תקלה בעיבוד התשלום. קוד שב"א: ${result.shvaCode}`);
            }
        
          case 'bit':
            return result;

        
          default:
            throw new Error('אמצעי תשלום לא נתמך');
        }

      } else {
        throw new Error(result && result.message ? `שגיאת תשלום: ${result.message}` : 
  (result && result.error ? `שגיאת תשלום: ${result.error}` : 'תקלה בעיבוד התשלום'));
      }
    } catch (error: any) {
      throw new Error(error.message || 'תקלה בעיבוד התשלום. נסה שנית.');
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
    // סימולציה: אם הטלפון מסתיים ב-3 או 0, התורם קיים
    const lastDigit = phone.slice(-1);
    return { exists: lastDigit === '3' || lastDigit === '0' };
  },
  
  sendVerificationCode: async (phone: string): Promise<{ success: boolean; expiresIn: number }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`קוד אימות נשלח ל-${phone}: 123456`); // בפרודקשן זה יישלח ב-SMS
    return { success: true, expiresIn: 300 }; // 5 דקות
  },
  
  verifyCode: async (phone: string, code: string): Promise<{
    success: boolean;
    donorData?: {
      firstName: string;
      lastName: string;
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
          firstName: 'אילון',
          lastName: 'זילבר',
          phone: phone,
          idNumber: '',
          email: 'ayalon@example.com'
        }
      };
    }
    
    return { success: false };
  }
};