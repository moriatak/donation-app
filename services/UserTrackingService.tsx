import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';

// ממשק לתיאור נתוני המעקב
interface UserTrackingData {
  device_id: string;
  device_type: string;
  device_name: string | null;
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

// ממשק לבדיקת סטטוס מכשיר (logout + גרסה)
interface DeviceStatusResponse {
  shouldLogout: boolean;
  logoutReason?: string;
  updateRequired: boolean;
  forceUpdate: boolean;
  minimumVersion?: string;
  currentVersion?: string;
  updateMessage?: string;
  dismissalCount?: number;
  updateUrlIos?: string;
  updateUrlAndroid?: string;
}

class UserTrackingService {
  private static API_URL: string = 'https://tak.co.il/campaignServer';
  private static sessionStartTime: Date | null = null;
  
  /**
   * מחזיר את גרסת האפליקציה
   * @returns גרסת האפליקציה
   */
  private static getAppVersion(): string {
    return Constants.expoConfig?.version || '1.0.0';
  }

  /**
   * מחזיר את גרסת האפליקציה
   * @returns גרסת האפליקציה
   */
  private static getBuildNumber(): string {
    return Platform.select({
      ios: Constants.expoConfig?.ios?.buildNumber || '1',
      android: Constants.expoConfig?.android?.versionCode?.toString() || '1',
    }) || '1';
  }
  /**
   * מחזיר את גרסת האפליקציה
   * @returns גרסת האפליקציה
   */
  private static getDeviceInfo(): any {
    return {
      appVersion: this.getAppVersion(),
      buildNumber: this.getBuildNumber(),
      platform: Platform.OS,
      deviceName: Device.modelName,
      deviceId: Device.osBuildId,
    };
  }

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

      const deviceInfo = this.getDeviceInfo();
      const deviceId = await this.getDeviceId();
      const deviceType = Platform.OS;
      const trackingData: UserTrackingData = {
        device_id: deviceId,
        device_type: deviceType,
        device_name: Device.modelName,
        app_version: this.getAppVersion(),
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
        app_version: this.getAppVersion(),
        device_name: Device.modelName,
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
        device_name: Device.modelName,
        app_version: this.getAppVersion(),
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
 * בודק סטטוס המכשיר - ניתוק מרוחק ועדכון גרסה
 * @returns Promise עם סטטוס מלא של המכשיר
 */
public static async checkDeviceStatus(): Promise<DeviceStatusResponse> {
  try {
    const deviceId = await this.getDeviceId();
    const currentVersion = this.getAppVersion();
    
    // בדיקה האם עברו 24 שעות מהבדיקה האחרונה
    // const lastCheck = await AsyncStorage.getItem('last_version_check');
    const now = new Date().getTime();
    
    // if (lastCheck) {
    //   const timeDiff = now - parseInt(lastCheck);
    //   const hoursPassed = timeDiff / (1000 * 60 * 60);
      
    //   // אם לא עברו 24 שעות, החזר תשובה ריקה
    //   if (hoursPassed < 24) {
    //     return {
    //       shouldLogout: false,
    //       updateRequired: false,
    //       forceUpdate: false
    //     };
    //   }
    // }
    // הדפסת הבקשה ללוג לפני שליחה
      // console.log('======== GET check status REQUEST ========');
      // console.log('URL: /user-tracking/check-device-status');
      // console.log('METHOD: POST');
      // console.log('body: { device_type: ios, device_id:', deviceId, ', app_version: ',currentVersion,'}');
      // console.log('======================================');

    const response = await this.sendRequest('/user-tracking/check-device-status', {
      device_id: deviceId,
      device_type: Platform.OS,
      app_version: currentVersion
    });
     // הדפסת התשובה שהתקבלה
    //  console.log('======== GET check status RESPONSE ========');
    //  console.log(JSON.stringify(response, null, 2));
    //  console.log('=======================================');
    
    // שמירת זמן הבדיקה
    // await AsyncStorage.setItem('last_version_check', now.toString());
    
    if (response.success && response.data) {
      return {
        shouldLogout: response.data.forceLogout || false,
        logoutReason: response.data.forceLogoutReason,
        updateRequired: response.data.updateRequired || false,
        forceUpdate: response.data.forceUpdate || false,
        minimumVersion: response.data.minimumVersion,
        currentVersion: response.data.currentVersion,
        updateMessage: response.data.updateMessage,
        updateUrlIos: response.data.updateUrlIos,
        updateUrlAndroid: response.data.updateUrlAndroid
      };
    }
    
    return {
      shouldLogout: false,
      updateRequired: false,
      forceUpdate: false
    };
  } catch (error) {
    console.error('שגיאה בבדיקת סטטוס מכשיר:', error);
    return {
      shouldLogout: false,
      updateRequired: false,
      forceUpdate: false
    };
  }
}

/**
 * עדכון מספר הדחיות של עדכון גרסה
 */
public static async incrementUpdateDismissal(): Promise<void> {
  try {
    const deviceId = await this.getDeviceId();
    await this.sendRequest('/user-tracking/dismiss-update', {
      device_id: deviceId
    });
  } catch (error) {
    console.error('שגיאה בעדכון דחיות:', error);
  }
}

private static logoutCheckInterval: NodeJS.Timeout | null | number = null;

/**
 * מתחיל מעקב תקופתי אחר דרישות ניתוק ועדכון גרסה
 * @param onForceLogout - callback שיופעל כאשר נדרש ניתוק
 * @param onUpdateRequired - callback שיופעל כאשר נדרש עדכון גרסה
 * @param intervalMs - מרווח הבדיקה במילישניות (ברירת מחדל: 30 שניות)
 */
public static startDeviceMonitoring(
  onForceLogout: (reason?: string) => void,
  onUpdateRequired: (updateInfo: DeviceStatusResponse) => void,
  intervalMs: number = 30000
): void {
  this.stopLogoutMonitoring();
  
  this.logoutCheckInterval = setInterval(async () => {
    const deviceStatus = await this.checkDeviceStatus();
    
    // בדיקת ניתוק מרוחק
    if (deviceStatus.shouldLogout) {
      console.log('התקבלה דרישה לניתוק מרוחק:', deviceStatus.logoutReason);
      this.stopLogoutMonitoring();
      onForceLogout(deviceStatus.logoutReason);
      return;
    }
    
    // בדיקת עדכון גרסה
    if (deviceStatus.updateRequired) {
      console.log('נדרש עדכון גרסה:', deviceStatus.updateMessage);
      onUpdateRequired(deviceStatus);
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