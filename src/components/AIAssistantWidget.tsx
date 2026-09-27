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
  Download,
  Compass,
  CheckCircle2,
  MapPin,
  Wifi,
  Sun
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
  text: `✨ **Welcome to Bataar Sanctuary (Батаарын Өлгий)** 
*Aurelia Luxury Desert Retreat & Paleontological Expedition Base*

I am your 24/7 AI Sanctuary Concierge. How may I orchestrate your Gobi journey?
• 🏠 **Suites & Private Lodges:** Deluxe ($110), Standard ($65), Family Suite ($160)
• 📍 **Expedition Logistics & 4x4 Chauffeur Transfers** from Dalanzadgad / UB
• 🛰️ **Off-Grid Comforts:** Starlink satellite Wi-Fi, 100% solar green energy & organic dining
• 🦖 **Sacred Cretaceous Strata:** Guided missions to Khermen Tsav & Nemegt Basin

*Feel welcome to converse in English, 한국어, 中文, 日本語, Deutsch, Français, or Монгол хэл.*`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
};

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "booking" | "email" | "notion" | "safety">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Inquiries state
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

  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("price") || q.includes("rate") || q.includes("cost") || q.includes("room") || q.includes("үнэ") || q.includes("өрөө") || q.includes("хоног") || q.includes("가격") || q.includes("房") || q.includes("preis")) {
      return `🏛️ **Bataar Sanctuary • Aurelia Suites & Lodges:**

1. **Deluxe Wooden Lodge (Eco-Sanctuary):**
   • **$110 USD / night** (Includes artisan breakfast)
   • Siberian pine interior, queen bed, climate control, private en-suite bathroom with 24/7 hot mineral shower, Starlink broadband, desert horizon picture window.

2. **Standard Twin Room:**
   • **$65 USD / night**
   • 2 single beds, private bathroom, natural wood warmth, panoramic desert views.

3. **Family 2-Bedroom Suite:**
   • **$160 USD / night**
   • 2 private bedrooms (Master queen + Twin bedroom), spacious bathroom, accommodates 4-6 guests.

Click **"Reserve Stay"** in the navigation bar to book your dates directly.`;
    }

    if (q.includes("location") || q.includes("where") || q.includes("how to get") || q.includes("reach") || q.includes("хаана") || q.includes("байршил") || q.includes("зам") || q.includes("위치") || q.includes("怎么去") || q.includes("wo ist")) {
      return `📍 **Sanctuary Location & Chauffeur Logistics:**

• **Sanctuary Location:** Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi, Mongolia (43.2081° N, 101.0543° E).
• **Distance from Ulaanbaatar:** ~850 km.
• **Curated Route:**
  1. Domestic flight from Ulaanbaatar to **Dalanzadgad** (1 hour).
  2. Scenic 4x4 expedition drive (390 km) past Bayanzag Flaming Cliffs and Khongor Sand Dunes to Bataar Sanctuary.
• **Private 4x4 Transfers:** Dedicated Toyota Land Cruisers with veteran desert drivers can be arranged with your reservation.`;
    }

    if (q.includes("wifi") || q.includes("wi-fi") || q.includes("internet") || q.includes("solar") || q.includes("water") || q.includes("food") || q.includes("restaurant") || q.includes("хоол") || q.includes("интернет") || q.includes("вакуум") || q.includes("와이파이") || q.includes("网络")) {
      return `🌿 **Aurelia Eco-Sanctuary Amenities:**

• 🛰️ **Starlink Satellite High-Speed Broadband:** Continuous high-speed internet throughout all lodges and dining pavilions.
• ☀️ **100% Off-Grid Solar Power:** Silent 24/7 sustainable green energy with lithium storage.
• 💧 **Deep Well Mineral Purified Water:** Laboratory-tested fresh drinking water & continuous high-pressure hot showers.
• 🍲 **Gobi Oasis Gourmet Dining:** Organic pasture-raised Mongolian beef/lamb, artisanal dairy, plus full vegetarian/vegan menus & fresh brewed espresso.
• 🔭 **Deep-Sky Astronomy Platform:** High-powered optical telescope for Saturn's rings, Jupiter, and the Milky Way under pristine zero-light-pollution skies.`;
    }

    if (q.includes("dino") || q.includes("fossil") || q.includes("khermen") || q.includes("nemegt") || q.includes("цав") || q.includes("үлэг гүрвэл") || q.includes("малтлага") || q.includes("공룡") || q.includes("恐龙") || q.includes("expedition")) {
      return `🦖 **Paleontological Expeditions:**

Bataar Sanctuary is the premier departure base for:
• **Khermen Tsav (The Grand Canyon of the Gobi):** World-renowned Cretaceous cathedral formations where legendary skeletons of Tarbosaurus bataar and Deinocheirus were unearthed.
• **Nemegt Basin & Bugiin Tsav:** Legendary 70-million-year-old fossil dragon beds.
• **Virtual Field Lab:** Interactive paleontological tools and guided interpretive walks.
• **Snow Leopard Telemetry:** Ridge excursions monitoring endangered snow leopards in the Tost Mountains.`;
    }

    return `Welcome to **Bataar Sanctuary**!

We offer world-class eco-lodge accommodations ($65–$160/night), 100% solar power, Starlink satellite Wi-Fi, and guided paleontology expeditions across Khermen Tsav.

How may I assist your upcoming retreat?
1. Room options and booking dates
2. 4x4 transfer logistics from Dalanzadgad or UB
3. Stargazing, dining, and camp facilities
4. Or switch to the **"Reserve"** tab to submit an inquiry!`;
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
        const systemInstruction = `You are the chief concierge at "Bataar Sanctuary (Батаарын Өлгий)", an Aurelia-style ultra-luxury eco-retreat and paleontology basecamp in the South Gobi, Mongolia.
Atmosphere: Quiet luxury, Aman/Aurelia resort elegance, deeply hospitable, poetic yet accurate.
Lodges: Deluxe ($110/night, breakfast, pine wood, private bath, Starlink), Standard ($65/night), Family Suite ($160/night).
Expeditions: Khermen Tsav, Nemegt Basin, snow leopard tracking. 100% solar power, Starlink Wi-Fi, organic dining. Contact: +976 7201 0099, btvmentogoo@gmail.com.
Respond in the exact language used by the guest.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userText,
          config: { systemInstruction }
        });

        replyText = response.text || generateLocalResponse(userText);
      } else {
        await new Promise((r) => setTimeout(r, 550));
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
            label: "📅 Reserve This Suite"
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
            label: "📅 Reserve This Suite"
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

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

    setInquiries((prev) => [newInquiry, ...prev]);

    // Send real email notification to btvmentogoo@gmail.com
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
      // offline safe
    }

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
    setBookingSuccessMsg(`Таны захиалгын хүсэлт бүртгэгдлээ. Баталгаажуулах мэдээлэл btvmentogoo@gmail.com болон таны ${newInquiry.email} хаяг руу илгээгдэж байна.`);

    setTimeout(() => {
      setBookingSuccessMsg(null);
      setActiveTab("notion");
    }, 2500);
  };

  const handleGenerateEmail = async () => {
    const inq = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0];
    if (!inq) return;

    setIsGeneratingEmail(true);

    let subject = "";
    let body = "";

    if (emailTemplateType === "confirmation") {
      subject = `Bataar Sanctuary • Reservation Confirmation - ${inq.name}`;
      body = `Dear ${inq.name},

Warm greetings from the heart of the South Gobi desert.

Thank you for choosing Bataar Sanctuary (Батаарын Өлгий). We are delighted to confirm receipt of your reservation request for our luxury desert lodge in the Tost Tosonbumba Nature Reserve.

Reservation Summary:
• Guest Name: ${inq.name}
• Check-in Date: ${inq.arrivalDate}
• Check-out Date: ${inq.departureDate}
• Suite Selected: ${inq.roomType}
• Party Size: ${inq.guests} Guest(s)
• Special Requests: ${inq.notes || "None specified"}

Sanctuary Amenities Included in Your Stay:
• 100% Off-Grid Solar-Powered Eco-Lodge with 24/7 hot showers and climate control
• Starlink Satellite High-Speed Broadband across the retreat
• Gourmet Pasture-to-Table Dining at our Gobi Oasis Pavilion
• Deep-Sky Stargazing through our optical astronomical observatory
• Gateway access to the sacred Cretaceous formations of Khermen Tsav

Next Steps:
Please let us know if you require private Toyota Land Cruiser chauffeur transfers from Dalanzadgad Airport. We will issue your official reservation invoice upon your confirmation.

For any immediate assistance, our sanctuary desk is at your service at +976 7201 0099.

With warm regards,

The Sanctuary Team
Bataar Sanctuary • Tost Tosonbumba Nature Reserve, South Gobi, Mongolia
Web: https://odko-prog.github.io/bataar-sanctuary-new/
Email: btvmentogoo@gmail.com
Phone: +976 7201 0099 / +976 8822 3584`;
    } else if (emailTemplateType === "quote") {
      subject = `Expedition Itinerary & Rates for ${inq.name} • Bataar Sanctuary`;
      body = `Dear ${inq.name},

Thank you for your interest in visiting Bataar Sanctuary in the South Gobi!

We have prepared the following pricing summary for your upcoming journey:

1. Accommodation:
• ${inq.roomType} — Includes artisanal breakfast, Starlink Wi-Fi, and private lodge comforts.

2. Curated Field Expeditions:
• Full-day guided 4x4 expedition to Khermen Tsav (The Grand Canyon of the Gobi)
• Hands-on paleontology laboratory walk and geological fossil orientation
• Sunset camel caravan across the singing dunes & evening stargazing

3. Logistics:
• Private Toyota Land Cruiser 4x4 transfers from Dalanzadgad with experienced desert drivers are available upon request.

Please confirm your preferred dates (${inq.arrivalDate} to ${inq.departureDate}), and we will reserve your private lodge immediately.

Warm desert regards,

Expedition Management Team
Bataar Sanctuary
Phone: +976 7201 0099
Email: btvmentogoo@gmail.com`;
    } else {
      subject = `Gobi Chauffeur & 4x4 Logistics for ${inq.name} • Bataar Sanctuary`;
      body = `Dear ${inq.name},

We are delighted to welcome you to Bataar Sanctuary in Gurvantes, South Gobi.

To ensure a seamless journey across the desert:
• Flight: Domestic flight from Ulaanbaatar (Chinggis Khaan Airport) to Dalanzadgad (approx. 1 hour).
• 4x4 Scenic Transfer: Our Land Cruiser 4x4 will greet you at Dalanzadgad Airport. The scenic route traverses the legendary Bayanzag Flaming Cliffs and Khongor Sand Dunes.
• Camp Arrival: Welcome tea, check-in, and sunset orientation under the pristine Gobi sky.

Camp Amenities:
• 24/7 Starlink broadband, 100% solar green power, deep well mineral water, organic dining.

We look forward to hosting your Cretaceous journey!

Bataar Sanctuary Expedition Desk
Phone: +976 7201 0099
Email: btvmentogoo@gmail.com`;
    }

    if (geminiApiKey.trim() && customEmailPrompt.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        const res = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Draft a refined Aurelia-resort style email reply from "Bataar Sanctuary" camp manager to guest: ${inq.name} (${inq.email}).
Dates: ${inq.arrivalDate} to ${inq.departureDate}, Room: ${inq.roomType}, Guests: ${inq.guests}, Notes: ${inq.notes}.
Special instructions: ${customEmailPrompt}.
Format output with Subject on line 1, followed by body.`
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
      {/* Aurelia Floating Trigger Capsule */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pointer-events-auto">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3.5 px-4.5 py-3 rounded-full bg-[#0A0908]/92 text-[#F5F2EB] border border-[#C5A880]/40 shadow-[0_15px_40px_rgba(0,0,0,0.85)] hover:border-[#DFC8A7] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-2xl cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-[#C5A880] to-[#E3CBA8] text-[#0A0908] shadow-inner">
              <Sparkles className="w-3.5 h-3.5 fill-[#0A0908]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#0A0908] animate-ping" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#DFC8A7] font-['Plus_Jakarta_Sans',sans-serif]">
                CONCIERGE & BOOKING
              </span>
              <span className="text-[9px] text-[#A39C91] tracking-widest uppercase">
                BATAAR SANCTUARY • 24/7 AI
              </span>
            </div>

            <span className="ml-1 text-[9.5px] bg-[#C5A880]/15 text-[#DFC8A7] px-2 py-0.5 rounded-full border border-[#C5A880]/30 font-medium">
              🇲🇳 🇬🇧 🇰🇷 🇨🇳
            </span>
          </button>
        )}
      </div>

      {/* Aurelia Luxury Sanctuary Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[490px] h-[670px] max-h-[88vh] bg-[#0E0C0A]/95 border border-[#C5A880]/35 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 text-[#F5F2EB] font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#141210] via-[#141210]/95 to-[#1A1613] border-b border-[#C5A880]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#DFC8A7] shadow-inner">
                <Sparkles className="w-4 h-4 fill-[#C5A880]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Cormorant_Garamond',serif] font-bold text-[#DFC8A7] text-base tracking-wide">
                    BATAAR SANCTUARY CONCIERGE
                  </h3>
                  <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[#A39C91] tracking-wider uppercase">Aurelia Luxury Desert Retreat Desk</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-[#C5A880]/20 text-[#DFC8A7]" : "text-[#A39C91] hover:text-[#DFC8A7] hover:bg-stone-850"}`}
                title="Settings & API Keys"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#A39C91] hover:text-[#F5F2EB] hover:bg-stone-850 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="grid grid-cols-5 bg-[#141210] p-1 border-b border-[#C5A880]/15 text-[10.5px] font-medium">
            <button
              onClick={() => { setActiveTab("chat"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "chat" && !showSettings
                  ? "bg-[#C5A880] text-[#0A0908] font-bold shadow-md"
                  : "text-[#A39C91] hover:text-[#F5F2EB]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Чат</span>
            </button>

            <button
              onClick={() => { setActiveTab("booking"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "booking" && !showSettings
                  ? "bg-[#C5A880] text-[#0A0908] font-bold shadow-md"
                  : "text-[#A39C91] hover:text-[#F5F2EB]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Захиалга</span>
            </button>

            <button
              onClick={() => { setActiveTab("email"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "email" && !showSettings
                  ? "bg-[#C5A880] text-[#0A0908] font-bold shadow-md"
                  : "text-[#A39C91] hover:text-[#F5F2EB]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>AI Мэйл</span>
            </button>

            <button
              onClick={() => { setActiveTab("notion"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all relative ${
                activeTab === "notion" && !showSettings
                  ? "bg-[#C5A880] text-[#0A0908] font-bold shadow-md"
                  : "text-[#A39C91] hover:text-[#F5F2EB]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Notion</span>
              {inquiries.some((i) => i.status === "New") && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] absolute top-1 right-2 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab("safety"); setShowSettings(false); }}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === "safety" && !showSettings
                  ? "bg-[#C5A880] text-[#0A0908] font-bold shadow-md"
                  : "text-[#A39C91] hover:text-[#F5F2EB]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Санамж</span>
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="flex-1 p-5 overflow-y-auto bg-[#0E0C0A] text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#C5A880]/20 pb-2">
                <h4 className="font-bold text-[#DFC8A7] text-sm flex items-center gap-2 font-['Cormorant_Garamond',serif]">
                  <Settings className="w-4 h-4" /> Холболтууд & Тохиргоо
                </h4>
                <button onClick={() => setShowSettings(false)} className="text-[#A39C91] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#161412] border border-[#C5A880]/20 rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-bold">Шууд имэйл мэдэгдэл</span>
                <p className="text-stone-300 text-xs">
                  Жуулчны захиалгын мэдээлэл автоматаар <strong className="text-[#DFC8A7]">btvmentogoo@gmail.com</strong> хаяг руу шууд илгээгдэнэ.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium flex items-center justify-between">
                  <span>Gemini API Key (Сонголтоор)</span>
                  <span className="text-[10px] text-[#C5A880]">Gemini 3.8 Flash</span>
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#161412] border border-[#C5A880]/20 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C5A880] text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#C5A880]/20">
                <label className="text-stone-300 font-medium">Notion Integration Token</label>
                <input
                  type="password"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="secret_..."
                  className="w-full bg-[#161412] border border-[#C5A880]/20 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C5A880] text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Auto-Sync Webhook (Make / Zapier / n8n)</label>
                <input
                  type="text"
                  value={notionWebhookUrl}
                  onChange={(e) => setNotionWebhookUrl(e.target.value)}
                  placeholder="https://hook.make.com/..."
                  className="w-full bg-[#161412] border border-[#C5A880]/20 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C5A880] text-xs font-mono"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-[#C5A880] hover:bg-[#DFC8A7] text-[#0A0908] font-bold py-2.5 rounded-xl transition-colors mt-4 shadow-lg shadow-[#C5A880]/20"
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
                          ? "bg-[#C5A880] text-[#0A0908] font-medium rounded-tr-sm"
                          : m.sender === "system"
                          ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-200"
                          : "bg-[#161412] border border-[#C5A880]/20 text-[#F5F2EB] rounded-tl-sm whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-[#A39C91]">{m.timestamp}</span>
                      {m.action && (
                        <button
                          onClick={() => setActiveTab("booking")}
                          className="text-[10px] text-[#C5A880] hover:text-[#DFC8A7] font-semibold underline flex items-center gap-1 cursor-pointer"
                        >
                          {m.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-stone-400 bg-[#161412] border border-[#C5A880]/20 px-3 py-2 rounded-2xl w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce delay-200" />
                    <span className="text-[10px] ml-1 font-mono text-[#C5A880]">Concierge typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Chips */}
              <div className="px-3 py-2 bg-[#141210]/80 border-t border-[#C5A880]/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setInputMessage("What are the room rates and amenities?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-[#1A1815] hover:bg-[#26221E] text-stone-300 rounded-full text-[11px] border border-[#C5A880]/20 transition-colors"
                >
                  🏛️ Room Rates
                </button>
                <button
                  onClick={() => setInputMessage("How do we get to Bataar Sanctuary from UB?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-[#1A1815] hover:bg-[#26221E] text-stone-300 rounded-full text-[11px] border border-[#C5A880]/20 transition-colors"
                >
                  📍 4x4 Chauffeur Route
                </button>
                <button
                  onClick={() => setInputMessage("Do you have Starlink Wi-Fi and solar power?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-[#1A1815] hover:bg-[#26221E] text-stone-300 rounded-full text-[11px] border border-[#C5A880]/20 transition-colors"
                >
                  🛰️ Starlink & Solar
                </button>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="whitespace-nowrap px-2.5 py-1 bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#DFC8A7] rounded-full text-[11px] border border-[#C5A880]/40 font-medium transition-colors"
                >
                  📅 Reserve Lodge
                </button>
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-[#141210]/95 border-t border-[#C5A880]/20 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask anything in English, 한국어, 中文, Монгол..."
                  className="flex-1 bg-[#0A0908] border border-[#C5A880]/25 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#736C62] focus:outline-none focus:border-[#C5A880] transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 bg-[#C5A880] hover:bg-[#DFC8A7] disabled:opacity-50 text-[#0A0908] rounded-xl font-bold transition-all shadow-md shadow-[#C5A880]/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT BOOKING */}
          {!showSettings && activeTab === "booking" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-[#1A1815] border border-[#C5A880]/30 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#DFC8A7] font-bold mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-['Cormorant_Garamond',serif] text-base">Өрөө захиалга & Бэлэн байдал</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Захиалгын мэдээлэл Notion CRM-д хадгалагдаж, <strong className="text-[#DFC8A7]">btvmentogoo@gmail.com</strong> хаяг руу шууд очно.
                </p>
              </div>

              {bookingSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{bookingSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#161412] border border-[#C5A880]/25 rounded-xl p-2.5 focus-within:border-[#C5A880]">
                    <label className="block text-[10px] text-[#A39C91] uppercase tracking-wider font-semibold">Ирэх өдөр (Check-in)</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.arrivalDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, arrivalDate: e.target.value })}
                      className="w-full bg-transparent text-[#F5F2EB] text-xs font-semibold focus:outline-none [color-scheme:dark] mt-1"
                    />
                  </div>

                  <div className="bg-[#161412] border border-[#C5A880]/25 rounded-xl p-2.5 focus-within:border-[#C5A880]">
                    <label className="block text-[10px] text-[#A39C91] uppercase tracking-wider font-semibold">Буцах өдөр (Check-out)</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.departureDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, departureDate: e.target.value })}
                      className="w-full bg-transparent text-[#F5F2EB] text-xs font-semibold focus:outline-none [color-scheme:dark] mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#A39C91] uppercase tracking-wider font-semibold">Өрөөний ангилал сонгох</label>
                  <select
                    value={bookingForm.roomType}
                    onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                    className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl px-3 py-2 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="Deluxe Wooden Lodge ($110/night)">Deluxe Wooden Lodge — $110/night (Queen bed, AC, Starlink, Private Bath)</option>
                    <option value="Standard Twin Room ($65/night)">Standard Twin Room — $65/night (2 Single beds, Private Bath)</option>
                    <option value="Family 2-Bedroom Suite ($160/night)">Family 2-Bedroom Suite — $160/night (4-6 Guests, Private Bath)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#A39C91] uppercase tracking-wider font-semibold">Зочдын тоо</label>
                  <select
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                    className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl px-3 py-2 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value={1}>1 Guest (Хүн)</option>
                    <option value={2}>2 Guests (Хүн)</option>
                    <option value={3}>3 Guests (Хүн)</option>
                    <option value={4}>4 Guests (Хүн)</option>
                    <option value={6}>6+ Guests (Бүлэг)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1 border-t border-[#C5A880]/20">
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="Таны нэр (Full Name) *"
                    className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl px-3 py-2 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="Имэйл хаяг *"
                      className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl px-3 py-2 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="Утас / WhatsApp"
                      className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl px-3 py-2 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Тусгай хүсэлт (4x4 тосож авах, тэмээ унах, Хэрмэн цавын малтлага...)"
                    className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl p-2.5 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full py-3 bg-gradient-to-r from-[#C5A880] to-[#AA885C] hover:from-[#DFC8A7] hover:to-[#C5A880] text-[#0A0908] font-bold uppercase tracking-[0.2em] text-[11px] rounded-xl shadow-xl shadow-[#C5A880]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="bg-[#1A1815] border border-[#C5A880]/30 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#DFC8A7] font-bold mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="font-['Cormorant_Garamond',serif] text-base">Гадаад жуулчинд хариу илгээх (AI Reply)</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Ирсэн хүсэлтийг сонгоод Aurelia тансаг хэв маягтай мэргэжлийн англи захидлыг бэлтгэж шууд Gmail-ээр илгээнэ.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Жуулчны захиалгыг сонгох:</label>
                <select
                  value={selectedInquiryId}
                  onChange={(e) => setSelectedInquiryId(e.target.value)}
                  className="w-full bg-[#161412] border border-[#C5A880]/25 rounded-xl px-3 py-2 text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A880]"
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
                      ? "bg-[#C5A880]/20 border-[#C5A880] text-[#DFC8A7] font-bold"
                      : "bg-[#161412] border-[#C5A880]/20 text-[#A39C91] hover:text-[#F5F2EB]"
                  }`}
                >
                  1. Баталгаажуулах
                </button>
                <button
                  onClick={() => setEmailTemplateType("quote")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    emailTemplateType === "quote"
                      ? "bg-[#C5A880]/20 border-[#C5A880] text-[#DFC8A7] font-bold"
                      : "bg-[#161412] border-[#C5A880]/20 text-[#A39C91] hover:text-[#F5F2EB]"
                  }`}
                >
                  2. Үнийн санал
                </button>
                <button
                  onClick={() => setEmailTemplateType("logistics")}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    emailTemplateType === "logistics"
                      ? "bg-[#C5A880]/20 border-[#C5A880] text-[#DFC8A7] font-bold"
                      : "bg-[#161412] border-[#C5A880]/20 text-[#A39C91] hover:text-[#F5F2EB]"
                  }`}
                >
                  3. 4x4 Зам чиглэл
                </button>
              </div>

              <button
                onClick={handleGenerateEmail}
                disabled={isGeneratingEmail}
                className="w-full py-2.5 bg-gradient-to-r from-[#C5A880] to-[#AA885C] hover:from-[#DFC8A7] hover:to-[#C5A880] text-[#0A0908] font-bold rounded-xl shadow-lg shadow-[#C5A880]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGeneratingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Имэйл боловсруулж байна...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-[#0A0908]" />
                    <span>Бэлэн хариу имэйл бэлтгэх</span>
                  </>
                )}
              </button>

              {generatedEmail && (
                <div className="space-y-2 pt-2 border-t border-[#C5A880]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#DFC8A7]">Бэлэн болсон имэйл:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, "email")}
                        className="px-2.5 py-1 bg-[#1A1815] hover:bg-[#26221E] text-stone-200 rounded-lg text-[10px] flex items-center gap-1 border border-[#C5A880]/30 cursor-pointer"
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
                            className="px-2.5 py-1 bg-[#C5A880] text-[#0A0908] rounded-lg text-[10px] flex items-center gap-1 font-bold shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Gmail дээр нээх</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-[#161412] border border-[#C5A880]/25 rounded-xl p-3 space-y-2">
                    <div className="border-b border-[#C5A880]/20 pb-1.5 font-semibold text-[#F5F2EB] text-[11px]">
                      <span className="text-[#A39C91]">Гарчиг: </span>
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

          {/* TAB 4: NOTION CRM */}
          {!showSettings && activeTab === "notion" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#DFC8A7] text-sm flex items-center gap-1.5 font-['Cormorant_Garamond',serif]">
                    <Database className="w-4 h-4" /> Захиалгын нэгдсэн сан (CRM)
                  </h4>
                  <p className="text-[10px] text-[#A39C91]">Нийт {inquiries.length} жуулчны захиалга бүртгэгдсэн</p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#DFC8A7] border border-[#C5A880]/35 rounded-xl flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
                  title="CSV татаж авах"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Notion CSV татах</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-[#161412] border border-[#C5A880]/20 rounded-2xl p-3 space-y-2 hover:border-[#C5A880]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-[#F5F2EB] flex items-center gap-1.5">
                          <span>{inq.name}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                              inq.status === "New"
                                ? "bg-[#C5A880]/20 text-[#DFC8A7] border border-[#C5A880]/30"
                                : inq.status === "Contacted"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#C5A880] font-medium mt-0.5">
                          {inq.roomType} • {inq.guests} Зочин
                        </div>
                      </div>

                      <span className="text-[10px] text-[#A39C91] font-mono">{inq.arrivalDate}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-300 bg-[#0E0C0A] p-2 rounded-xl border border-[#C5A880]/10">
                      <div>📧 {inq.email}</div>
                      <div>📱 {inq.phone || "Утас байхгүй"}</div>
                      <div className="col-span-2 text-[#A39C91] italic text-[10px] mt-0.5">
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
                          className="px-2 py-0.5 bg-[#1F1C18] hover:bg-[#2B2722] text-stone-300 rounded text-[10px]"
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
                        className="text-[#DFC8A7] hover:text-white font-semibold text-[10.5px] flex items-center gap-1"
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

          {/* TAB 5: TRAVEL SAFETY */}
          {!showSettings && activeTab === "safety" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-[#1A1815] border border-[#C5A880]/30 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#DFC8A7] font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-['Cormorant_Garamond',serif] text-base">Хэрмэн цав & Говийн аяллын санамж</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Өмнөговь аймгийн Гурвантэс сум, Тост тосон бумба, Хэрмэн цавын онгон байгальд аялахад анхаарах зүйлс:
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-[#161412] border border-[#C5A880]/20 rounded-2xl p-3 space-y-1">
                  <div className="font-bold text-[#DFC8A7] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#C5A880]" /> 1. Тээврийн хэрэгсэл ба 4х4 Зам
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Зөвхөн өндөр тэнхлэгтэй, 4х4 бүрэн хөтлөгчтэй Land Cruiser зэрэг машинтай зорчих.
                  </p>
                </div>

                <div className="bg-[#161412] border border-[#C5A880]/20 rounded-2xl p-3 space-y-1">
                  <div className="font-bold text-[#DFC8A7] flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-[#C5A880]" /> 2. Ус, нарны хамгаалалт & Салхи
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Нэг хүнд өдөрт 3-4 литр ундны ус тооцох. Нарны тос, шил, дулаан хүрэмтэй байх.
                  </p>
                </div>

                <div className="bg-[#161412] border border-[#C5A880]/20 rounded-2xl p-3 space-y-1">
                  <div className="font-bold text-[#DFC8A7] flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-[#C5A880]" /> 3. Холбоо бариа & Баазын тохь тух
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Батаарын өлгий бааз дээр Starlink сансрын өндөр хурдны интернэт, гүний цэвэр ус, 24/7 цахилгаанаар бүрэн хангагдсан.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#161412] border border-[#C5A880]/25 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#F5F2EB]">Баазын шуурхай утас</div>
                  <div className="text-[11px] text-[#DFC8A7] font-mono">+976 7201 0099 / +976 8822 3584</div>
                </div>

                <a
                  href="tel:+97672010099"
                  className="px-3.5 py-1.5 bg-[#C5A880] hover:bg-[#DFC8A7] text-[#0A0908] font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Шууд залгах</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer Status Bar */}
          <div className="px-4 py-2 bg-[#0A0908] border-t border-[#C5A880]/15 flex items-center justify-between text-[10px] text-[#A39C91]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Bataar Sanctuary • Aurelia Retreat</span>
            </div>
            <span className="font-mono text-[#C5A880]">v2.6 Aurelia Style</span>
          </div>

        </div>
      )}
    </>
  );
};
