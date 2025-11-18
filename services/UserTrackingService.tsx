import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';

// ממשק לתיאור נתוני המעקב
interface UserTrackingData {
  device_id: string;
  device_type: string;
  app_version?: string;
  last_login_date: string;
  is_active: boolean;
  is_logged?: boolean;
  session_duration?: number;
  companyId?: string;
  tokenApi?: string;
  last_action?: string;
  last_action_date?: string;
}

// ממשק לתגובת השרת
interface ServerResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class UserTrackingService {
  private static API_URL: string = 'https://tak.co.il/campaignServer';
  private static sessionStartTime: Date | null = null;
  
  /**
   * מקבל או יוצר מזהה מכשיר קבוע
   * @returns Promise עם מזהה המכשיר
   */
  public static async getDeviceId(): Promise<string> {
    try {
      const deviceId = await AsyncStorage.getItem('device_id');
      
      if (!deviceId) {
        const newDeviceId = uuid.v4().toString();
        await AsyncStorage.setItem('device_id', newDeviceId);
        return newDeviceId;
      }
      
      return deviceId;
    } catch (error) {
      console.error('שגיאה בקבלת מזהה מכשיר:', error);
      return uuid.v4().toString(); // אם יש שגיאה בכל זאת נחזיר מזהה חדש
    }
  }
  
  /**
   * שליחת בקשה לשרת
   * @param endpoint - נקודת הקצה ב-API
   * @param data - הנתונים לשליחה
   * @returns Promise עם תשובת השרת
   */
  private static async sendRequest(endpoint: string, data: any): Promise<ServerResponse> {
    try {
      const response = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`שגיאה בשליחת בקשה ל-${endpoint}:`, error);
      return { success: false, message: 'שגיאת תקשורת עם השרת' };
    }
  }
  
  /**
   * מתחיל מעקב - יש לקרוא לפונקציה זו בהפעלת האפליקציה
   * @returns Promise עם תוצאת האתחול
   */
  public static async initTracking(): Promise<ServerResponse> {
    try {
      const deviceId = await this.getDeviceId();
      const deviceType = Platform.OS;
    //   const appVersion = DeviceInfo.getVersion();
      const trackingData: UserTrackingData = {
        device_id: deviceId,
        device_type: deviceType,
        // app_version: appVersion,
        last_login_date: new Date().toISOString(),
        is_active: true
      };
      
      const response = await this.sendRequest('/user-tracking', trackingData);
      
      // שומר את זמן תחילת הסשן
      this.sessionStartTime = new Date();
      
      return response;
    } catch (error) {
      console.error('שגיאה באתחול מעקב משתמש:', error);
      return { success: false, message: 'שגיאה באתחול מעקב משתמש' };
    }
  }
  
  /**
   * מעדכן את זמן השימוש בסיום סשן
   * @returns Promise עם תוצאת העדכון
   */
  public static async endSession(): Promise<ServerResponse | null> {
    if (!this.sessionStartTime) return null;
    
    try {
      const deviceId = await this.getDeviceId();
      const sessionDuration = Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000); // בשניות
      
      const trackingData: UserTrackingData = {
        device_id: deviceId,
        device_type: Platform.OS,
        // app_version: DeviceInfo.getVersion(),
        last_login_date: new Date().toISOString(),
        is_active: false,
        session_duration: sessionDuration
      };
      // הדפסת הבקשה ללוג לפני שליחה
      // console.log('======== PAYMENT REQUEST ========');
      // console.log('URL: https://tak.co.il///user-tracking/session-end');
      // console.log('METHOD: POST');
      // console.log('HEADERS: Content-Type: application/json');
      // console.log('BODY:', JSON.stringify(trackingData, null, 2));
      // console.log('================================');

      const response = await this.sendRequest('/user-tracking/session-end', trackingData);
      
      this.sessionStartTime = null;
      
      return response;
    } catch (error) {
      console.error('שגיאה בסיום סשן:', error);
      return { success: false, message: 'שגיאה בסיום סשן' };
    }
  }
  
  /**
   * מעקב אחר פעולות משתמש (למשל מעבר למסך מסוים)
   * @param companyId -  
   * @param actionType - סוג הפעולה
   * @returns Promise עם תוצאת העדכון
   */
  public static async trackAction(companyId: string, tokenApi: string, actionType: string): Promise<ServerResponse> {
    try {
      const deviceId = await this.getDeviceId();
      
      const trackingData: UserTrackingData = {
        device_id: deviceId,
        device_type: Platform.OS,
        // app_version: DeviceInfo.getVersion(),
        last_login_date: new Date().toISOString(),
        is_active: true,
        is_logged: actionType == 'logout' ? false : true,
        companyId: companyId,
        tokenApi: tokenApi ,
        last_action: actionType,
        last_action_date: new Date().toISOString()
      };
      
      return await this.sendRequest('/user-tracking/action', trackingData);
    } catch (error) {
      console.error('שגיאה במעקב אחר פעולה:', error);
      return { success: false, message: 'שגיאה במעקב אחר פעולה' };
    }
  }
  
  /**
 * בודק אם יש דרישה לניתוק מרוחק של המכשיר
 * @returns Promise עם אובייקט שמציין אם צריך להתנתק והסיבה
 */
public static async checkForceLogout(): Promise<{
  shouldLogout: boolean;
  reason?: string;
}> {
  try {
    const deviceId = await this.getDeviceId();
    
    const response = await this.sendRequest('/user-tracking/check-logout', {
      device_id: deviceId,
      device_type: Platform.OS
    });
    
    if (response.success && response.data) {
      return {
        shouldLogout: response.data.forceLogout || false,
        reason: response.data.forceLogoutReason
      };
    }
    
    return { shouldLogout: false };
  } catch (error) {
    console.error('שגיאה בבדיקת ניתוק מרוחק:', error);
    return { shouldLogout: false };
  }
}

private static logoutCheckInterval: NodeJS.Timeout | null | number = null;

/**
 * מתחיל מעקב תקופתי אחר דרישות ניתוק
 * @param intervalMs - מרווח הבדיקה במילישניות (ברירת מחדל: 30 שניות)
 * @param onForceLogout - callback שיופעל כאשר נדרש ניתוק
 */
public static startLogoutMonitoring(
  onForceLogout: (reason?: string) => void,
  intervalMs: number = 30000
): void {
  // עצירת מעקב קודם אם קיים
  this.stopLogoutMonitoring();
  
  this.logoutCheckInterval = setInterval(async () => {
    const logoutStatus = await this.checkForceLogout();
    
    if (logoutStatus.shouldLogout) {
      console.log('התקבלה דרישה לניתוק מרוחק:', logoutStatus.reason);
      this.stopLogoutMonitoring();
      onForceLogout(logoutStatus.reason);
    }
  }, intervalMs);
}

/**
 * עוצר את המעקב התקופתי אחר דרישות ניתוק
 */
public static stopLogoutMonitoring(): void {
  if (this.logoutCheckInterval) {
    clearInterval(this.logoutCheckInterval);
    this.logoutCheckInterval = null;
  }
}

  /**
   * חישוב זמן הסשן הנוכחי בשניות
   * @returns משך הסשן הנוכחי בשניות או 0 אם אין סשן פעיל
   */
  public static getCurrentSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    
    return Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000);
  }
}

export default UserTrackingService;