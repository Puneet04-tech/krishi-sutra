'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'hi' | 'pa' | 'bn' | 'te' | 'mr' | 'gu' | 'ta' | 'kn' | 'ml'

interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    pa: 'ਡੈਸ਼ਬੋਰਡ',
    bn: 'ড্যাশবোর্ড',
    te: 'డ్యాష్‌బోర్డ్',
    mr: 'डॅशबोर्ड',
    gu: 'ડેશબોર્ડ',
    ta: 'டாஷ்போர்டு',
    kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    ml: 'ഡാഷ്ബോർഡ്'
  },
  'nav.supplyChain': {
    en: 'Supply Chain',
    hi: 'आपूर्ति श्रृंखला',
    pa: 'ਸਪਲਾਈ ਚੇਨ',
    bn: 'সরবরাহ শৃঙ্খলা',
    te: 'సప్లై చైన్',
    mr: 'पुरवठा साखळी',
    gu: 'સપ્લાય ચેન',
    ta: 'சப்ளை செயின்',
    kn: 'ಸಪ್ಲೈ ಚೈನ್',
    ml: 'സപ്ലൈ ചെയിൻ'
  },
  'nav.marketplace': {
    en: 'Marketplace',
    hi: 'बाज़ार',
    pa: 'ਮਾਰਕੀਟ',
    bn: 'মার্কেটপ্লেস',
    te: 'మార్కెట్‌ప్లేస్',
    mr: 'मार्केटप्लेस',
    gu: 'માર્કેટપ્લેસ',
    ta: 'மார்க்கெட்பிளேஸ்',
    kn: 'ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್',
    ml: 'മാർക്കറ്റ്പ്ലേസ്'
  },
  'nav.loans': {
    en: 'Loans',
    hi: 'ऋण',
    pa: 'ਕਰਜ਼ੇ',
    bn: 'ঋণ',
    te: 'ఋణాలు',
    mr: 'कर्जे',
    gu: 'લોન્સ',
    ta: 'கடன்கள்',
    kn: 'ಸಾಲಗಳು',
    ml: 'വായ്പകൾ'
  },
  'nav.insurance': {
    en: 'Insurance',
    hi: 'बीमा',
    pa: 'ਬੀਮਾ',
    bn: 'বীমা',
    te: 'బీమా',
    mr: 'विमा',
    gu: 'વીમો',
    ta: 'காப்பீடு',
    kn: 'ವಿಮೆ',
    ml: 'ഇൻഷുറൻസ്'
  },
  
  // Dashboard
  'dashboard.welcome': {
    en: 'Welcome to KrishiSutra',
    hi: 'कृषिसूत्र में आपका स्वागत है',
    pa: 'ਕ੍ਰਿਸ਼ੀਸੂਤਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ',
    bn: 'কৃষিসূত্রে আপনাকে স্বাগতম',
    te: 'క్రిషిసూత్రకు స్వాగతం',
    mr: 'कृषिसूत्रात आपले स्वागत आहे',
    gu: 'કૃષિસૂત્રમાં આપનું સ્વાગત છે',
    ta: 'கிருஷிசூத்திரத்திற்கு வரவேற்கிறோம்',
    kn: 'ಕೃಷಿಸೂತ್ರಕ್ಕೆ ಸ್ವಾಗತ',
    ml: 'കൃഷിസൂത്രത്തിലേക്ക് സ്വാഗതം'
  },
  'dashboard.subtitle': {
    en: 'Empowering farmers with blockchain-verified financing, transparent supply chains, and sustainable agriculture solutions',
    hi: 'ब्लॉकचेन-सत्यापित वित्तपोषण, पारदर्शी आपूर्ति श्रृंखला और टिकाऊ कृषि समाधानों के साथ किसानों को सशक्त बनाना',
    pa: 'ਬਲੌਕਚੇਨ-ਤਸਦੀਕ ਵਿੱਤ, ਪਾਰਦਰਸ਼ੀ ਸਪਲਾਈ ਚੇਨ ਅਤੇ ਟਿਕਾਊ ਖੇਤੀ ਹੱਲਾਂ ਨਾਲ ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ',
    bn: 'ব্লকচেন-যাচাইকৃত অর্থায়ন, স্বচ্ছ সরবরাহ শৃঙ্খলা এবং টেকসই কৃষি সমাধানের মাধ্যমে কৃষকদের ক্ষমতায়িত করা',
    te: 'బ్లాక్‌చెయిన్-ధృవీకరించబడిన ఫైనాన్సింగ్, పారదర్శక సప్లై చైన్ మరియు టేకబుల్ వ్యవసాయ పరిష్కారాలతో రైతులను సాధికారపరచడం',
    mr: 'ब्लॉकचेन-सत्यापित वित्तपुरवठा, पारदर्शी पुरवठा साखळी आणि शाश्वत शेती उपायांसह शेतकऱ्यांना सशक्त करणे',
    gu: 'બ્લોકચેન-ચકાસાયેલ નાણાકીય મદદ, પારદર્શક સપ્લાય ચેન અને ટકાઉ ખેતી ઉકેલો સાથે ખેડૂતોને સશક્તિકરણ કરવું',
    ta: 'பிளாக்செயின்-சரிபார்க்கப்பட்ட நிதியுதவி, வெளிப்படையான வழங்கல் சங்கிலி மற்றும் நிலையான வேளாண்மை தீர்வுகளுடன் விவசாயிகளை ஶக்திப்படுத்துதல்',
    kn: 'ಬ್ಲಾಕ್‌ಚೈನ್-ಪರಿಶೀಲಿಸಿದ ಹಣಕಾಸು, ಪಾರದರ್ಶಕ ಪೂರೈಕೆ ಸರಪಳಿ ಮತ್ತು ಸುಸ್ಥಿರ ಕೃಷಿ ಪರಿಹಾರಗಳೊಂದಿಗೆ ರೈತರನ್ನು ಸಬಲಗೊಳಿಸುವುದು',
    ml: 'ബ്ലോക്ക്ചെയിൻ-സ്ഥിരീകരിച്ച ധനസഹായം, സുതാര്യമായ സപ്ലൈ ചെയിൻ, പരിസ്ഥിതിക്കനുകൂലമായ കൃഷി പരിഹാരങ്ങൾ എന്നിവയിലൂടെ കർഷകരെ ശക്തിപ്പെടുത്തുക'
  },
  
  // Actions
  'action.scanQR': {
    en: 'Scan QR',
    hi: 'QR स्कैन करें',
    pa: 'QR ਸਕੈਨ ਕਰੋ',
    bn: 'QR স্ক্যান করুন',
    te: 'QR స్కాన్ చేయండి',
    mr: 'QR स्कॅन करा',
    gu: 'QR સ્કેન કરો',
    ta: 'QR ஸ்கேன் செய்யுங்கள்',
    kn: 'QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    ml: 'QR സ്കാൻ ചെയ്യുക'
  },
  'action.getLoan': {
    en: 'Get Loan',
    hi: 'ऋण प्राप्त करें',
    pa: 'ਕਰਜ਼ਾ ਪ੍ਰਾਪਤ ਕਰੋ',
    bn: 'ঋণ নিন',
    te: 'ఋణం పొందండి',
    mr: 'कर्ज घ्या',
    gu: 'લોન મેળવો',
    ta: 'கடன் பெறுங்கள்',
    kn: 'ಸಾಲ ಪಡೆಯಿರಿ',
    ml: 'വായ്പ നേടുക'
  },
  'action.market': {
    en: 'Market',
    hi: 'बाज़ार',
    pa: 'ਮਾਰਕੀਟ',
    bn: 'বাজার',
    te: 'మార్కెట్',
    mr: 'बाजार',
    gu: 'માર્કેટ',
    ta: 'சந்தை',
    kn: 'ಮಾರುಕಟ್ಟೆ',
    ml: 'മാർക്കറ്റ്'
  },
  'action.insurance': {
    en: 'Insurance',
    hi: 'बीमा',
    pa: 'ਬੀਮਾ',
    bn: 'বীমা',
    te: 'బీమా',
    mr: 'विमा',
    gu: 'વીમો',
    ta: 'காப்பீடு',
    kn: 'ವಿಮೆ',
    ml: 'ഇൻഷുറൻസ്'
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Check for saved language preference or default to browser language
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['en', 'hi', 'pa', 'bn', 'te', 'mr', 'gu', 'ta', 'kn', 'ml'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language
      if (['en', 'hi', 'pa', 'bn', 'te', 'mr', 'gu', 'ta', 'kn', 'ml'].includes(browserLang)) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
