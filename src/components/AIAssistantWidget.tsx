import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Phone,
  Download,
  Compass,
  CheckCircle2,
  Globe,
  Sun,
  Wifi,
  Smartphone,
  Laptop,
  Monitor,
  Share,
  PlusSquare,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

import { conciergeReply, publicConciergeCopy } from "../conciergeReplies";
import { usePWAInstall } from "../hooks/usePWAInstall";

export type SupportedLang = "mn" | "en" | "ko" | "ja" | "zh" | "ru" | "de" | "fr" | "it";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  query?: string;
  action?: {
    type: "book";
    label: string;
  };
}

const BASE_I18N = {
  mn: {
    widgetTitle: "БАТААРЫН ӨЛГИЙ ХӨТӨЧ",
    widgetSubtitle: "Говийн тансаг ресорт & Захиалгын төв",
    launcherBtn: "ЗАХИАЛГА & AI ХӨТӨЧ",
    launcherSub: "БАТААРЫН ӨЛГИЙ • 24/7",
    tabChat: "AI Чат",
    tabBooking: "Захиалга",
    tabSafety: "Санамж",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ Өрөөний үнэ", "📍 4x4 Зам чиглэл", "🛰️ Starlink & Нарны эрчим", "📅 Өрөө захиалах"],
    inputPlaceholder: "Монгол, English, 한국어, 中文, 日本語-ээр асуугаарай...",
    bookingTitle: "Өрөө захиалга & Бэлэн байдал",
    bookingDesc: "Захиалгын мэдээлэл bataartravel@gmail.com хаяг руу шууд очно.",
    checkIn: "Ирэх өдөр (Check-in)",
    checkOut: "Буцах өдөр (Check-out)",
    roomType: "Өрөөний төрөл",
    guests: "Зочдын тоо",
    name: "Таны нэр (Full Name) *",
    email: "Имэйл хаяг *",
    phone: "Утас / WhatsApp",
    notes: "Тусгай хүсэлт (4x4 тосох, тэмээ унах, Хэрмэн цавын аялал...)",
    submitBooking: "Захиалга илгээх (bataartravel@gmail.com)",
    bookingSent: "Хүсэлтийг илгээх үйлчилгээ хүлээн авлаа. Өрөөний боломж, үнийг баазын ажилтан баталгаажуулна.",
    safetyTitle: "Хэрмэн цав & Говийн аяллын санамж",
    safetyP1: "1. 4x4 Тээвэр: Зөвхөн бүрэн хөтлөгчтэй Land Cruiser зэрэг өндөр тэнхлэгтэй машинтай зорчих.",
    safetyP2: "2. Ус ба нар: 1 хүнд өдөрт 3-4л ундны ус тооцох, нарны хамгаалалт, салхины дулаан хувцастай байх.",
    safetyP3: "3. Баазын тохь: Starlink интернэт, гүний цэвэр ус, 24/7 цахилгаанаар бүрэн хангагдсан.",
    callDirect: "Шууд залгах",
    campHotline: "Баазын шуурхай утас",
    installApp: "Апп суулгах"
  },
  en: {
    widgetTitle: "BATAAR SANCTUARY CONCIERGE",
    widgetSubtitle: "Luxury Desert Retreat & Expedition Desk",
    launcherBtn: "CONCIERGE & BOOKING",
    launcherSub: "BATAAR SANCTUARY • 24/7",
    tabChat: "AI Chat",
    tabBooking: "Reserve",
    tabSafety: "Advisory",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ Room Rates", "📍 4x4 Chauffeur Route", "🛰️ Starlink & Solar", "📅 Reserve Stay"],
    inputPlaceholder: "Ask anything in English, Korean, Chinese, Japanese...",
    bookingTitle: "Lodge Reservation & Availability",
    bookingDesc: "Your request is immediately delivered to bataartravel@gmail.com and our concierge desk.",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    roomType: "Select Accommodation",
    guests: "Number of Guests",
    name: "Full Name *",
    email: "Email Address *",
    phone: "Phone / WhatsApp",
    notes: "Special requests (4x4 airport pickup, camel trek, Khermen Tsav expedition...)",
    submitBooking: "Submit Reservation (To bataartravel@gmail.com)",
    bookingSent: "Your reservation request has been received! Our sanctuary team is contacting you shortly.",
    safetyTitle: "Gobi & Khermen Tsav Travel Advisory",
    safetyP1: "1. 4x4 Vehicle: Travel only in high-clearance 4WD vehicles (Toyota Land Cruiser).",
    safetyP2: "2. Hydration & Sun: Carry 3-4 liters of water per person daily, sun protection, and windproof gear.",
    safetyP3: "3. Sanctuary Comfort: Starlink broadband, hot showers, and 100% solar green power await your arrival.",
    callDirect: "Call Concierge",
    campHotline: "Sanctuary Direct Line",
    installApp: "Install App"
  },
  ko: {
    widgetTitle: "바타르 생츄어리 컨시어지",
    widgetSubtitle: "고비 사막 럭셔리 에코 리조트 & 예약 센터",
    launcherBtn: "컨시어지 & 객실 예약",
    launcherSub: "바타르 생츄어리 • 24/7 AI",
    tabChat: "AI 챗",
    tabBooking: "객실 예약",
    tabSafety: "여행 수칙",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ 객실 요금", "📍 4x4 이동 경로", "🛰️ 스타링크 & 시설", "📅 객실 예약"],
    inputPlaceholder: "객실 예약, 투어 일정, 날씨 등을 질문하세요...",
    bookingTitle: "객실 예약 및 일정 조회",
    bookingDesc: "예약 접수 시 즉시 관리자 이메일(bataartravel@gmail.com)로 전달됩니다.",
    checkIn: "체크인 날짜",
    checkOut: "체크아웃 날짜",
    roomType: "객실 선택",
    guests: "투숙 인원",
    name: "성함 (영문 또는 한글) *",
    email: "이메일 주소 *",
    phone: "연락처 / 카카오톡",
    notes: "특별 요청 사항 (공항 픽업, 낙타 트레킹, 헤르민 차브 탐사 등)",
    submitBooking: "예약 신청하기 (이메일 실시간 전송)",
    bookingSent: "예약 신청이 접수되었습니다! 담당 매니저가 이메일로 안내해 드립니다.",
    safetyTitle: "고비 사막 & 헤르민 차브 여행 수칙",
    safetyP1: "1. 4x4 필수: 험로 주행을 위해 반드시 토요타 랜드크루저 등 사륜구동 차량을 이용하세요.",
    safetyP2: "2. 식수 및 자외선: 1인당 하루 3~4리터의 식수와 자외선 차단제, 방풍 재킷을 준비하세요.",
    safetyP3: "3. 리조트 편의: 베이스캠프 전 구역에서 스타링크 위성 인터넷과 온수 샤워가 가능합니다.",
    callDirect: "전화 문의",
    campHotline: "리조트 직통 전화",
    installApp: "앱 설치"
  },
  zh: {
    widgetTitle: "巴塔尔度假圣地 管家服务",
    widgetSubtitle: "南戈壁高端生态度假村与科考接待中心",
    launcherBtn: "管家服务与预订",
    launcherSub: "巴塔尔圣地 • 24小时 AI",
    tabChat: "AI 咨询",
    tabBooking: "客房预订",
    tabSafety: "行程须知",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ 房型价格", "📍 4x4 交通路线", "🛰️ 星链与电力", "📅 立即订房"],
    inputPlaceholder: "输入您的中文咨询，如房型、路程、恐龙考察...",
    bookingTitle: "客房预订与空房查询",
    bookingDesc: "预订信息将实时发送至度假村管理邮箱 bataartravel@gmail.com。",
    checkIn: "入住日期",
    checkOut: "退房日期",
    roomType: "选择房型",
    guests: "入住人数",
    name: "贵宾姓名 *",
    email: "电子邮箱 *",
    phone: "联系电话 / 微信",
    notes: "特别需求 (越野接送、骑骆驼看日落、化石谷向导等)",
    submitBooking: "提交预订申请 (直发邮箱)",
    bookingSent: "您的预订申请已成功提交，工作人员将尽快回复确认！",
    safetyTitle: "戈壁旅行与赫尔曼察夫安全须知",
    safetyP1: "1. 越野车型: 严禁普通轿车进入，必须使用高底盘丰田陆地巡洋舰 (Land Cruiser)。",
    safetyP2: "2. 水与防晒: 每人每天需储备3-4升饮用水，备好防晒霜及防风外套。",
    safetyP3: "3. 营地保障: 度假村全天候供应热水淋浴、星链卫星WiFi及绿色太阳能电力。",
    callDirect: "拨打客服",
    campHotline: "度假村直通热线",
    installApp: "安装应用"
  },
  ja: {
    widgetTitle: "バタール・サンクチュアリ コンシェルジュ",
    widgetSubtitle: "ゴビ砂漠ラグジュアリーエコリゾート＆予約デスク",
    launcherBtn: "宿泊予約＆AI案内",
    launcherSub: "バタール聖地 • 24/7 AI",
    tabChat: "AI案内",
    tabBooking: "宿泊予約",
    tabSafety: "旅の注意事項",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ 宿泊料金", "📍 4WDアクセス", "🛰️ スターリンク設備", "📅 客室を予約"],
    inputPlaceholder: "宿泊料金、送迎、恐竜ツアーなど日本語でどうぞ...",
    bookingTitle: "空室照会・宿泊予約",
    bookingDesc: "ご予約内容は即座に担当者メール（bataartravel@gmail.com）へ届きます。",
    checkIn: "チェックイン日",
    checkOut: "チェックアウト日",
    roomType: "お部屋タイプ",
    guests: "ご利用人数",
    name: "お名前（ローマ字または漢字） *",
    email: "メールアドレス *",
    phone: "お電話番号",
    notes: "ご要望（空港送迎、ラクダ体験、化石ツアー等）",
    submitBooking: "予約をリクエストする（メール送信）",
    bookingSent: "予約リクエストを受け付けました。担当者よりメールにてご連絡いたします。",
    safetyTitle: "ゴビ砂漠＆ヘルメン・ツァフ旅行の安全事項",
    safetyP1: "1. 4WD車両必須: 険しい地形のため、必ずトヨタ・ランドクルーザーをご利用ください。",
    safetyP2: "2. 水分と紫外線: 1日1人3〜4リットルの飲料水、日焼け止め、防風着をご用意ください。",
    safetyP3: "3. 快適な拠点: キャンプ場内はスターリンクWi-Fi、温水シャワー、太陽光電力が完備されています。",
    callDirect: "電話で問い合わせ",
    campHotline: "リゾート直通電話",
    installApp: "アプリ導入"
  },
  ru: {
    widgetTitle: "КОНСЬЕРЖ БАТААР САНКТУАРИЙ",
    widgetSubtitle: "Эко-курорт и база палеонтологических экспедиций в Гоби",
    launcherBtn: "БРОНЬ & AI КОНСЬЕРЖ",
    launcherSub: "БАТААРЫН ӨЛГИЙ • 24/7",
    tabChat: "AI Чат",
    tabBooking: "Бронь",
    tabSafety: "Памятка",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ Стоимость номеров", "📍 Маршрут 4x4", "🛰️ Starlink и удобства", "📅 Забронировать"],
    inputPlaceholder: "Задайте любой вопрос по проживанию и турам...",
    bookingTitle: "Бронирование номеров",
    bookingDesc: "Заявка мгновенно поступит на почту bataartravel@gmail.com.",
    checkIn: "Дата заезда",
    checkOut: "Дата выезда",
    roomType: "Категория номера",
    guests: "Количество гостей",
    name: "Ваше имя *",
    email: "Email *",
    phone: "Телефон / WhatsApp",
    notes: "Пожелания (трансфер 4x4, катание на верблюдах, экспедиция)",
    submitBooking: "Отправить бронь (на bataartravel@gmail.com)",
    bookingSent: "Заявка успешно принята! Мы свяжемся с вами в ближайшее время.",
    safetyTitle: "Памятка для путешествия по Гоби",
    safetyP1: "1. Автомобиль 4х4: Передвижение только на полноприводных внедорожниках с высоким клиренсом.",
    safetyP2: "2. Вода и солнце: Не менее 3-4 литров воды на человека в день, защита от солнца и ветра.",
    safetyP3: "3. База Батаар: На базе доступен спутниковый интернет Starlink, горячая вода и электричество 24/7.",
    callDirect: "Позвонить",
    campHotline: "Горячая линия базы",
    installApp: "Установить"
  },
  de: {
    widgetTitle: "BATAAR SANCTUARY CONCIERGE",
    widgetSubtitle: "Luxus-Wüstenretreat & Expeditionsbasis",
    launcherBtn: "CONCIERGE & BUCHUNG",
    launcherSub: "BATAAR SANCTUARY • 24/7",
    tabChat: "AI Chat",
    tabBooking: "Buchen",
    tabSafety: "Hinweise",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ Zimmerpreise", "📍 4x4 Route", "🛰️ Starlink & Solar", "📅 Zimmer reservieren"],
    inputPlaceholder: "Stellen Sie Ihre Fragen auf Deutsch, Englisch...",
    bookingTitle: "Zimmerreservierung & Verfügbarkeit",
    bookingDesc: "Buchungen werden direkt an bataartravel@gmail.com übermittelt.",
    checkIn: "Anreisedatum",
    checkOut: "Abreisedatum",
    roomType: "Zimmertyp",
    guests: "Gästeanzahl",
    name: "Vollständiger Name *",
    email: "E-Mail-Adresse *",
    phone: "Telefon / WhatsApp",
    notes: "Sonderwünsche (Transfer, Expeditionen)",
    submitBooking: "Reservierung anfragen",
    bookingSent: "Ihre Anfrage wurde erfolgreich an bataartravel@gmail.com übermittelt!",
    safetyTitle: "Sicherheitshinweise für die Gobi",
    safetyP1: "1. 4x4 Fahrzeug: Nur geländegängige Allradfahrzeuge nutzen.",
    safetyP2: "2. Wasser & Sonne: Mindestens 3-4 Liter Wasser pro Tag und Sonnenschutz mitführen.",
    safetyP3: "3. Schutz: Starlink-Internet und heißes Quellwasser stehen im Camp bereit.",
    callDirect: "Anrufen",
    campHotline: "Direktkontakt",
    installApp: "App laden"
  },
  fr: {
    widgetTitle: "BATAAR SANCTUARY CONCIERGERIE",
    widgetSubtitle: "Retraite de Luxe & Expéditions dans le Désert de Gobi",
    launcherBtn: "CONCIERGE & RÉSERVATION",
    launcherSub: "BATAAR SANCTUARY • 24/7",
    tabChat: "AI Chat",
    tabBooking: "Réserver",
    tabSafety: "Conseils",
    welcome: `Батаарын өлгийд тавтай морилно уу! / Welcome to Bataar Sanctuary.

Автомат лавлах / Automated reference: өрөө, зам, аялал, захиалга. Үнэ болон өрөөний боломжийг сонгосон огноогоор бааз баталгаажуулна.

bataartravel@gmail.com • +976 7201 0099`,
    chips: ["🏛️ Tarifs des lodges", "📍 Transfert 4x4", "🛰️ Starlink & Solaire", "📅 Réserver"],
    inputPlaceholder: "Posez votre question en français, anglais...",
    bookingTitle: "Réservation de Lodge",
    bookingDesc: "Votre demande est transmise directement à bataartravel@gmail.com.",
    checkIn: "Date d'arrivée",
    checkOut: "Date de départ",
    roomType: "Catégorie de Lodge",
    guests: "Nombre de voyageurs",
    name: "Nom complet *",
    email: "Adresse e-mail *",
    phone: "Téléphone / WhatsApp",
    notes: "Demandes particulières (transfert 4x4, safari chameaux)",
    submitBooking: "Envoyer la réservation",
    bookingSent: "Votre réservation a été transmise à bataartravel@gmail.com !",
    safetyTitle: "Conseils de Sécurité dans le Gobi",
    safetyP1: "1. Véhicule 4x4 : Uniquement des véhicules tout-terrain Toyota Land Cruiser.",
    safetyP2: "2. Hydratation : Prévoir 3 à 4 litres d'eau par jour et par personne.",
    safetyP3: "3. Équipements : Wi-Fi Starlink et douches chaudes disponibles au camp.",
    callDirect: "Appeler",
    campHotline: "Ligne directe du camp",
    installApp: "Installer l'app"
  }
};


const I18N = {...BASE_I18N, it: {...BASE_I18N.en,
 widgetTitle:'GUIDA BATAAR SANCTUARY',widgetSubtitle:'Soggiorni nel Gobi e prenotazioni',launcherBtn:'GUIDA & PRENOTAZIONI',launcherSub:'BATAAR SANCTUARY • 24/7',
 tabChat:'Chat',tabBooking:'Prenota',tabSafety:'Consigli',chips:['🏛️ Prezzi camere','📍 Percorso 4x4','🛰️ Starlink e solare','📅 Prenota soggiorno'],inputPlaceholder:'Chiedi informazioni in italiano...',bookingTitle:'Prenotazione e disponibilità',
 safetyTitle:'Consigli per il Gobi e Khermen Tsav',safetyP1:'1. Trasporto: utilizzare veicoli 4x4 adatti al terreno.',safetyP2:'2. Acqua e sole: portare 3–4 litri di acqua al giorno per persona, protezione solare e abiti antivento.',safetyP3:'3. Servizi: verificare con il campo internet, docce calde ed energia prima dell’arrivo.',callDirect:'Chiama il campo',campHotline:'Contatto del campo',installApp:'Installa app'}};

export const AIAssistantWidget: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<SupportedLang>(() => {
    try {
      const stored = localStorage.getItem("bataar_lang");
      if (stored && stored in I18N) return stored as SupportedLang;
    } catch {}
    return "mn";
  });

  const copy = publicConciergeCopy(currentLang);
  const t = {...(I18N[currentLang] || I18N.en),welcome:copy.welcome};
  const languageRef=useRef(currentLang);
  languageRef.current=currentLang;
  const [languageMenuOpen,setLanguageMenuOpen]=useState(false);
  const languageMenuRef=useRef<HTMLDivElement>(null);
  const languageButtonRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!languageMenuOpen)return;
    const outside=(event:Event)=>{if(!languageMenuRef.current?.contains(event.target as Node))setLanguageMenuOpen(false);};
    const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'){setLanguageMenuOpen(false);languageButtonRef.current?.focus();}};
    document.addEventListener('pointerdown',outside);
    document.addEventListener('focusin',outside);
    document.addEventListener('keydown',keyboard);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);document.removeEventListener('keydown',keyboard);};
  },[languageMenuOpen]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "booking" | "safety">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg-0",
      sender: "assistant",
      text: t.welcome,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);


  // Settings & PWA App
  const [showAppInstall, setShowAppInstall] = useState(false);
  const { isInstallable, isInstalled, isIOS, isAndroid, isInAppBrowser, isSafari, isChrome, install } = usePWAInstall();
  const [installDeviceTab, setInstallDeviceTab] = useState<"ios" | "android" | "desktop">("ios");

  useEffect(() => {
    if (isAndroid) {
      setInstallDeviceTab("android");
    } else if (isIOS) {
      setInstallDeviceTab("ios");
    } else {
      setInstallDeviceTab("desktop");
    }
  }, [isAndroid, isIOS]);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    arrivalDate: "",
    departureDate: "",
    roomType: "Deluxe Wooden Lodge",
    guests: 2,
    notes: ""
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to language changes from the website header
  useEffect(() => {
    const handleLangChange = (e: any) => {
      const newLang = e?.detail?.lang;
      if (newLang && newLang in I18N && newLang !== currentLang) {
        setCurrentLang(newLang as SupportedLang);
      }
    };

    window.addEventListener("bataar-language-change", handleLangChange);

    // Periodic storage check
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem("bataar_lang");
        if (stored && stored in I18N && stored !== currentLang) {
          setCurrentLang(stored as SupportedLang);
        }
      } catch {}
    }, 800);

    return () => {
      window.removeEventListener("bataar-language-change", handleLangChange);
      clearInterval(interval);
    };
  }, [currentLang]);

  // When language changes, update welcome message
  useEffect(() => {
    setMessages((prev) => prev.map(message => message.id === 'msg-0' ? {...message,text:t.welcome} : message.sender === 'assistant' && message.query ? {...message,text:conciergeReply(message.query,currentLang),action:message.action ? {...message.action,label:'📅 '+t.tabBooking} : undefined} : message));
  }, [currentLang, t.welcome]);


  useEffect(() => {
    if (messagesEndRef.current && activeTab === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  const switchLanguage = (newLang: SupportedLang) => {
    setLanguageMenuOpen(false);
    languageButtonRef.current?.focus();
    setCurrentLang(newLang);
    try {
      localStorage.setItem("bataar_lang", newLang);
      window.dispatchEvent(new CustomEvent("bataar-set-language", { detail: { lang: newLang } }));
      window.dispatchEvent(new CustomEvent("bataar-language-change", { detail: { lang: newLang } }));
    } catch {}
  };


  const generateLocalReply = (query: string): string => conciergeReply(query, currentLang);

  const handleSendMessage = async (suggested?: string) => {
    if (!(suggested || inputMessage).trim() || isTyping) return;

    const userText = (suggested || inputMessage).trim();
    setInputMessage("");

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      await new Promise((r) => setTimeout(r, 250));
      const replyLang=languageRef.current;
      const replyText = conciergeReply(userText,replyLang);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "assistant",
          text: replyText,
          query: userText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: {
            type: "book",
            label: `📅 ${I18N[replyLang].tabBooking}`
          }
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "assistant",
          text: generateLocalReply(userText),
          query: userText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <>
      {/* Light / Gegeeleg Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pointer-events-auto">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setShowAppInstall(false);
            }}
            className="group flex items-center gap-3 px-4.5 py-3 rounded-full bg-white/95 text-stone-900 border border-stone-200/90 shadow-[0_12px_36px_rgba(40,30,20,0.12)] hover:border-amber-500/60 hover:shadow-[0_16px_40px_rgba(217,119,6,0.18)] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-white shadow-sm">
              <Sparkles className="w-4 h-4 fill-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {t.launcherBtn}
              </span>
              <span className="text-[9px] text-stone-500 tracking-wider uppercase font-medium">
                {t.launcherSub}
              </span>
            </div>

            <span className="ml-1 text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200/60 font-semibold uppercase">
              {currentLang.toUpperCase()}
            </span>
          </button>
        )}
      </div>

      {/* Light / Gegeeleg Modal Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[490px] h-[670px] max-h-[88vh] bg-[#FAF9F6]/98 border border-stone-200/90 rounded-3xl shadow-[0_25px_65px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-[#F5EFEB]/90 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4.5 h-4.5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Cormorant_Garamond',serif] font-bold text-stone-900 text-base tracking-wide">
                    {t.widgetTitle}
                  </h3>
                  <span className="text-[8.5px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-full font-mono uppercase font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 tracking-wider uppercase font-medium">{t.widgetSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* PWA App Install quick button in header */}
              <button
                onClick={() => {
                  setShowAppInstall(!showAppInstall);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors border cursor-pointer ${
                  showAppInstall
                    ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                    : "bg-white border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                }`}
                title="Bataar Travel Аппликейшнийг утсандаа суулгах (PWA)"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{t.installApp || "Апп суулгах"}</span>
                <span className="sm:hidden">Апп</span>
              </button>

              {/* Language Selector Dropdown */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  type="button" ref={languageButtonRef}
                  aria-expanded={languageMenuOpen} aria-controls="bataar-language-options"
                  onClick={()=>setLanguageMenuOpen(open=>!open)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-semibold shadow-xs"
                  title="Хэл солих / Change Language"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-600" />
                  <span className="uppercase">{currentLang}</span>
                </button>
                {languageMenuOpen && <div id="bataar-language-options" role="group" aria-label="Language" className="absolute right-0 top-full mt-1 flex flex-col bg-white border border-stone-200 rounded-xl shadow-xl p-1 z-50 min-w-[130px] max-h-[70vh] overflow-y-auto">
                  <button onClick={() => switchLanguage("mn")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "mn" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇲🇳 Монгол</button>
                  <button onClick={() => switchLanguage("en")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "en" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇬🇧 English</button>
                  <button onClick={() => switchLanguage("ko")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "ko" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇰🇷 한국어</button>
                  <button onClick={() => switchLanguage("zh")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "zh" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇨🇳 中文</button>
                  <button onClick={() => switchLanguage("ja")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "ja" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇯🇵 日本語</button>
                  <button onClick={() => switchLanguage("ru")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "ru" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇷🇺 Русский</button>
                  <button onClick={() => switchLanguage("de")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "de" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇩🇪 Deutsch</button>
                  <button onClick={() => switchLanguage("fr")} className={`px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50 flex items-center gap-2 ${currentLang === "fr" ? "font-bold text-amber-600 bg-amber-50" : ""}`}>🇫🇷 Français</button><button onClick={() => switchLanguage("it")} className="px-2.5 py-1 text-left text-xs rounded-lg hover:bg-stone-50">🇮🇹 Italiano</button>
                </div>}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="grid grid-cols-3 bg-[#F2EDE4]/70 p-1 border-b border-stone-200/80 text-[10.5px] font-medium">
            <button
              onClick={() => { setActiveTab("chat"); setShowAppInstall(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "chat" && !showAppInstall
                  ? "bg-white text-stone-900 font-bold shadow-xs border border-stone-200/60"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.tabChat}</span>
            </button>

            <button
              onClick={() => { setActiveTab("booking"); setShowAppInstall(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "booking" && !showAppInstall
                  ? "bg-white text-stone-900 font-bold shadow-xs border border-stone-200/60"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.tabBooking}</span>
            </button>


            <button
              onClick={() => { setActiveTab("safety"); setShowAppInstall(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "safety" && !showAppInstall
                  ? "bg-white text-stone-900 font-bold shadow-xs border border-stone-200/60"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.tabSafety}</span>
            </button>
          </div>


          {/* PWA App Install Panel */}
          {showAppInstall && (
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#FAF9F6] text-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 font-['Cormorant_Garamond',serif]">
                  <Smartphone className="w-4 h-4 text-amber-600" /> Bataar Travel Гар утасны Аппликейшн
                </h4>
                <button
                  onClick={() => setShowAppInstall(false)}
                  className="text-stone-500 hover:text-stone-800 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* App banner */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                  <img src="./favicon.png" alt="Bataar App Icon" className="w-full h-full object-cover rounded-[10px]" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Cormorant_Garamond',serif] font-bold text-stone-900 text-base leading-snug truncate">
                    Батаарын Өлгий | Bataar Travel
                  </div>
                  <div className="text-[10.5px] text-stone-500 truncate">
                    bataartravel.mn • Албан ёсны гар утасны хувилбар (PWA)
                  </div>
                </div>
              </div>

              {/* In-App Browser Warning (Facebook, Messenger, Instagram, etc.) */}
              {isInAppBrowser && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Анхаар: Та Facebook / Messenger дотор нээсэн байна</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Facebook болон Messenger-ийн дотоод хөтөч нь гар утсанд апп суулгах үйлдлийг хаадаг тул дараах 2 алхмыг хийнэ үү:
                  </p>
                  <ol className="text-[11px] text-stone-800 space-y-1 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                    <li>1. Дэлгэцийн баруун дээд эсвэл доод талын <strong>3 цэг (⋮)</strong> эсвэл <strong>Хуваалцах (Share)</strong> дээр дарна.</li>
                    <li>2. <strong>"Safari-д нээх" (Open in Safari)</strong> эсвэл <strong>"Хөтчид нээх" (Open in Browser)</strong> сонголтыг дарж үндсэн хөтчөөрөө нээнэ.</li>
                  </ol>
                </div>
              )}

              {/* Device Selector Tabs */}
              <div className="flex rounded-xl bg-stone-200/70 p-1 text-[10.5px] font-semibold gap-1">
                <button
                  onClick={() => setInstallDeviceTab("ios")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    installDeviceTab === "ios"
                      ? "bg-white text-stone-900 shadow-2xs font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>🍏 iPhone / iPad</span>
                </button>
                <button
                  onClick={() => setInstallDeviceTab("android")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    installDeviceTab === "android"
                      ? "bg-white text-stone-900 shadow-2xs font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>🤖 Android</span>
                </button>
                <button
                  onClick={() => setInstallDeviceTab("desktop")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    installDeviceTab === "desktop"
                      ? "bg-white text-stone-900 shadow-2xs font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-stone-700" />
                  <span>💻 PC / Laptop</span>
                </button>
              </div>

              {/* iOS Step-by-Step Instructions */}
              {installDeviceTab === "ios" && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-600" /> iPhone / iPad дээр суулгах заавар:
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                      Safari
                    </span>
                  </div>

                  <div className="space-y-2.5 text-[11.5px] text-stone-700">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex-1">
                        Safari хөтчийн дэлгэцийн доод талын голд байрлах <strong className="text-stone-900">Share / Хуваалцах</strong> (дөрвөлжин дээр дээшээ сумтай <span className="inline-block px-1.5 py-0.5 bg-white border border-stone-300 rounded font-mono font-bold text-xs">⎋</span>) товчийг дарна.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex-1">
                        Гарч ирэх цэсийг доош нь гүйлгээд <strong className="text-stone-900">"Add to Home Screen"</strong> (<span className="text-amber-700 font-semibold">Нүүр дэлгэцэнд нэмэх</span> <span className="inline-block px-1 py-0.5 bg-white border border-stone-300 rounded font-mono text-xs">⊞</span>) сонголтыг сонгоно.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="flex-1">
                        Баруун дээд буланд байрлах <strong className="text-emerald-700">"Add" (Нэмэх)</strong> товчийг дарахад таны утасны дэлгэц дээр <strong className="text-stone-900">BataarTravel</strong> апп шууд сууж бэлэн болно!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Step-by-Step Instructions */}
              {installDeviceTab === "android" && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" /> Android дээр суулгах заавар:
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Chrome / Samsung
                    </span>
                  </div>

                  {/* 1-Click Install Button if browser supports it */}
                  {isInstallable && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-center space-y-2">
                      <p className="text-[11px] text-amber-900 font-medium">
                        Таны төхөөрөмж шууд 1 товшилтоор суулгахыг дэмжиж байна:
                      </p>
                      <button
                        onClick={async () => {
                          await install();
                          setShowAppInstall(false);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                      >
                        <Download className="w-4 h-4" /> Утсандаа 1 товшилтоор суулгах
                      </button>
                    </div>
                  )}

                  <div className="space-y-2.5 text-[11.5px] text-stone-700">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex-1">
                        Chrome хөтчийн баруун дээд булангийн <strong className="text-stone-900">3 цэг (⋮)</strong> товчийг дарна (эсвэл Samsung Internet-ийн баруун доод <span className="font-bold">≡</span> цэс).
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex-1">
                        Цэснээс <strong className="text-stone-900">"Install app" (Аппликейшн суулгах)</strong> эсвэл <strong className="text-stone-900">"Add to Home screen" (Нүүр дэлгэцэнд нэмэх)</strong> гэснийг сонгоно.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="flex-1">
                        <strong className="text-emerald-700">"Install" (Суулгах)</strong> товчийг баталгаажуулахад таны утасны дэлгэц дээр сууж бэлэн болно!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PC / Laptop Desktop Instructions */}
              {installDeviceTab === "desktop" && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-blue-600" /> Компьютер / Laptop дээр програм болгож суулгах:
                    </span>
                    <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                      Edge / Chrome
                    </span>
                  </div>

                  {/* Direct domain alert */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-stone-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                      <span>💡 Чухал санамж:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-700">
                      Та одоогоор хөгжүүлэгчийн дотоод систем (AI Studio) дотор харж байгаа тул хөтөч нь програм суулгах цэсийг түр нуусан байна. Програм болгож суулгахын тулд <strong>үндсэн bataartravel.mn</strong> хаягаар орно уу:
                    </p>
                    <a
                      href="https://bataartravel.mn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 text-amber-400 font-bold text-[11px] hover:bg-stone-800 transition shadow-sm mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> bataartravel.mn сайтыг шинэ цонхоор нээх ↗
                    </a>
                  </div>

                  {/* Microsoft Edge Instructions */}
                  <div className="space-y-2 text-[11.5px] text-stone-700">
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1 text-blue-700">
                      <span>Таны ашиглаж буй Microsoft Edge хөтөч дээр:</span>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex-1">
                        Шинэ таб нээгээд <strong className="text-stone-900">bataartravel.mn</strong> хаягаар орно.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex-1">
                        Edge хөтчийнхөө баруун дээд буланд байрлах <strong className="text-stone-900">3 цэг (...)</strong> товчийг дараад цэснээс <strong className="text-blue-700">"Apps" (Аппликейшн)</strong> сонголтыг сонгоно.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="flex-1">
                        <strong className="text-stone-900">"Install Bataar Travel"</strong> (эсвэл <em>"Install this site as an app"</em>) гэснийг сонгоод <strong className="text-blue-700">"Install"</strong> дарна.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div className="flex-1">
                        Таны Windows Taskbar болон Desktop дэлгэц дээр <strong className="text-stone-900">BataarTravel</strong> тусдаа бие даасан програм болж шууд гарч ирнэ!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white border border-stone-200 rounded-xl p-2.5 shadow-2xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs mb-0.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" /> Нүүр дэлгэц дээр
                  </div>
                  <div className="text-[10.5px] text-stone-600 leading-tight">
                    Броузер нээхгүйгээр 1 товшилтоор апп шиг нээгдэнэ
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-2.5 shadow-2xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs mb-0.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Офлайн горим
                  </div>
                  <div className="text-[10.5px] text-stone-600 leading-tight">
                    Говьд сүлжээ тасарсан ч мэдээллээ харна
                  </div>
                </div>
              </div>

              {/* Support footer */}
              <div className="bg-stone-100 rounded-xl p-3 flex items-center justify-between">
                <div className="text-[11px] text-stone-600">
                  Асууж тодруулах зүйл байвал:
                </div>
                <a
                  href="tel:+97672010099"
                  className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-amber-900 font-bold text-xs flex items-center gap-1 shadow-2xs hover:bg-stone-50"
                >
                  <Phone className="w-3 h-3 text-amber-600" /> +976 7201 0099
                </a>
              </div>

              <button
                onClick={() => setShowAppInstall(false)}
                className="w-full py-2 bg-stone-200/80 hover:bg-stone-300/80 text-stone-800 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                ← Буцах (AI Чат руу)
              </button>
            </div>
          )}

          {/* TAB 1: AI CHAT */}
          {!showAppInstall && activeTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9F6]">
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs ${
                        m.sender === "user"
                          ? "bg-amber-600 text-white font-medium rounded-tr-xs"
                          : "bg-white border border-stone-200/90 text-stone-900 rounded-tl-xs whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-stone-500">{m.timestamp}</span>
                      {m.action && (
                        <button
                          onClick={() => setActiveTab("booking")}
                          className="text-[10px] text-amber-700 hover:text-amber-800 font-bold underline flex items-center gap-1 cursor-pointer"
                        >
                          {m.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-stone-600 bg-white border border-stone-200 px-3 py-2 rounded-2xl w-fit shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200" />
                    <span className="text-[10px] ml-1 font-mono text-stone-500">Concierge typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Chips */}
              <div className="px-3 py-2 bg-[#F5EFEB]/90 border-t border-stone-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {t.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === 3) {
                        setActiveTab("booking");
                        setShowAppInstall(false);
                      } else if (chip.includes("Апп") || chip.includes("App") || chip.includes("앱") || chip.includes("应用") || chip.includes("アプリ") || chip.includes("Установить")) {
                        setShowAppInstall(true);
                      } else {
                        void handleSendMessage(chip);
                      }
                    }}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] border transition-colors cursor-pointer ${
                      idx === 3
                        ? "bg-amber-100/90 text-amber-900 border-amber-300 font-semibold"
                        : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSendMessage()}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 bg-[#FAF9F6] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
                <button
                  onClick={() => void handleSendMessage()}
                  aria-label="Send message"
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT BOOKING */}
          {!showAppInstall && activeTab === "booking" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#FAF9F6]">
              <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="font-['Cormorant_Garamond',serif] text-base">{t.bookingTitle}</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {copy.bookingDescription}
                </p>
              </div>

              {bookingSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{bookingSuccessMsg}</span>
                </div>
              )}

              <a href={'https://bataar-sanctuary-payments.erdii4812.workers.dev/booking?lang='+currentLang} className="block w-full py-3 text-center bg-stone-900 text-white font-bold rounded-xl">{t.bookingTitle} — QPay</a>
              <a target="_blank" rel="noopener noreferrer" className="block mt-3 rounded-xl border border-amber-300 p-3 text-center text-xs text-stone-900" href={'https://mail.google.com/mail/?view=cm&fs=1&to=bataartravel%40gmail.com&su='+encodeURIComponent(t.bookingTitle)+'&body='+encodeURIComponent(copy.bookingDescription)}>{copy.gmail}</a>
              <a className="block mt-2 text-center underline" href={'mailto:bataartravel@gmail.com?subject='+encodeURIComponent(t.bookingTitle)+'&body='+encodeURIComponent(copy.bookingDescription)}>{copy.emailApp}</a>
              <p className="text-stone-500">{copy.emailNotice}</p>
            </div>
          )}


          {/* TAB 5: TRAVEL SAFETY */}
          {!showAppInstall && activeTab === "safety" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#FAF9F6]">
              <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-['Cormorant_Garamond',serif] text-base">{t.safetyTitle}</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {currentLang === "mn" ? "Өмнөговь аймгийн Гурвантэс сум, Тост тосон бумба, Хэрмэн цавын онгон байгальд аялахад анхаарах зүйлс:" : "Essential guidelines for your Gobi expedition:"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-white border border-stone-200 rounded-2xl p-3 space-y-1 shadow-2xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-600" /> {t.safetyP1}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-3 space-y-1 shadow-2xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-600" /> {t.safetyP2}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-3 space-y-1 shadow-2xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-amber-600" /> {t.safetyP3}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <div>
                  <div className="font-bold text-stone-900">{t.campHotline}</div>
                  <div className="text-[11px] text-amber-800 font-mono font-semibold">+976 7201 0099 / +976 8822 3584</div>
                </div>

                <a
                  href="tel:+97672010099"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.callDirect}</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer Status Bar */}
          <div className="px-4 py-2 bg-[#F5EFEB] border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Bataar Sanctuary • Concierge Desk</span>
            </div>
            <span className="font-mono text-stone-600 uppercase font-semibold">Active: {currentLang}</span>
          </div>

        </div>
      )}
    </>
  );
};


