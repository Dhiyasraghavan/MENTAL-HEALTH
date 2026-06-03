"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Globe } from "lucide-react";

type Language = "en" | "hi" | "ta";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
];

const MultiLangToggle = React.memo(() => {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = useCallback((lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    localStorage.setItem("language", lang);
  }, []);

  const currentLanguage = useMemo(
    () => languages.find((l) => l.code === currentLang),
    [currentLang],
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <Globe className="w-4 h-4 text-slate-600" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium text-slate-700 hidden sm:block">
          {currentLanguage?.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as Language)}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors ${
                  currentLang === lang.code ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-slate-700">
                  {lang.name}
                </span>
                {currentLang === lang.code && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default MultiLangToggle;
