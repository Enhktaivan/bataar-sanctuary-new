import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  Calendar,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Settings,
  Database,
  RefreshCw,
  Phone,
  Globe,
  Download,
  Clock,
  Compass,
  CheckCircle2,
  Plus,
  Share2,
  ChevronDown,
  Info,
  MapPin,
  Wifi,
  Sun,
  Coffee,
  AlertTriangle
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  action?: {
    type: "book" | "email" | "notion";
    label: string;
  };
}

interface TouristInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  arrivalDate: string;
  departureDate: string;
  roomType: string;
  guests: number;
  notes: string;
  createdAt: string;
  status: "New" | "Contacted" | "Confirmed";
  language: string;
}

const DEFAULT_INQUIRIES: TouristInquiry[] = [
  {
    id: "inq-101",
    name: "Dr. Alexander Müller",
    email: "a.mueller@paleo-berlin.de",
    phone: "+49 170 829104",
    arrivalDate: "2026-07-12",
    departureDate: "2026-07-18",
    roomType: "Deluxe Wooden Lodge ($110/night)",
    guests: 2,
    notes: "Interested in visiting Khermen Tsav fossil beds and night stargazing. Need 4x4 airport transfer from Dalanzadgad.",
    createdAt: "2026-09-26 14:30",
    status: "New",
    language: "English"
  },
  {
    id: "inq-102",
    name: "Kim Min-ji (김민지)",
    email: "minji.kim@seoul-travel.kr",
    phone: "+82 10 9382 1102",
    arrivalDate: "2026-08-04",
    departureDate: "2026-08-08",
    roomType: "Family 2-Bedroom Suite ($160/night)",
    guests: 4,
    notes: "Family trip with 2 kids. Want camel sunset safari and private ger experience with Starlink Wi-Fi.",
    createdAt: "2026-09-25 18:45",
    status: "Contacted",
    language: "Korean"
  }
];

const INITIAL_WELCOME: ChatMessage = {
  id: "msg-0",
  sender: "assistant",
  text: `✨ **Welcome to Bataar Sanctuary (Батаарын Өлгий)!** 
I am your 24/7 AI Concierge & Expedition Coordinator.

How may I assist your Gobi desert journey today?
• 🏠 **Accommodations & Rates** (Deluxe $110, Standard $65, Family $160)
• 📍 **Logistics & 4x4 Transfers** from Dalanzadgad / Ulaanbaatar
• 🛰️ **Amenities:** 24/7 Starlink satellite Wi-Fi, 100% solar power & restaurant
• 🦖 **Field Expeditions:** Khermen Tsav canyons & dinosaur fossil beds

*Feel free to write in English, 한국어, 中文, 日本語, Deutsch, Français, or Монгол хэл!*`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
};

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "booking" | "email" | "notion" | "safety">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Inquiries state (synced with localStorage)
  const [inquiries, setInquiries] = useState<TouristInquiry[]>(() => {
    try {
      const saved = localStorage.getItem("bataar_crm_inquiries");
      return saved ? JSON.parse(saved) : DEFAULT_INQUIRIES;
    } catch {
      return DEFAULT_INQUIRIES;
    }
  });

  // Settings
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("bataar_gemini_api_key") || "");
  const [notionApiKey, setNotionApiKey] = useState(() => localStorage.getItem("bataar_notion_api_key") || "");
  const [notionDbId, setNotionDbId] = useState(() => localStorage.getItem("bataar_notion_db_id") || "");
  const [notionWebhookUrl, setNotionWebhookUrl] = useState(() => localStorage.getItem("bataar_notion_webhook") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Direct Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    arrivalDate: "2026-07-15",
    departureDate: "2026-07-20",
    roomType: "Deluxe Wooden Lodge ($110/night)",
    guests: 2,
    notes: ""
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Email generator state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(inquiries[0]?.id || "");
  const [customEmailPrompt, setCustomEmailPrompt] = useState("");
  const [emailTemplateType, setEmailTemplateType] = useState<"confirmation" | "quote" | "logistics" | "custom">("confirmation");
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("bataar_crm_inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    if (messagesEndRef.current && activeTab === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  const handleSaveSettings = () => {
    localStorage.setItem("bataar_gemini_api_key", geminiApiKey);
    localStorage.setItem("bataar_notion_api_key", notionApiKey);
    localStorage.setItem("bataar_notion_db_id", notionDbId);
    localStorage.setItem("bataar_notion_webhook", notionWebhookUrl);
    setShowSettings(false);
  };

  // Smart Offline Knowledge Base Responder
  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase();

    // Rates & Rooms
    if (q.includes("price") || q.includes("rate") || q.includes("cost") || q.includes("room") || q.includes("үнэ") || q.includes("өрөө") || q.includes("хоног") || q.includes("가격") || q.includes("房") || q.includes("preis")) {
      return `🏠 **Bataar Sanctuary Accommodations & Rates:**

1. **Deluxe Wooden Lodge (Eco-Room):**
   • **$110 USD / night** (Includes gourmet double breakfast)
   • Interior natural pine wood, cozy queen bed, heating & AC, private en-suite bathroom with 24/7 hot shower, large panoramic window, Starlink Wi-Fi.

2. **Standard Twin Room:**
   • **$65 USD / night**
   • 2 single beds, desert sunrise window, rustic wooden finish, private en-suite bathroom.

3. **Family 2-Bedroom Suite:**
   • **$160 USD / night**
   • 2 private bedrooms (Master queen + Twin second bedroom), spacious bathroom, accommodates 4-6 guests.

Click the **"Booking"** tab above to reserve your stay directly!`;
    }

    // Location & Transfers
    if (q.includes("location") || q.includes("where") || q.includes("how to get") || q.includes("reach") || q.includes("хаана") || q.includes("байршил") || q.includes("зам") || q.includes("위치") || q.includes("怎么去") || q.includes("wo ist")) {
      return `📍 **Camp Location & Travel Logistics:**

• **Sanctuary Location:** Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi Province, Mongolia (43.2081° N, 101.0543° E).
• **Distance from Ulaanbaatar:** ~850 km.
• **Recommended Route:**
  1. Domestic flight from Ulaanbaatar to **Dalanzadgad** (1 hour).
  2. Scenic 4x4 expedition drive (390 km) via Bayanzag Flaming Cliffs and Khongor Sand Dunes to Bataar Sanctuary in Gurvantes.
• **4x4 Private Transfers:** We provide rugged Toyota Land Cruiser transfers with experienced Gobi desert drivers.

Our team can arrange transfers directly upon your booking!`;
    }

    // Amenities (Wi-Fi, Solar, Water, Food)
    if (q.includes("wifi") || q.includes("wi-fi") || q.includes("internet") || q.includes("solar") || q.includes("water") || q.includes("food") || q.includes("restaurant") || q.includes("хоол") || q.includes("интернет") || q.includes("вакуум") || q.includes("와이파이") || q.includes("网络")) {
      return `🌿 **Eco-Luxury Desert Amenities:**

• 🛰️ **Starlink Satellite High-Speed Wi-Fi:** Reliable high-speed broadband throughout the camp, even in the heart of the Gobi desert.
• ☀️ **100% Green Off-Grid Solar Energy:** Silent 24/7 continuous electric power with lithium battery storage.
• 💧 **Deep Well Mineral Purified Water:** Fresh, high-grade tested drinking water and continuous hot showers.
• 🍲 **Gourmet Gobi Oasis Restaurant:** Organic pasture-raised Mongolian mutton/beef, homemade milk delicacies, plus full European and vegetarian/vegan menus, fresh brewed espresso coffee.
• 🔭 **Astronomy Stargazing Platform:** High-powered optical telescope for observing Saturn's rings, Jupiter, and the pristine Milky Way under zero light pollution!`;
    }

    // Dinosaurs & Expeditions
    if (q.includes("dino") || q.includes("fossil") || q.includes("khermen") || q.includes("nemegt") || q.includes("цав") || q.includes("үлэг гүрвэл") || q.includes("малтлага") || q.includes("공룡") || q.includes("恐龙") || q.includes("expedition")) {
      return `🦖 **Paleontological Expeditions & Fossil Sites:**

Bataar Sanctuary is the premier gateway to:
• **Khermen Tsav (The Grand Canyon of the Gobi):** Majestic red canyon cathedrals where thousands of Cretaceous skeletons including Tarbosaurus Bataar and Deinocheirus were uncovered.
• **Nemegt Basin & Bugiin Tsav:** World-famous dragon bone beds dating back 70 million years.
• **Field Paleontology Experience:** Hands-on virtual laboratory and guided field walks led by certified paleontological interpreters.
• **Snow Leopard Telemetry:** Join our conservationists on ridge excursions monitoring endangered snow leopards with automated trail cameras.`;
    }

    // Contact
    if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("холбоо") || q.includes("утас") || q.includes("전화") || q.includes("联系")) {
      return `📞 **Official Contact Information:**

• **Phone / WhatsApp:** 
  +976 7201 0099
  +976 8822 3584
  +976 9953 0099
  +976 9972 3336
• **Email:** btvmentogoo@gmail.com / info@bataarsanctuary.com
• **Address:** Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi, Mongolia.`;
    }

    return `Thank you for reaching out to **Bataar Sanctuary**!

We offer world-class eco-lodge accommodations ($65–$160/night), 100% solar power, Starlink satellite Wi-Fi, and guided paleontology expeditions across Khermen Tsav.

You can ask me about:
1. Room options and booking dates
2. 4x4 transfer logistics from Dalanzadgad or UB
3. Stargazing, dining, and camp facilities
4. Or switch to the **"Booking"** tab to reserve your dates!`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
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
      let replyText = "";

      if (geminiApiKey.trim()) {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        const systemInstruction = `You are the chief concierge and scientific expedition coordinator at "Bataar Sanctuary (Батаарын Өлгий)", an authentic luxury eco-lodge and paleontology basecamp located in Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi, Mongolia.
Camp details:
- Deluxe Room: $110/night (breakfast included, pine wood, private bath, AC, picture window, Starlink).
- Standard Room: $65/night (2 single beds, private bath).
- Family Suite: $160/night (2 bedrooms, 4-6 guests, private shower).
- 100% off-grid solar energy, pure deep well water, Starlink Wi-Fi, organic restaurant, high-powered astronomy telescope for stargazing.
- Expeditions: Khermen Tsav canyons, Nemegt basin, dinosaur fossil grounds, snow leopard tracking.
- Distance from UB: 850 km (or 1hr flight to Dalanzadgad + 390km 4x4 scenic drive).
- Contact: +976 7201 0099, +976 8822 3584. Email: btvmentogoo@gmail.com.
Tone: Warm, highly knowledgeable, professional, elegant. Respond in the EXACT language used by the guest.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userText,
          config: { systemInstruction }
        });

        replyText = response.text || generateLocalResponse(userText);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        replyText = generateLocalResponse(userText);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: {
            type: "book",
            label: "📅 Book This Stay"
          }
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "assistant",
          text: generateLocalResponse(userText),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: {
            type: "book",
            label: "📅 Book This Stay"
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Direct Booking Handler with Email Dispatch to btvmentogoo@gmail.com
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email) return;

    setIsSubmittingBooking(true);

    const newInquiry: TouristInquiry = {
      id: `inq-${Date.now().toString().slice(-4)}`,
      name: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
      arrivalDate: bookingForm.arrivalDate,
      departureDate: bookingForm.departureDate,
      roomType: bookingForm.roomType,
      guests: Number(bookingForm.guests),
      notes: bookingForm.notes,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "New",
      language: "Detected"
    };

    // 1. Save to local CRM
    setInquiries((prev) => [newInquiry, ...prev]);

    // 2. Dispatch real email notification to btvmentogoo@gmail.com via FormSubmit AJAX
    try {
      await fetch("https://formsubmit.co/ajax/btvmentogoo@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          _subject: `🏨 Шинэ захиалга: ${newInquiry.name} (${newInquiry.roomType}) - Батаарын өлгий`,
          Зочны_нэр: newInquiry.name,
          Имэйл: newInquiry.email,
          Утас: newInquiry.phone,
          Ирэх_өдөр: newInquiry.arrivalDate,
          Буцах_өдөр: newInquiry.departureDate,
          Өрөөний_төрөл: newInquiry.roomType,
          Зочдын_тоо: newInquiry.guests,
          Тэмдэглэл_хүсэлт: newInquiry.notes || "Байхгүй",
          Илгээсэн_огноо: newInquiry.createdAt
        })
      });
    } catch {
      // Continue even if offline
    }

    // 3. Post to Notion Webhook if present
    if (notionWebhookUrl) {
      try {
        fetch(notionWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newInquiry)
        }).catch(() => {});
      } catch {
        // ignore
      }
    }

    setIsSubmittingBooking(false);
    setBookingSuccessMsg(`Захиалгын хүсэлтийг хүлээн авлаа! Баталгаажуулах мэйл btvmentogoo@gmail.com болон таны ${newInquiry.email} хаяг руу илгээгдэж байна.`);

    // Reset after 3 seconds
    setTimeout(() => {
      setBookingSuccessMsg(null);
      setActiveTab("notion");
    }, 2500);
  };

  // Generate Email Reply for Manager
  const handleGenerateEmail = async () => {
    const inq = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0];
    if (!inq) return;

    setIsGeneratingEmail(true);

    let subject = "";
    let body = "";

    if (emailTemplateType === "confirmation") {
      subject = `Bataar Sanctuary Booking Confirmation & Expedition Details - ${inq.name}`;
      body = `Dear ${inq.name},

Warm greetings from the heart of the South Gobi desert!

Thank you for choosing Bataar Sanctuary (Батаарын Өлгий). We are delighted to confirm your reservation inquiry for our eco-lodge in the Tost Tosonbumba Nature Reserve.

Reservation Overview:
• Guest Name: ${inq.name}
• Check-in Date: ${inq.arrivalDate}
• Check-out Date: ${inq.departureDate}
• Accommodation: ${inq.roomType}
• Party Size: ${inq.guests} Guest(s)
• Special Notes: ${inq.notes || "None specified"}

What awaits you at Bataar Sanctuary:
• 100% Solar-Powered Luxury Lodge with 24/7 hot showers and heating
• Starlink Satellite High-Speed Wi-Fi throughout the camp
• Organic Pasture-to-Table Dining at our Gobi Oasis Restaurant
• Deep-Sky Stargazing through our optical astronomical telescope
• Gateway to the legendary Cretaceous fossil beds of Khermen Tsav

Next Steps:
Please confirm if you require 4x4 airport transfer from Dalanzadgad or direct expedition pickup. We will issue your official reservation invoice upon your reply.

If you have any urgent inquiries, feel free to reach our camp management directly at +976 7201 0099 or reply directly to this email.

Yours sincerely,

Bataar Sanctuary Hospitality & Expedition Desk
Tost Tosonbumba Nature Reserve, South Gobi, Mongolia
Web: https://odko-prog.github.io/bataar-sanctuary-new/
Email: btvmentogoo@gmail.com
Phone / WhatsApp: +976 7201 0099 / +976 8822 3584`;
    } else if (emailTemplateType === "quote") {
      subject = `Expedition Quote & Travel Guide for ${inq.name} • Bataar Sanctuary`;
      body = `Dear ${inq.name},

Thank you for your interest in exploring the South Gobi with Bataar Sanctuary!

We have prepared the following pricing and itinerary summary for your party of ${inq.guests}:

1. Accommodation:
• ${inq.roomType} — Includes full artisanal breakfast, Starlink Wi-Fi, and eco-lodge comforts.

2. Expedition Activities Available:
• Full-day guided 4x4 expedition to Khermen Tsav (The Grand Canyon of the Gobi)
• Hands-on fossil geology and virtual excavation lab orientation
• Sunset camel trek across golden dunes and stargazing sessions

3. Logistics:
• Private Toyota Land Cruiser 4x4 transfers from Dalanzadgad with experienced local drivers are available upon request.

Please let us know your preferred travel dates (${inq.arrivalDate} to ${inq.departureDate}), and we will reserve your private lodge immediately.

Warm desert regards,

Expedition Management Team
Bataar Sanctuary
Phone: +976 7201 0099 / +976 9953 0099
Email: btvmentogoo@gmail.com`;
    } else {
      subject = `Gobi Logistics & 4x4 Transfer Guide for ${inq.name} • Bataar Sanctuary`;
      body = `Dear ${inq.name},

We are excited to welcome you to Bataar Sanctuary in Gurvantes, South Gobi!

To ensure a smooth journey across the desert, here is the essential travel itinerary:

• Flight: Domestic flight from Ulaanbaatar (Chinggis Khaan Airport) to Dalanzadgad (approx. 1 hour).
• 4x4 Scenic Drive: Our Land Cruiser 4x4 will meet you at Dalanzadgad Airport. The drive to Bataar Sanctuary passes through the famous Bayanzag Flaming Cliffs and Khongor Sand Dunes.
• Camp Arrival: Check-in, welcome tea, and orientation under the pristine Gobi sky.

Camp Amenities:
• 24/7 Starlink Wi-Fi, 100% solar green power, deep well mineral water, organic dining.

We look forward to hosting your Cretaceous adventure!

Bataar Sanctuary Expedition Desk
Phone: +976 7201 0099
Email: btvmentogoo@gmail.com`;
    }

    if (geminiApiKey.trim() && customEmailPrompt.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        const res = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Draft a professional, warm email reply from "Bataar Sanctuary" camp manager to tourist: ${inq.name} (${inq.email}).
Dates: ${inq.arrivalDate} to ${inq.departureDate}, Room: ${inq.roomType}, Guests: ${inq.guests}, Notes: ${inq.notes}.
Special instructions: ${customEmailPrompt}.
Format output with Subject on line 1 (starting with "Subject: "), followed by the full email body.`
        });
        const fullText = res.text || "";
        const lines = fullText.split("\n");
        if (lines[0]?.toLowerCase().startsWith("subject:")) {
          subject = lines[0].replace(/subject:/i, "").trim();
          body = lines.slice(1).join("\n").trim();
        } else {
          body = fullText;
        }
      } catch {
        // fallback
      }
    }

    setGeneratedEmail({ subject, body });
    setIsGeneratingEmail(false);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(key);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ["Name,Email,Phone,Arrival,Departure,Room Type,Guests,Status,Language,Notes,Created At"];
    const rows = inquiries.map((i) =>
      `"${i.name}","${i.email}","${i.phone}","${i.arrivalDate}","${i.departureDate}","${i.roomType}",${i.guests},"${i.status}","${i.language}","${(i.notes || "").replace(/"/g, '""')}","${i.createdAt}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bataar_sanctuary_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Sleek Desert-Luxury Floating Trigger */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pointer-events-auto">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-full bg-stone-950/90 text-amber-200 border border-amber-500/40 shadow-2xl shadow-black/80 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-stone-950 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-stone-950 animate-ping" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-amber-300 font-['Plus_Jakarta_Sans',sans-serif]">
                Bataar Concierge & Booking
              </span>
              <span className="text-[9.5px] text-stone-400 tracking-wider">
                24/7 AI Хөтөч • Захиалга • CRM
              </span>
            </div>

            <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
              🇲🇳 🇬🇧 🇰🇷 🇨🇳
            </span>
          </button>
        )}
      </div>

      {/* Main Luxury Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[490px] h-[670px] max-h-[88vh] bg-stone-950/95 border border-amber-500/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 text-stone-100 font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/30 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Sparkles className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Cormorant_Garamond',serif] font-bold text-amber-200 text-base tracking-wide">
                    BATAAR SANCTUARY CONCIERGE
                  </h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">South Gobi Expedition & Reservation Desk</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-amber-500/20 text-amber-300" : "text-stone-400 hover:text-amber-300 hover:bg-stone-850"}`}
                title="Settings & API Keys"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="grid grid-cols-5 bg-stone-900/90 p-1 border-b border-stone-800/80 text-[11px] font-medium">
            <button
              onClick={() => { setActiveTab("chat"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "chat" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Чат</span>
            </button>

            <button
              onClick={() => { setActiveTab("booking"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "booking" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Захиалга</span>
            </button>

            <button
              onClick={() => { setActiveTab("email"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "email" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>AI Мэйл</span>
            </button>

            <button
              onClick={() => { setActiveTab("notion"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all relative ${
                activeTab === "notion" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Notion</span>
              {inquiries.some((i) => i.status === "New") && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-2 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab("safety"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "safety" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Санамж</span>
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="flex-1 p-5 overflow-y-auto bg-stone-950 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2 font-['Cormorant_Garamond',serif]">
                  <Settings className="w-4 h-4" /> Тохиргоо & Холболтууд
                </h4>
                <button onClick={() => setShowSettings(false)} className="text-stone-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email dispatch info */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Имэйл мэдэгдэл</span>
                <p className="text-stone-300 text-xs">
                  Жуулчин захиалга өгөхөд автоматаар <strong className="text-amber-200">btvmentogoo@gmail.com</strong> хаяг руу шууд илгээгдэнэ.
                </p>
              </div>

              {/* Gemini Key */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium flex items-center justify-between">
                  <span>Gemini API Key (Сонголтоор)</span>
                  <span className="text-[10px] text-amber-400">Gemini 3.8 Flash</span>
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
                />
                <p className="text-[10px] text-stone-500">
                  Хоосон орхисон ч баазын бүх өрөө, үнэ, маршрутыг 100% автоматаар хариулна.
                </p>
              </div>

              {/* Notion Token */}
              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                <label className="text-stone-300 font-medium">Notion Integration Token</label>
                <input
                  type="password"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="secret_..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              {/* Notion Webhook */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Auto-Sync Webhook (Make / Zapier / n8n)</label>
                <input
                  type="text"
                  value={notionWebhookUrl}
                  onChange={(e) => setNotionWebhookUrl(e.target.value)}
                  placeholder="https://hook.make.com/..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl transition-colors mt-4 shadow-lg shadow-amber-500/20"
              >
                Тохиргоог хадгалах
              </button>
            </div>
          )}

          {/* TAB 1: AI CHAT */}
          {!showSettings && activeTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                        m.sender === "user"
                          ? "bg-amber-500 text-stone-950 font-medium rounded-tr-sm"
                          : m.sender === "system"
                          ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200"
                          : "bg-stone-900/90 border border-stone-800 text-stone-200 rounded-tl-sm whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-stone-500">{m.timestamp}</span>
                      {m.action && (
                        <button
                          onClick={() => setActiveTab("booking")}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                        >
                          {m.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-stone-400 bg-stone-900/90 border border-stone-800 px-3 py-2 rounded-2xl w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-200" />
                    <span className="text-[10px] ml-1 font-mono">Bataar Concierge typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Chips */}
              <div className="px-3 py-2 bg-stone-900/70 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setInputMessage("What are the room rates and amenities?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full text-[11px] border border-stone-700/50 transition-colors"
                >
                  💵 Room Rates
                </button>
                <button
                  onClick={() => setInputMessage("How do we get to Bataar Sanctuary from UB?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full text-[11px] border border-stone-700/50 transition-colors"
                >
                  📍 4x4 Route
                </button>
                <button
                  onClick={() => setInputMessage("Do you have Starlink Wi-Fi and solar power?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full text-[11px] border border-stone-700/50 transition-colors"
                >
                  🛰️ Starlink Wi-Fi
                </button>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="whitespace-nowrap px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-full text-[11px] border border-amber-500/40 font-medium transition-colors"
                >
                  📅 Book Lodge
                </button>
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-stone-900/95 border-t border-stone-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask anything in English, 한국어, 中文, Монгол..."
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 rounded-xl font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT BOOKING & DATES */}
          {!showSettings && activeTab === "booking" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-['Cormorant_Garamond',serif] text-sm">Өрөөний захиалга & Бэлэн байдал</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Захиалгын мэдээлэл нь Notion CRM дээр хадгалагдаж, <strong className="text-amber-200">btvmentogoo@gmail.com</strong> хаяг руу шууд илгээгдэнэ.
                </p>
              </div>

              {bookingSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{bookingSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-3">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-2.5 focus-within:border-amber-500/50">
                    <label className="block text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Ирэх өдөр (Check-in)</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.arrivalDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, arrivalDate: e.target.value })}
                      className="w-full bg-transparent text-stone-100 text-xs font-semibold focus:outline-none [color-scheme:dark] mt-1"
                    />
                  </div>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-2.5 focus-within:border-amber-500/50">
                    <label className="block text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Буцах өдөр (Check-out)</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.departureDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, departureDate: e.target.value })}
                      className="w-full bg-transparent text-stone-100 text-xs font-semibold focus:outline-none [color-scheme:dark] mt-1"
                    />
                  </div>
                </div>

                {/* Room Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Өрөөний төрөл сонгох</label>
                  <select
                    value={bookingForm.roomType}
                    onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Deluxe Wooden Lodge ($110/night)">Deluxe Wooden Lodge — $110/night (Queen bed, AC, Starlink, Private Bath)</option>
                    <option value="Standard Twin Room ($65/night)">Standard Twin Room — $65/night (2 Single beds, Private Bath)</option>
                    <option value="Family 2-Bedroom Suite ($160/night)">Family 2-Bedroom Suite — $160/night (4-6 Guests, Private Bath)</option>
                  </select>
                </div>

                {/* Guests */}
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Зочдын тоо</label>
                  <select
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 Guest (Хүн)</option>
                    <option value={2}>2 Guests (Хүн)</option>
                    <option value={3}>3 Guests (Хүн)</option>
                    <option value={4}>4 Guests (Хүн)</option>
                    <option value={6}>6+ Guests (Бүлэг аялал)</option>
                  </select>
                </div>

                {/* Contact info */}
                <div className="space-y-2 pt-1 border-t border-stone-800/80">
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="Таны нэр (Full Name) *"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="Имэйл хаяг *"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="Утас / WhatsApp"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Тусгай хүсэлт (4x4 тосож авах, тэмээ унах, Хэрмэн цав аялах...)"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-stone-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingBooking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Илгээж байна...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Захиалга илгээх (btvmentogoo@gmail.com-д очно)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: AI EMAIL REPLY GENERATOR */}
          {!showSettings && activeTab === "email" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="font-['Cormorant_Garamond',serif] text-sm">Гадаад жуулчинд хариу илгээх (AI Reply)</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Ирсэн хүсэлтийг сонгоод мэргэжлийн түвшний англи хариуг 1 товшилтоор үүсгэж шууд Gmail-ээр явуулна.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Жуулчны захиалгыг сонгох:</label>
                <select
                  value={selectedInquiryId}
                  onChange={(e) => setSelectedInquiryId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  {inquiries.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {inq.name} ({inq.roomType.slice(0, 20)} • {inq.arrivalDate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setEmailTemplateType("confirmation")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    emailTemplateType === "confirmation"
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  1. Баталгаажуулах
                </button>
                <button
                  onClick={() => setEmailTemplateType("quote")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    emailTemplateType === "quote"
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  2. Үнийн санал
                </button>
                <button
                  onClick={() => setEmailTemplateType("logistics")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    emailTemplateType === "logistics"
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  3. 4x4 Зам чиглэл
                </button>
              </div>

              <button
                onClick={handleGenerateEmail}
                disabled={isGeneratingEmail}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGeneratingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Имэйл боловсруулж байна...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-stone-950" />
                    <span>Бэлэн хариу имэйл бэлтгэх</span>
                  </>
                )}
              </button>

              {generatedEmail && (
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Бэлэн болсон имэйл:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, "email")}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] flex items-center gap-1 border border-stone-700 cursor-pointer"
                      >
                        {copySuccess === "email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copySuccess === "email" ? "Хуулагдлаа!" : "Хуулах"}</span>
                      </button>

                      {(() => {
                        const inq = inquiries.find((i) => i.id === selectedInquiryId);
                        const mailtoHref = `mailto:${inq?.email || ""}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
                        return (
                          <a
                            href={mailtoHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-amber-500 text-stone-950 rounded-lg text-[10px] flex items-center gap-1 font-bold shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Gmail дээр нээх</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 space-y-2">
                    <div className="border-b border-stone-800 pb-1.5 font-semibold text-stone-200 text-[11px]">
                      <span className="text-stone-500">Гарчиг: </span>
                      {generatedEmail.subject}
                    </div>
                    <div className="text-stone-300 whitespace-pre-line font-mono text-[10.5px] max-h-48 overflow-y-auto leading-relaxed">
                      {generatedEmail.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTION CRM & DATABASE */}
          {!showSettings && activeTab === "notion" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5 font-['Cormorant_Garamond',serif]">
                    <Database className="w-4 h-4" /> Захиалгын нэгдсэн сан (CRM)
                  </h4>
                  <p className="text-[10px] text-stone-400">Нийт {inquiries.length} жуулчны захиалга бүртгэгдсэн</p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
                  title="CSV татаж авах"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Notion CSV татах</span>
                </button>
              </div>

              {/* Inquiry List */}
              <div className="space-y-2.5">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-stone-900/90 border border-stone-800/80 rounded-2xl p-3 space-y-2 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{inq.name}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                              inq.status === "New"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : inq.status === "Contacted"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                          {inq.roomType} • {inq.guests} Зочин
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-500 font-mono">{inq.arrivalDate}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-300 bg-stone-950/60 p-2 rounded-xl">
                      <div>📧 {inq.email}</div>
                      <div>📱 {inq.phone || "Утас байхгүй"}</div>
                      <div className="col-span-2 text-stone-400 italic text-[10px] mt-0.5">
                        "{inq.notes || "Тусгай тэмдэглэл байхгүй"}"
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setInquiries((prev) =>
                              prev.map((i) => (i.id === inq.id ? { ...i, status: "Contacted" } : i))
                            );
                          }}
                          className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px]"
                        >
                          Холбогдсон
                        </button>
                        <button
                          onClick={() => {
                            setInquiries((prev) =>
                              prev.map((i) => (i.id === inq.id ? { ...i, status: "Confirmed" } : i))
                            );
                          }}
                          className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-[10px]"
                        >
                          Баталгаажсан
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedInquiryId(inq.id);
                          setActiveTab("email");
                        }}
                        className="text-amber-400 hover:text-amber-300 font-semibold text-[10.5px] flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Хариу мэйл бичих</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TRAVEL SAFETY & QUICK UTILITIES */}
          {!showSettings && activeTab === "safety" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-['Cormorant_Garamond',serif] text-sm">Хэрмэн цав & Говийн аяллын санамж</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Өмнөговь аймгийн Гурвантэс сум, Тост тосон бумба, Хэрмэн цавын онгон байгальд аялахад анхаарах зүйлс:
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" /> 1. Тээврийн хэрэгсэл ба Зам чиглэл
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Зөвхөн өндөр тэнхлэгтэй, 4х4 бүрэн хөтлөгчтэй Land Cruiser зэрэг машинтай явах. Говийн элсэнд суух эрсдэлтэй тул туршлагатай орон нутгийн жолоочтой зорчих нь аюулгүй.
                  </p>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sun className="w-4 h-4" /> 2. Ус, нарны хамгаалалт & Салхи
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Нэг хүнд өдөрт хамгийн багадаа 3-4 литр ундны цэвэр ус тооцох. Нарны тос, хүзүүний алчуур, нарны шил болон оройн жиндэлтэд зориулсан дулаан хүрэм заавал авч явах.
                  </p>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> 3. Холбоо бариа & Баазын тохь тух
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Батаарын өлгий бааз дээр Starlink сансрын өндөр хурдны интернэт, гүний цэвэр ус болон 24/7 цахилгаан эрчим хүчээр бүрэн хангагдсан.
                  </p>
                </div>
              </div>

              {/* Direct Hotline */}
              <div className="p-3 bg-stone-900/90 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-200">Баазын шуурхай утас</div>
                  <div className="text-[11px] text-amber-400 font-mono">+976 7201 0099 / +976 8822 3584</div>
                </div>

                <a
                  href="tel:+97672010099"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Шууд залгах</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer Status Bar */}
          <div className="px-4 py-2 bg-stone-950 border-t border-stone-900 flex items-center justify-between text-[10px] text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Bataar Sanctuary • Tost Tosonbumba</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-mono">v2.5 Luxury Concierge</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
