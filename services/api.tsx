import { SynagogueConfig } from "@/config/mockConfig";

const API_KEY = "a12y45bC4@1&&lo9OpC";
const DONATION_API_ENDPOINT = "https://tak.co.il/donation_app/index.php";
const GETSETTINGS_API_ENDPOINT = "https://tak.co.il/campaignServer/api/getSettings";

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

export interface SettingsResponse {
  success: boolean;
  settings?: {
    companyId: string;
    compToken: string;
    compId: string;
    logo: string;
    donationAppName: string;
    bitOption: boolean;
    paxShopOpt: boolean;
    terminalName: string
    items: Array<object>;
  };
  message?: string;
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
    config: SynagogueConfig,
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
        token: config.settings.tokenApi,
        apiToken: config.settings.tokenApi,
        companyId: config.settings.companyId,
        // token: config.settings.copmainingToken,
        parentName: config.settings.terminalName,
        parentId: config.settings.copmainingToken,
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
              itemId: '192', // תקציבית
              // itemId: '3', // גדרה
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
          case 'credit_card':
            if (result.shvaCode && result.shvaCode.startsWith('000')) {
              console.log('התשלום אושר!');
              console.log('קוד אישור:', result.shvaCode);
              
              return { 
                success: true, 
                transactionId: result.transactionId || ('TRX' + Date.now()), 
                status: 'completed',
                shvaCode: result.shvaCode,
                idDoc: result.idDoc
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

// ✅ עדכון DonorAPI להתחבר לשרת האמיתי
export const DonorAPI = {
  // משיכת הגדרות המערכת
  getSettings: async (apiToken: string): Promise<SettingsResponse> => {
    try {
      // apiToken = 'zr_54321zyxwv'

      // הדפסת הבקשה ללוג לפני שליחה
      console.log('======== GET SETTINGS REQUEST ========');
      console.log('URL:', GETSETTINGS_API_ENDPOINT);
      console.log('METHOD: POST');
      console.log('body: { apiKey: ****, api_token:', apiToken, '}');
      console.log('======================================');
      const data = {
        apiKey: API_KEY,
        api_token: apiToken
      }
      const response = await fetch(GETSETTINGS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // הדפסת התשובה שהתקבלה
        console.log('======== GET SETTINGS RESPONSE ========');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('=======================================');

        // השרת מחזיר ישירות את האובייקט עם הנתונים
        if (responseData.IndexData.IdCompany && responseData.IndexData.TokenUrl) {
          return {
            success: true,
            settings: {
              companyId: responseData.IndexData.IdCompany,
              compToken: responseData.IndexData.TokenUrl,
              compId: responseData.IndexData.Id,
              logo: responseData.DisplayData.LogoUrl,
              donationAppName: responseData.DisplayData.Name,
              bitOption: true,
              paxShopOpt: !!responseData.IndexData.nameTerminal,
              terminalName: responseData.IndexData.nameTerminal,
              items: responseData.PageItems
            }
          };
        } else {
          return {
            success: false,
            message: 'לא נמצאו הגדרות למערכת'
          };
        }
      } else {
        return {
          success: false,
          message: 'אירעה שגיאה בתקשורת עם השרת'
        };
      }
    } catch (error) {
      console.log('Error getting settings:', error);
      return {
        success: false,
        message: 'אירעה שגיאה בטעינת הגדרות המערכת'
      };
    }
  },

  // שליחת קוד אימות
  sendVerificationCode: async (config: SynagogueConfig, phone: string, isGabbayEntry: boolean = false): Promise<{ 
    success: boolean; 
    sessionId?: string;
    message?: string;
  }> => {
    try {
      const parameters = new FormData();
      
      parameters.append('apiKey', API_KEY);
      parameters.append('phone', phone);
      parameters.append('companyId', config.settings.companyId);
      parameters.append('compToken', config.settings.copmainingToken);
      if(isGabbayEntry){
        parameters.append('gabbay_entry_by_phone', 'true');
      } else {
        parameters.append('user_and_phone', 'true');
      }
      // הדפסת הבקשה ללוג לפני שליחה
      console.log('======== LOGIN REQUEST ========');
      console.log('URL: ',DONATION_API_ENDPOINT);
      console.log('METHOD: POST');
      console.log('HEADERS: Content-Type: application/json');
      console.log('BODY:', JSON.stringify(parameters, null, 2));
      console.log('================================');

      const response = await fetch(DONATION_API_ENDPOINT, {
        method: 'POST',
        body: parameters,
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // הדפסת התשובה שהתקבלה
        console.log('======== LOGIN RESPONSE ========');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('=================================');

        if (responseData.success === true) {
          return {
            success: true,
            sessionId: responseData.sessionId
          };
        } else {
          return {
            success: false,
            message: responseData.message || 'פלאפון לא מזוהה במערכת'
          };
        }
      } else {
        return {
          success: false,
          message: 'אירעה שגיאה בתקשורת עם השרת'
        };
      }
    } catch (error) {
      console.log('Error sending verification code:', error);
      return {
        success: false,
        message: 'אירעה שגיאה בזיהוי התורם או בשליחת הקוד'
      };
    }
  },
  
  // אימות קוד
  verifyCode: async (
    config: SynagogueConfig,
    phone: string, 
    code: string, 
    sessionId: string,
    isGabbayEntry: boolean = false
  ): Promise<{
    success: boolean;
    donorData?: {
      firstName: string;
      lastName: string;
      phone: string;
      idNumber: string;
      email: string;
    };
    message?: string;
  }> => {
    try {
      const parameters = new FormData();
      parameters.append('verify_code', code);
      parameters.append('apiKey', API_KEY);
      parameters.append('phone', phone);
      parameters.append('sessionId', sessionId);
      parameters.append('companyId', config.settings.companyId);
      if(isGabbayEntry){
        parameters.append('is_gabbay_code', 'true');
      }
        // הדפסת הבקשה ללוג לפני שליחה
        console.log('======== LOGIN REQUEST ========');
        console.log('URL: ',DONATION_API_ENDPOINT);
        console.log('METHOD: POST');
        console.log('HEADERS: Content-Type: application/json');
        console.log('BODY:', JSON.stringify(parameters, null, 2));
        console.log('================================');

      const response = await fetch(DONATION_API_ENDPOINT, {
        method: 'POST',
        body: parameters,
      });

      if (response.ok) {
        const responseData = await response.json();

         // הדפסת התשובה שהתקבלה
         console.log('======== LOGIN RESPONSE ========');
         console.log(JSON.stringify(responseData, null, 2));
         console.log('=================================');
        
        if (responseData.success === true) {
          // השרת מחזיר את פרטי המשתמש מטבלת appc_contact
          const userData = responseData.message;
          
          return {
            success: true,
            donorData: {
              firstName: userData.FirstName || '',
              lastName: userData.LastName || '',
              phone: userData.Phone || phone,
              idNumber: userData.IdNumber || '',
              email: userData.Email || ''
            }
          };
        } else {
          return {
            success: false,
            message: responseData.message || 'קוד אינו תקין'
          };
        }
      } else {
        return {
          success: false,
          message: 'אירעה שגיאה בתקשורת עם השרת'
        };
      }
    } catch (error) {
      console.log('Error verifying code:', error);
      return {
        success: false,
        message: 'אירעה שגיאה באימות הקוד'
      };
    }
  }
};