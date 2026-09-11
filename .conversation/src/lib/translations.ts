export type Language = 'darija_latin' | 'darija_ar' | 'ar_fusha';

export interface TranslationDict {
  // Navigation
  site_title: string;
  site_subtitle: string;
  nav_matches: string;
  nav_tournaments: string;
  nav_leaderboard: string;
  nav_admin: string;
  nav_login: string;
  nav_register: string;
  nav_recharge: string;
  nav_balance: string;
  nav_logout: string;
  nav_profile: string;

  // Hero Section
  hero_badge: string;
  hero_title_1: string;
  hero_title_highlight: string;
  hero_title_2: string;
  hero_desc: string;
  hero_btn_create: string;
  hero_btn_recharge: string;
  hero_stat_matches: string;
  hero_stat_prizes: string;
  hero_stat_escrow: string;

  // Live Matches Widget
  live_available: string;
  see_all: string;
  no_open_matches: string;
  create_challenge_btn: string;
  stake: string;
  prize: string;
  accept: string;

  // How it works
  how_title: string;
  how_subtitle: string;
  step1_title: string;
  step1_desc: string;
  step2_title: string;
  step2_desc: string;
  step3_title: string;
  step3_desc: string;
  step4_title: string;
  step4_desc: string;

  // Tournaments
  tourn_title: string;
  tourn_subtitle: string;
  tourn_entry_fee: string;
  tourn_players: string;
  tourn_start: string;
  tourn_details: string;

  // Trust Banner
  escrow_title: string;
  escrow_desc: string;
  escrow_cta: string;

  // Language names
  lang_darija_latin: string;
  lang_darija_ar: string;
  lang_ar_fusha: string;
}

export const translations: Record<Language, TranslationDict> = {
  darija_latin: {
    site_title: 'eFootball ARENA',
    site_subtitle: '1vs1 & Botolat Morocco',
    nav_matches: '1vs1 Challenges',
    nav_tournaments: 'Botolat (Tournois)',
    nav_leaderboard: 'Classement',
    nav_admin: 'Idarat L-Mawqi3',
    nav_login: 'Dkhol',
    nav_register: 'Tsjel Fabor',
    nav_recharge: 'Chahn (+ Recharge)',
    nav_balance: 'Rasid',
    nav_logout: 'Khoroj',
    nav_profile: 'Mon Profil',

    hero_badge: 'Manssat eFootball Raqm 1 f L-Mghrib',
    hero_title_1: 'L3eb ',
    hero_title_highlight: '1vs1 & Botolat',
    hero_title_2: ' b Rasid Kaaach!',
    hero_desc: 'Tahadda ahsan la3ibin f eFootball Mobile awla Console. Chhan rasid dyalk b tariqa yadawiya sahla (CIH / Cash Plus) w rbeh flousek b damana 100% Escrow.',
    hero_btn_create: 'Kreye Challenge 1vs1',
    hero_btn_recharge: 'Chahn l-Hisab (Recharge)',
    hero_stat_matches: 'Match Ml3oub',
    hero_stat_prizes: 'Jawa\'iz Mwez3a',
    hero_stat_escrow: 'Escrow Garanti',

    live_available: 'Match Direct Disponible',
    see_all: 'Chouf Kolchi',
    no_open_matches: 'Makaynx match open daba. Kon nta lewel li ycreyi challenge!',
    create_challenge_btn: 'Kreye Challenge Jdid',
    stake: 'Mise',
    prize: 'Ja\'iza',
    accept: 'Qbel',

    how_title: 'Kifash Kaykhdem L-Mawqi3?',
    how_subtitle: '4 khatawat sahla bach t-chhan rasid dyalk w t-bda tl3eb 1vs1 w botolat',
    step1_title: 'Chhan L-Hisab (Yadawi)',
    step1_desc: 'Khtar l-mablagh (20, 50, 100 DH...) w sift virement l l-admin f WhatsApp (CIH aw Cash Plus). Admin kayzid lik rasid f l-blast.',
    step2_title: 'Kreye awla Qbel Challenge',
    step2_desc: 'Khtar l-mise (10 DH, 20 DH...) w khtar l-platform (Mobile awla Console). Rasid kaytbloka f l-mawqi3 (Escrow aman).',
    step3_title: 'Tbadlo Room Code f eFootball',
    step3_desc: 'Khoud Room Code mn l-chat dyal l-match, dkhol f eFootball app w l3bo l-match standard 10 min.',
    step4_title: 'Sift Capture & Khoud Flousek',
    step4_desc: 'Sift screenshot dyal natija. L-fayez kayakhod l-jaiza direct f l-mahfada dyalo w y9der yss-habha f ay weqt.',

    tourn_title: 'Botolat L-Usboo3iya (Tournaments)',
    tourn_subtitle: 'Tsjel f l-botolat w rbeh ja\'iza kbira',
    tourn_entry_fee: 'Frais',
    tourn_players: 'La3ibin',
    tourn_start: 'Weqt l-bdaya',
    tourn_details: 'Tafasil & Tasjil',

    escrow_title: 'Nidam Escrow Damin 100% (Damanat l-Flous)',
    escrow_desc: 'Flous kola match kaytblokaw f l-system qbel ma ybda l-match. Makaynx li y-ghrek awla yhrab. F halat ay khilaf, l-Admin kaychouf les captures w kay-tranchi b l-3adl.',
    escrow_cta: 'Chhan Rasid Daba',

    lang_darija_latin: 'Darija (Latin)',
    lang_darija_ar: 'الدارجة المغربية',
    lang_ar_fusha: 'العربية الفصحى'
  },

  darija_ar: {
    site_title: 'إي فوتبول أرينا',
    site_subtitle: '1 ضد 1 وبطولات المغرب',
    nav_matches: 'تحديات 1 ضد 1',
    nav_tournaments: 'البطولات (Tournois)',
    nav_leaderboard: 'الترتيب',
    nav_admin: 'إدارة الموقع',
    nav_login: 'دخول',
    nav_register: 'تسجل فابور',
    nav_recharge: 'شحن الرصيد',
    nav_balance: 'الرصيد',
    nav_logout: 'خروج',
    nav_profile: 'حسابي',

    hero_badge: 'المنصة رقم 1 فالمغرب لإي فوتبول',
    hero_title_1: 'لعب ',
    hero_title_highlight: '1 ضد 1 وبطولات',
    hero_title_2: ' برصيد كاش!',
    hero_desc: 'تحدى أحسن اللعابة فـ eFootball موبايل ولا كونسول. شحن رصيدك بطريقة يدوية ساهلة (CIH أو كاش بلوس) وربح فلوسك بضمانة 100% إسكرو.',
    hero_btn_create: 'صاوب تحدي 1 ضد 1',
    hero_btn_recharge: 'شحن الحساب (كاش)',
    hero_stat_matches: 'ماتش ملعوب',
    hero_stat_prizes: 'جوائز موزعة',
    hero_stat_escrow: 'ضمانة إسكرو 100%',

    live_available: 'ماتشات متوفرة دابا',
    see_all: 'شوف كلشي',
    no_open_matches: 'ما كاين حتى ماتش دابا، كون نتا اللول لي يصاوب تحدي!',
    create_challenge_btn: 'صاوب تحدي جديد',
    stake: 'الميز',
    prize: 'الجائزة',
    accept: 'قبل',

    how_title: 'كيفاش كيخدم الموقع؟',
    how_subtitle: '4 خطوات ساهلة باش تشحن رصيدك وتبدا تلعب 1 ضد 1 وبطولات',
    step1_title: 'شحن الحساب (يدوي)',
    step1_desc: 'ختار شحال بغيتي تشحن (20، 50، 100 درهم...) وصيفط للأدمن فالواتساب (CIH أو كاش بلوس). الأدمن كيزيدك الرصيد فالبلاصة.',
    step2_title: 'صاوب ولا قبل التحدي',
    step2_desc: 'ختار الميز (10 دراهم، 20 درهم...) ونوع الجهاز (موبايل أو كونسول). الرصيد كيتكوانسا فالموقع بأمان (Escrow).',
    step3_title: 'تبادلو كود الروم فـ eFootball',
    step3_desc: 'خود كود الغرفة (Room Code) من الشات، دخل للعبة إي فوتبول ولعبو الماتش العادي 10 دقائق.',
    step4_title: 'صيفط السكرين وخود فلوسك',
    step4_desc: 'صيفط لقطة شاشة للنتيجة. الرابح كياخد الجائزة ديريكت فالمحفظة ديالو ويقدر يسحبها فـ أي وقت.',

    tourn_title: 'البطولات الأسبوعية (Tournaments)',
    tourn_subtitle: 'تسجل فالبطولات وربح جوائز كبار',
    tourn_entry_fee: 'الواجب',
    tourn_players: 'اللعابة',
    tourn_start: 'وقت البداية',
    tourn_details: 'التفاصيل والتسجيل',

    escrow_title: 'نظام إسكرو الضامن 100% (ضمانة الفلوس)',
    escrow_desc: 'الفلوس ديال كل ماتش كيتكوانساو فالسيت قبل ما يبدا الماتش. ما كاينش لي يغدر ولا يهرب. وفحالة أي خلاف، الأدمن كيشوف السكرينات وكيحكم بالعدل.',
    escrow_cta: 'شحن الرصيد دابا',

    lang_darija_latin: 'Darija (Latin)',
    lang_darija_ar: 'الدارجة المغربية',
    lang_ar_fusha: 'العربية الفصحى'
  },

  ar_fusha: {
    site_title: 'إي فوتبول أرينا',
    site_subtitle: '1 ضد 1 وبطولات المغرب',
    nav_matches: 'تحديات 1 ضد 1',
    nav_tournaments: 'البطولات الرسمية',
    nav_leaderboard: 'لوحة الصدارة',
    nav_admin: 'لوحة الإدارة',
    nav_login: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب مجاناً',
    nav_recharge: 'شحن المحفظة',
    nav_balance: 'الرصيد',
    nav_logout: 'تسجيل الخروج',
    nav_profile: 'الملف الشخصي',

    hero_badge: 'المنصة الأولى بالمغرب لـ eFootball',
    hero_title_1: 'العب ',
    hero_title_highlight: '1 ضد 1 وبطولات',
    hero_title_2: ' بجوائز نقدية حقيقية!',
    hero_desc: 'تحدّ نخبة اللاعبين في eFootball عبر الهاتف أو منصات الألعاب. اشحن محفظتك يدوياً وبسهولة عبر (CIH Bank أو Cash Plus) واستلم أرباحك بأمان تام 100%.',
    hero_btn_create: 'إنشاء تحدي 1 ضد 1',
    hero_btn_recharge: 'شحن الرصيد (يدوي)',
    hero_stat_matches: 'مباراة مكتملة',
    hero_stat_prizes: 'جوائز موزعة',
    hero_stat_escrow: 'ضمان مالي 100%',

    live_available: 'مباريات متاحة حالياً',
    see_all: 'عرض الكل',
    no_open_matches: 'لا توجد تحديات مفتوحة حالياً، كن أول من ينشئ تحدياً جديداً!',
    create_challenge_btn: 'إنشاء تحدي جديد',
    stake: 'الرهان',
    prize: 'الجائزة',
    accept: 'قبول التحدي',

    how_title: 'كيف تعمل المنصة؟',
    how_subtitle: '4 خطوات بسيطة لشحن الرصيد وبدء خوض المباريات والبطولات',
    step1_title: 'شحن المحفظة (يدوياً)',
    step1_desc: 'اختر المبلغ (20، 50، 100 درهم...) وتواصل مع الإدارة عبر واتساب للتحويل. يضاف الرصيد لمحفظتك فوراً بعد التأكيد.',
    step2_title: 'إنشاء أو قبول التحدي',
    step2_desc: 'حدد قيمة الدخول والمنصة. يتم حجز رصيد الطرفين تلقائياً في نظام الضمان (Escrow) لحماية حقوق الجميع.',
    step3_title: 'تبادل رمز الغرفة في اللعبة',
    step3_desc: 'احصل على رمز الغرفة (Room Code) عبر المحادثة المباشرة، ثم انضم للغرفة في تطبيق eFootball لمدة 10 دقائق.',
    step4_title: 'إرسال النتيجة واستلام الجائزة',
    step4_desc: 'ارفع لقطة شاشة لنتيجة المباراة. يتم تحويل الجائزة تلقائياً لمحفظة الفائز مع إمكانية السحب في أي وقت.',

    tourn_title: 'البطولات الأسبوعية الرسمية',
    tourn_subtitle: 'سجّل في البطولات الكبرى وتنافس على جوائز نقدية قيّمة',
    tourn_entry_fee: 'رسوم الاشتراك',
    tourn_players: 'المشاركون',
    tourn_start: 'موعد الانطلاق',
    tourn_details: 'التفاصيل والتسجيل',

    escrow_title: 'نظام الضمان المالي الآمن (Escrow 100%)',
    escrow_desc: 'يتم تجميد أموال المباراة في المنصة قبل انطلاقها، مما يمنع الانسحاب غير العادل. في حال وجود أي نزاع، تتدخل الإدارة لمراجعة لقطات الشاشة وفصل النتيجة بكل شفافية.',
    escrow_cta: 'اشحن رصيدك الآن',

    lang_darija_latin: 'Darija (Latin)',
    lang_darija_ar: 'الدارجة المغربية',
    lang_ar_fusha: 'العربية الفصحى'
  }
};
