/**
 * VedSAAS Global Intelligence v9.0 (High-Speed Silent Edition)
 * 1. Instant Native Rendering (Prioritized Dictionaries)
 * 2. 3s Lazy-Load Fallback (Google Engine)
 * 3. Total UI Silence (No Bars, No Popups)
 */

const NATIVE_DICTIONARY = {
    "hi": { "hero_brand": "VedSAAS", "tagline": "दुनिया का पहला स्व-विकसित एआई सभ्यता", "subtitle": "वैदिक ज्ञान को आधुनिक बुद्धिमत्ता के साथ जोड़ता है।", "n_docs": "दस्तावेज़", "n_api": "एपीआई", "n_help": "सहायता", "btn_start": "संवाद शुरू करें", "view_en": "English में देखें 🇬🇧" },
    "ar": { "hero_brand": "VedSAAS", "tagline": "أول حضارة للذكاء الاصطناعي ذاتية विकसित في العالم", "subtitle": "يجمع بين الحكمة القديمة والذكاء الحديث.", "n_docs": "الوثائق", "n_api": "API", "n_help": "مساعدة", "btn_start": "ابدأ المحادثة", "view_en": "عرض باللغة الإنجليزية 🇬🇧" },
    "ja": { "hero_brand": "VedSAAS", "tagline": "世界初の自己進化型AI文明", "subtitle": "古代の知恵と現代の知性を融合。", "n_docs": "ドキュメント", "n_api": "API", "n_help": "ヘルプ", "btn_start": "会話を開始", "view_en": "英語で表示 🇬🇧" },
    "pt": { "hero_brand": "VedSAAS", "tagline": "A Primeira Civilização de IA Autodesenvolvida do Mundo", "subtitle": "Combina Sabedoria Antiga com Inteligência Moderna.", "n_docs": "Documentos", "n_api": "API", "n_help": "Ajuda", "btn_start": "Iniciar Conversa", "view_en": "Ver em Inglês 🇬🇧" }
};

const COUNTRY_MAP = {
    "IN": "hi", "AE": "ar", "SA": "ar", "JP": "ja", "FR": "fr", "DE": "de", "ES": "es", "BR": "pt", "PT": "pt", "RU": "ru"
};

async function initCivilization() {
    injectSilentStyles();

    let visitorData = { country_code: "US" };
    const savedPref = localStorage.getItem('vedsaas_lang_pref');
    const urlParams = new URLSearchParams(window.location.search);
    const testCC = urlParams.get('test_country');

    try {
        if (testCC) {
            visitorData.country_code = testCC.toUpperCase();
        } else {
            let res = await fetch('https://ipapi.co/json/');
            if (res.ok) visitorData = await res.json();
        }

        const autoLang = COUNTRY_MAP[visitorData.country_code] || 'en';
        const targetLang = (savedPref === 'en') ? 'en' : autoLang;

        // SPEED OPTIMIZATION:
        // 1. Immediately apply Native Translations (No delay)
        handleLocalization(targetLang, true); // Immediate pass

    } catch (e) {
        handleLocalization('en', true);
    }
}

function handleLocalization(lang, isInitial) {
    console.log(`[Universal] Target: ${lang}`);
    localStorage.setItem('vedsaas_lang_at', lang);

    // UI Update for English Override
    const enBtn = document.getElementById('en-override-btn');
    if (enBtn) {
        enBtn.style.display = (lang === 'en') ? 'none' : 'inline-block';
        if (NATIVE_DICTIONARY[lang]?.view_en) enBtn.innerText = NATIVE_DICTIONARY[lang].view_en;
    }

    if (lang === 'en') {
        localStorage.setItem('vedsaas_lang_pref', 'en');
        clearTranslateCookies();
        revertWidget();
    } else {
        localStorage.removeItem('vedsaas_lang_pref');

        // SPEED: Apply Native First
        applyNativeTranslations(lang);

        // LAZY LOAD: Delay Google Engine by 3 seconds
        if (isInitial) {
            setTimeout(() => triggerSilentEngine(lang), 3000);
        } else {
            triggerSilentEngine(lang);
        }
    }
}

function applyNativeTranslations(lang) {
    const data = NATIVE_DICTIONARY[lang];
    if (!data) return;

    const set = (id, txt) => { if (document.getElementById(id)) document.getElementById(id).innerText = txt; };
    const setT = (sel, txt) => {
        document.querySelectorAll(sel).forEach(el => {
            const icon = el.querySelector('i');
            if (icon) {
                const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3);
                if (textNode) textNode.textContent = ' ' + txt;
            } else el.innerText = txt;
        });
    };

    if (data.hero_brand) set('t-hero-brand', data.hero_brand);
    if (data.tagline) set('t-hero-tagline', data.tagline);
    if (data.subtitle) set('t-hero-subtitle', data.subtitle);
    if (data.btn_start) set('t-btn-start', data.btn_start);

    // Navbar Quick Sync
    if (data.n_docs) setT('[data-t="nav_docs"]', data.n_docs);
    if (data.n_api) setT('[data-t="nav_api"]', data.n_api);
    if (data.n_help) setT('[data-t="nav_help"]', data.n_help);
}

function triggerSilentEngine(lang) {
    // Set Cookie IMMEDIATELY so first execution is translated
    document.cookie = `googtrans=/en/${lang}; path=/`;

    if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');

            // Watchdog for dynamic elements
            setInterval(() => {
                const select = document.querySelector('.goog-te-combo');
                if (select && select.value !== lang) {
                    select.value = lang;
                    select.dispatchEvent(new Event('change'));
                }
            }, 2000);
        };
        const s = document.createElement('script');
        s.async = true; // Non-blocking
        s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(s);

        const d = document.createElement('div');
        d.id = 'google_translate_element';
        d.style.display = 'none';
        document.body.appendChild(d);
    }
}

function clearTranslateCookies() {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function revertWidget() {
    const select = document.querySelector('.goog-te-combo');
    if (select) { select.value = 'en'; select.dispatchEvent(new Event('change')); }
}

function injectSilentStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Hide all remnants of Google UI */
        .goog-te-banner-frame, .goog-te-menu-value, .skiptranslate, 
        #google_translate_element, iframe.goog-te-banner-frame,
        .goog-tooltip, .goog-tooltip:hover {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        body { top: 0 !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; border: none !important; }
    `;
    document.head.appendChild(style);
}

window.switchToEnglish = () => {
    localStorage.setItem('vedsaas_lang_pref', 'en');
    clearTranslateCookies();
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', initCivilization);
