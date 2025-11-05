אפליקציית תרומות כתובה בreact-native


# אפליקציית תרומות

## דרישות מקדימות
- Node.js (גרסה 16 ומעלה)
- npm 
- Expo CLI
- סביבת פיתוח לאפליקציות מובייל (Android Studio ל-Android או Xcode ל-iOS)

## התקנה

### שלב 1: שכפול (Clone) של הפרויקט
```bash
git clone https://github.com/moriatak/donation-app.git
cd donation-app
```

### שלב 2: התקנת התלויות (Dependencies)
```bash
npm install
```

### שלב 3: הגדרות סביבה
יש לוודא שכל קבצי התצורה מוגדרים כראוי לפני הפעלת האפליקציה.

## הרצת האפליקציה

### פיתוח מקומי
```bash
# הפעלת שרת הפיתוח של Expo
 npx expo start 
```

לאחר הפעלת השרת, תוכל/י לבחור להריץ את האפליקציה ב:
- אמולטור Android
- סימולטור iOS
- מכשיר פיזי באמצעות אפליקציית Expo Go

#### בדיקת תאימות
לאחר הגדרת כל קבצי התצורה, הריצו את הפקודה הבאה לבדיקת תאימות:
```bash
npx expo doctor
```
פקודה זו תאתר בעיות נפוצות בהגדרות האפליקציה שלכם.

### בניית (Build) האפליקציה בפעם הראשונה
```bash
npm install -g eas-cli
```
```bash
eas login
```
שם משתמש: ayalon
סיסמה: ayalon123
```bash
eas build:configure
npx expo install expo-dev-client
```

#### עבור Android
```bash
eas build -p android
```

#### עבור iOS
```bash
eas build -p ios
```

## מבנה הפרויקט
- `app/` - קבצי המסכים והרכיבים העיקריים של האפליקציה
  - `_layout.tsx` - הגדרות ה-layout הכלליות
  - `index.tsx` - מסך הבית
  - `bit-payment.tsx` - מסך עיבוד תשלומים
  - `confirmation.tsx` - מסך אישור התרומה
  - `processing.tsx` - מסך עיבוד התהליך
- `services/` - שירותים ו-API
  - `api.tsx` - פונקציות לתקשורת עם השרת
- `config/` - קבצי תצורה
  - `mockConfig.tsx` - תצורה לסביבת בדיקות

## גיבוי והעלאה ל-Git
בפרויקט זה אנחנו מעלים לגיט את כל קבצי המקור, קבצי תצורה חיוניים וקבצי התיעוד.

קבצים שאינם מועלים (מוגדרים ב-gitignore):
- תיקיית `node_modules`
- קבצי בנייה (.apk, .aab, .ipa)
- קבצי סביבה אישיים (.env)
- קבצי מערכת (.DS_Store)

## המרת קובץ AAB לקובץ APK

מדריך פשוט להמרת קבצי Android App Bundle (AAB) לקבצי Android Application Package (APK) באמצעות Bundletool.

### צעד 1: הורדת Bundletool

1. גש לדף ההורדות הרשמי של Bundletool בגיטהאב: https://github.com/google/bundletool/releases
2. בדף זה תראה רשימה של גרסאות. חפש את הגרסה האחרונה (מסומנת כ-"Latest").
3. תחת הגרסה האחרונה, יש אזור שנקרא "Assets". לחץ על הקובץ שנקרא בדרך כלל משהו כמו `bundletool-all-1.18.2.jar` (המספר עשוי להשתנות בהתאם לגרסה העדכנית).
4. הקובץ יתחיל להוריד למחשב שלך. שים לב היכן הוא נשמר (בדרך כלל בתיקיית ההורדות).
5. מומלץ לשמור את הקובץ במיקום שתוכל לזכור ולגשת אליו בקלות, למשל צור תיקייה חדשה בשם "bundletool" על שולחן העבודה או במיקום נוח אחר, והעבר לשם את הקובץ.

### צעד 2: הכנת הקבצים והתיקיות

1. ודא שקובץ ה-AAB שאתה רוצה להמיר נמצא במיקום נגיש
2. ודא שקובץ ה-Bundletool שהורדת (הקובץ .jar) נמצא גם הוא במיקום נגיש
3. רצוי ליצור תיקייה מיוחדת עבור הפלט (APK שייווצר)

### צעד 3: פתיחת חלון פקודה (Command Prompt / Terminal)

1. פתח את חלון הפקודה במחשב
2. נווט לתיקייה בה שמרת את Bundletool

### צעד 4: הפעלת פקודת ההמרה

הפעל את הפקודה הבאה להמרת קובץ ה-AAB ל-APK:

```bash
java -jar bundletool-all-[גרסה].jar build-apks --bundle=[נתיב_לקובץ_AAB]/app.aab --output=[נתיב_יעד]/app.apks --mode=universal --ks=[נתיב_לקובץ_keystore] --ks-pass=pass:[סיסמה] --ks-key-alias=[שם_המפתח] --key-pass=pass:[סיסמת_המפתח]
```

### דוגמה לפקודה:

```bash
java -jar bundletool-all-1.18.2.jar build-apks --bundle=application-8a0119e8-2afe-40b2-b4d1-57be0a7875ac.aab --output=donation-app/tryapk/app.apks --mode=universal --ks=/Users/elireu/Documents/projects/donation-app/android/app/debug.keystore --ks-pass=pass:android --ks-key-alias=androiddebugkey --key-pass=pass:android
```

## צעד 5: חילוץ קובץ APK

לאחר הרצת הפקודה, ייווצר קובץ `.apks`. זהו למעשה קובץ ZIP שמכיל את ה-APK. ניתן לשנות את הסיומת ל-`.zip` ולחלץ את קובץ ה-APK מתוכו, או להשתמש בפקודה הבאה:

```bash
java -jar bundletool-all-[גרסה].jar extract-apks --apks=[נתיב_לקובץ]/app.apks --output-dir=[תיקיית_יעד]
```

## הערות

- אם אתה משתמש במפתח דיבאג (debug keystore) של אנדרואיד, סיסמת ברירת המחדל היא בדרך כלל `android` והאליאס הוא `androiddebugkey`.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
