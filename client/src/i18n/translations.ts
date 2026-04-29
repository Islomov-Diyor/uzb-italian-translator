export type Lang = 'en' | 'uz' | 'it'

export const translations = {
  // Auth
  login: { en: 'Login', uz: 'Kirish', it: 'Accedi' },
  signup: { en: 'Sign Up', uz: "Ro'yxatdan o'tish", it: 'Registrati' },
  email: { en: 'Email', uz: 'Elektron pochta', it: 'Email' },
  password: { en: 'Password', uz: 'Parol', it: 'Password' },
  noAccount: { en: "Don't have an account?", uz: "Hisobingiz yo'qmi?", it: 'Non hai un account?' },
  hasAccount: { en: 'Already have an account?', uz: 'Hisobingiz bormi?', it: 'Hai già un account?' },
  loginError: { en: 'Invalid email or password', uz: "Noto'g'ri email yoki parol", it: 'Email o password non validi' },
  signupError: { en: 'Email already in use', uz: 'Bu email allaqachon ishlatilmoqda', it: 'Email già in uso' },
  fieldRequired: { en: 'All fields are required', uz: "Barcha maydonlar to'ldirilishi shart", it: 'Tutti i campi sono obbligatori' },
  loginSuccess: { en: 'Welcome back!', uz: 'Xush kelibsiz!', it: 'Bentornato!' },
  signupSuccess: { en: 'Account created!', uz: 'Hisob yaratildi!', it: 'Account creato!' },
  logout: { en: 'Logout', uz: 'Chiqish', it: 'Esci' },

  // Translator
  translate: { en: 'Translate', uz: 'Tarjima qilish', it: 'Traduci' },
  translating: { en: 'Translating...', uz: 'Tarjima qilinmoqda...', it: 'Traduzione in corso...' },
  sourceText: { en: 'Enter text...', uz: 'Matn kiriting...', it: 'Inserisci testo...' },
  translation: { en: 'Translation', uz: 'Tarjima', it: 'Traduzione' },
  words: { en: 'words', uz: "so'z", it: 'parole' },
  copied: { en: 'Copied!', uz: 'Nusxalandi!', it: 'Copiato!' },
  copy: { en: 'Copy', uz: 'Nusxalash', it: 'Copia' },
  uploadFile: { en: 'Upload .txt file', uz: '.txt fayl yuklash', it: 'Carica file .txt' },
  downloadTranslation: { en: 'Download translation', uz: "Tarjimani yuklab olish", it: 'Scarica traduzione' },
  translatingFile: { en: 'Translating file...', uz: 'Fayl tarjima qilinmoqda...', it: 'Traduzione file...' },
  fileError: { en: 'File translation failed', uz: "Fayl tarjima qilishda xatolik", it: 'Traduzione file fallita' },
  translateError: { en: 'Translation failed. Try again.', uz: "Tarjima xatosi. Qayta urinib ko'ring.", it: 'Traduzione fallita. Riprova.' },
  networkError: { en: 'Network error. Check your connection.', uz: "Tarmoq xatosi. Aloqani tekshiring.", it: 'Errore di rete. Controlla la connessione.' },

  // History
  history: { en: 'History', uz: 'Tarix', it: 'Cronologia' },
  noHistory: { en: 'No translations yet', uz: "Hali tarjimalar yo'q", it: 'Nessuna traduzione ancora' },

  // Navbar
  appName: { en: 'Uz ↔ It', uz: "O'z ↔ It", it: 'Uz ↔ It' },
} as const

export type TranslationKey = keyof typeof translations
