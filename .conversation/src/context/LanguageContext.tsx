'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDict, translations } from '@/lib/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'darija_latin',
  setLanguage: () => {},
  t: translations.darija_latin,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('darija_latin');

  useEffect(() => {
    const saved = localStorage.getItem('arena_lang') as Language;
    if (saved && translations[saved]) {
      setLangState(saved);
      applyDirection(saved);
    }
  }, []);

  const applyDirection = (selected: Language) => {
    const isRtl = selected !== 'darija_latin';
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = isRtl ? 'ar' : 'fr';
    }
  };

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('arena_lang', newLang);
    applyDirection(newLang);
  };

  const isRtl = lang !== 'darija_latin';

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t: translations[lang], isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSelector() {
  const { lang, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const options: { id: Language; label: string; flag: string }[] = [
    { id: 'darija_latin', label: t.lang_darija_latin, flag: '🇲🇦' },
    { id: 'darija_ar', label: t.lang_darija_ar, flag: '🇲🇦' },
    { id: 'ar_fusha', label: t.lang_ar_fusha, flag: '🌍' }
  ];

  const currentOption = options.find(o => o.id === lang) || options[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
        title="Tarjama / اللغة / Translation"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span>{currentOption.flag}</span>
        <span className="hidden sm:inline">{currentOption.label}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop click closer */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1.5 z-50 animate-fadeIn">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800/80 mb-1">
              Khtar l-Lougha / اختر اللغة
            </div>

            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setLanguage(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                  lang === opt.id
                    ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </div>
                {lang === opt.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
