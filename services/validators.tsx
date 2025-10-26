export const Validators = {
  firstName: (name: string): string => {
    if (!name) return 'נדרש שם פרטי';
    if (name.length < 2) return 'שם חייב להכיל לפחות 2 תווים';
    return '';
  },
  
  lastName: (name: string): string => {
    if (!name) return 'נדרש שם משפחה';
    if (name.length < 2) return 'שם חייב להכיל לפחות 2 תווים';
    return '';
  },
  
  phone: (phone: string): string => {
    if (!phone) return 'נדרש מספר טלפון';
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (!/^05\d{8}$/.test(cleaned)) return 'מספר טלפון לא תקין';
    return '';
  },
  
  israeliId: (id: string): string => {
    if (!id) return '';
    if (!/^\d{9}$/.test(id)) return 'מספר זהות לא תקין';
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = Number(id[i]) * ((i % 2) + 1);
      sum += digit > 9 ? digit - 9 : digit;
    }
    return sum % 10 === 0 ? '' : 'מספר זהות לא תקין';
  },
  
  email: (email: string): string => {
    if (!email) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'כתובת אימייל לא תקינה';
    }
    return '';
  }
};