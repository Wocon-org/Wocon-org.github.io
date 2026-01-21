// Language translations
const translations = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.download': 'Download',
        'nav.team': 'Team',

        // Hero Section
        'hero.title': 'Wocon',
        'hero.subtitle': 'Experience what you never imagined, starting from here.',
        'hero.description': 'Wocon is a travel application (available on web, Windows, Android, and iOS) that helps you find travel companions.',
        'hero.cta': 'Start Here',

        // Download Section
        'download.title': 'Download Wocon',
        'download.subtitle': 'Choose your platform and start your journey',
        'platform.web': 'Web',
        'platform.web.desc': 'Access Wocon directly in your browser',
        'platform.windows': 'Windows',
        'platform.windows.desc': 'Download for Windows 10 and 11',
        'platform.android': 'Android',
        'platform.android.desc': 'Download from Google Play Store',
        'platform.ios': 'iOS',
        'platform.ios.desc': 'Download from App Store',
        'button.download': 'Download',

        // Team Section
        'team.title': 'Development Team',
        'team.subtitle': 'Meet the people behind Wocon',
        'team.placeholder': 'Coming soon...',

        // Footer
        'footer.copyright': '© 2026 Wocon. All rights reserved. Oasis Company'
    },
    zh: {
        // Navigation
        'nav.home': '首页',
        'nav.download': '下载',
        'nav.team': '团队',

        // Hero Section
        'hero.title': 'Wocon',
        'hero.subtitle': '经历你未曾所想，从这里开始',
        'hero.description': 'Wocon 是一款旅游软件（支持网页、Windows、安卓和 iOS），帮助你找到旅行伙伴。',
        'hero.cta': '从这里开始',

        // Download Section
        'download.title': '下载 Wocon',
        'download.subtitle': '选择你的平台，开启你的旅程',
        'platform.web': '网页',
        'platform.web.desc': '在浏览器中直接访问 Wocon',
        'platform.windows': 'Windows',
        'platform.windows.desc': '下载适用于 Windows 10 和 11',
        'platform.android': '安卓',
        'platform.android.desc': '从 Google Play 商店下载',
        'platform.ios': 'iOS',
        'platform.ios.desc': '从 App Store 下载',
        'button.download': '下载',

        // Team Section
        'team.title': '开发团队',
        'team.subtitle': '认识 Wocon 背后的人们',
        'team.placeholder': '即将推出...',

        // Footer
        'footer.copyright': '© 2026 Wocon. 版权所有。Oasis Company'
    },
    es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.download': 'Descargar',
        'nav.team': 'Equipo',

        // Hero Section
        'hero.title': 'Wocon',
        'hero.subtitle': 'Experimenta lo que nunca imaginaste, comienza aquí.',
        'hero.description': 'Wocon es una aplicación de viajes (disponible en web, Windows, Android y iOS) que te ayuda a encontrar compañeros de viaje.',
        'hero.cta': 'Comenzar Aquí',

        // Download Section
        'download.title': 'Descargar Wocon',
        'download.subtitle': 'Elige tu plataforma y comienza tu viaje',
        'platform.web': 'Web',
        'platform.web.desc': 'Accede a Wocon directamente en tu navegador',
        'platform.windows': 'Windows',
        'platform.windows.desc': 'Descargar para Windows 10 y 11',
        'platform.android': 'Android',
        'platform.android.desc': 'Descargar desde Google Play Store',
        'platform.ios': 'iOS',
        'platform.ios.desc': 'Descargar desde App Store',
        'button.download': 'Descargar',

        // Team Section
        'team.title': 'Equipo de Desarrollo',
        'team.subtitle': 'Conoce a las personas detrás de Wocon',
        'team.placeholder': 'Próximamente...',

        // Footer
        'footer.copyright': '© 2026 Wocon. Todos los derechos reservados. Oasis Company'
    },
    hi: {
        // Navigation
        'nav.home': 'होम',
        'nav.download': 'डाउनलोड',
        'nav.team': 'टीम',

        // Hero Section
        'hero.title': 'Wocon',
        'hero.subtitle': 'जो आपने कभी नहीं सोचा था, वह अनुभव करें, यहां से शुरू करें।',
        'hero.description': 'Wocon एक यात्रा एप्लिकेशन है (वेब, विंडोज, एंड्रॉइड और आईओएस पर उपलब्ध) जो आपको यात्रा साथी खोजने में मदद करता है।',
        'hero.cta': 'यहां से शुरू करें',

        // Download Section
        'download.title': 'Wocon डाउनलोड करें',
        'download.subtitle': 'अपना प्लेटफ़ॉर्म चुनें और अपनी यात्रा शुरू करें',
        'platform.web': 'वेब',
        'platform.web.desc': 'अपने ब्राउज़र में सीधे Wocon तक पहुंचें',
        'platform.windows': 'विंडोज',
        'platform.windows.desc': 'Windows 10 और 11 के लिए डाउनलोड करें',
        'platform.android': 'एंड्रॉइड',
        'platform.android.desc': 'Google Play Store से डाउनलोड करें',
        'platform.ios': 'iOS',
        'platform.ios.desc': 'App Store से डाउनलोड करें',
        'button.download': 'डाउनलोड करें',

        // Team Section
        'team.title': 'डेवलपमेंट टीम',
        'team.subtitle': 'Wocon के पीछे के लोगों से मिलें',
        'team.placeholder': 'जल्द आ रहा है...',

        // Footer
        'footer.copyright': '© 2026 Wocon. सभी अधिकार सुरक्षित। Oasis Company'
    }
};

// Language names for dropdown
const languageNames = {
    en: 'English',
    zh: '中文',
    es: 'Español',
    hi: 'हिंदी'
};

// Current language (default: English)
let currentLanguage = localStorage.getItem('wocon-language') || 'en';

// Set language
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('wocon-language', lang);
    updateTranslations();
    updateLanguageDropdown();
}

// Get translation
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Update all translations on the page
function updateTranslations() {
    // Update navigation
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            el.textContent = translations[currentLanguage][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            el.placeholder = translations[currentLanguage][key];
        }
    });

    // Update document language
    document.documentElement.lang = currentLanguage;
}

// Update language dropdown
function updateLanguageDropdown() {
    const select = document.getElementById('language-select');
    if (select) {
        select.value = currentLanguage;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    setLanguage(currentLanguage);

    // Add event listener to language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
});
