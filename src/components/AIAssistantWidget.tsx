import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
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
  User,
  Phone,
  ArrowRight,
  Globe,
  FileSpreadsheet,
  Download,
  HelpCircle,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Plus
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
  dates: string;
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
    dates: "2026-07-12 to 2026-07-18 (6 nights)",
    roomType: "Deluxe Room",
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
    dates: "2026-08-04 to 2026-08-08 (4 nights)",
    roomType: "Family Suite",
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
  text: `👋 **Welcome to Bataar Sanctuary (Батаарын Өлгий)!** 
I am your 24/7 AI Expedition & Camp Concierge. 

How may I assist your Gobi journey?
• Room rates & amenities (Deluxe, Standard, Family)
• Paleontological expeditions to Khermen Tsav
• How to reach our camp (4x4 transfers from Dalanzadgad / UB)
• Stargazing, Starlink Wi-Fi, and solar green energy

*Feel free to speak in English, 한국어, 中文, 日本語, Deutsch, Français, or Монгол хэл!*`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
};

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "email" | "notion">("chat");
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

  // Quick booking modal inside chat
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    dates: "",
    roomType: "Deluxe Room ($110/night)",
    guests: 2,
    notes: ""
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

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

  // Handle Notion settings save
  const handleSaveSettings = () => {
    localStorage.setItem("bataar_gemini_api_key", geminiApiKey);
    localStorage.setItem("bataar_notion_api_key", notionApiKey);
    localStorage.setItem("bataar_notion_db_id", notionDbId);
    localStorage.setItem("bataar_notion_webhook", notionWebhookUrl);
    setShowSettings(false);
  };

  // Smart Offline + Knowledge Base Responder
  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase();

    // Rates & Rooms
    if (q.includes("price") || q.includes("rate") || q.includes("cost") || q.includes("room") || q.includes("үнэ") || q.includes("өрөө") || q.includes("хоног") || q.includes("가격") || q.includes("房") || q.includes("preis")) {
      return `🏠 **Bataar Sanctuary Accommodations & Rates:**

1. **Deluxe Wooden Room (Lodge):**
   • **$110 USD / night** (Includes artisan double breakfast)
   • Interior natural pine paneling, cozy queen bed, heating, AC, private en-suite bathroom with hot shower, large picture window with desert horizon view, Starlink Wi-Fi.

2. **Standard Twin Room:**
   • **$65 USD / night**
   • 2 single beds, desert panoramic window, wooden rustic ambiance, private bathroom.

3. **Family 2-Bedroom Suite:**
   • **$160 USD / night**
   • 2 private bedrooms (Master queen + Twin second bedroom), spacious bathroom, accommodates 4-6 guests. Ideal for families and science teams.

Would you like me to reserve dates for you? Click **"Book Stay"** below!`;
    }

    // Location & How to get there
    if (q.includes("location") || q.includes("where") || q.includes("how to get") || q.includes("reach") || q.includes("хаана") || q.includes("байршил") || q.includes("зам") || q.includes("위치") || q.includes("怎么去") || q.includes("wo ist")) {
      return `📍 **Camp Location & Travel Logistics:**

• **Sanctuary Location:** Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi Province, Mongolia (Coordinates: 43.2081° N, 101.0543° E).
• **Distance from Ulaanbaatar:** ~850 km.
• **Recommended Route:**
  1. Domestic flight from Ulaanbaatar to **Dalanzadgad** (1 hour).
  2. Scenic 4x4 expedition drive (390 km) via Bayanzag Flaming Cliffs and Khongor Sand Dunes to Bataar Sanctuary in Gurvantes.
• **4x4 Private Transfers:** We provide rugged Toyota Land Cruiser transfers with experienced Gobi desert drivers.

Our team can handle all transfers and flight bookings!`;
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
• **Email:** info@bataarsanctuary.com / bataarsanctuary@gmail.com
• **Address:** Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi, Mongolia.`;
    }

    // Default polite response
    return `Thank you for your message! 

At **Bataar Sanctuary**, we offer world-class eco-lodge accommodations ($65–$160/night), 100% solar power, Starlink satellite Wi-Fi, and guided paleontology expeditions across Khermen Tsav and the South Gobi.

You can ask me about:
1. Room options and booking dates
2. 4x4 transfer logistics from Dalanzadgad or UB
3. Stargazing, dining, and camp facilities
4. Or click below to leave a booking inquiry!`;
  };

  // Send message
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

      // If user provided a Gemini API Key, use @google/genai SDK
      if (geminiApiKey.trim()) {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        const systemInstruction = `You are the chief concierge and scientific expedition coordinator at "Bataar Sanctuary (Батаарын Өлгий)", an authentic luxury eco-lodge and paleontology basecamp located in Tost Tosonbumba Nature Reserve, Gurvantes Soum, South Gobi, Mongolia.
Coordinates: 43.2081° N, 101.0543° E.
Camp details:
- Deluxe Room: $110/night (breakfast included, pine wood, private bath, AC, picture window, Starlink).
- Standard Room: $65/night (2 single beds, private bath).
- Family Suite: $160/night (2 bedrooms, 4-6 guests, private shower).
- 100% off-grid solar energy, pure deep well water, Starlink Wi-Fi, organic restaurant, high-powered astronomy telescope for stargazing.
- Expeditions: Khermen Tsav canyons, Nemegt basin, dinosaur fossil grounds, snow leopard tracking.
- Distance from UB: 850 km (or 1hr domestic flight to Dalanzadgad + 390km 4x4 scenic drive).
- Contact: +976 7201 0099, +976 8822 3584.
Tone: Warm, highly knowledgeable, professional, elegant. Respond in the EXACT language used by the guest (English, Korean, Japanese, Chinese, German, Russian, French, or Mongolian).`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userText,
          config: {
            systemInstruction
          }
        });

        replyText = response.text || generateLocalResponse(userText);
      } else {
        // Instant simulated thinking for realistic UX
        await new Promise((r) => setTimeout(r, 650));
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
            label: "📅 Book / Check Dates"
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
            label: "📅 Book / Check Dates"
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Submit booking from chat modal
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email) return;

    const newInquiry: TouristInquiry = {
      id: `inq-${Date.now().toString().slice(-4)}`,
      name: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
      dates: bookingForm.dates || "Flexible",
      roomType: bookingForm.roomType,
      guests: bookingForm.guests,
      notes: bookingForm.notes,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "New",
      language: "Detected"
    };

    setInquiries((prev) => [newInquiry, ...prev]);
    setBookingSubmitted(true);

    // If Notion webhook is set, fire background sync
    if (notionWebhookUrl) {
      try {
        fetch(notionWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newInquiry)
        }).catch(() => {});
      } catch {
        // ignore background webhook fail
      }
    }

    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSubmitted(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "system",
          text: `✅ **Inquiry Received!** Thank you, ${bookingForm.name}. Your booking request for **${bookingForm.roomType}** (${bookingForm.dates || "Upcoming"}) has been logged into our camp reservation system. Our manager will email you with invoice & confirmation details shortly!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        dates: "",
        roomType: "Deluxe Room ($110/night)",
        guests: 2,
        notes: ""
      });
    }, 1500);
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

Thank you for choosing Bataar Sanctuary (Батаарын Өлгий). We are delighted to confirm your inquiry for stay and expedition in the Tost Tosonbumba Nature Reserve.

Reservation Overview:
• Guest Name: ${inq.name}
• Requested Dates: ${inq.dates}
• Selected Accommodation: ${inq.roomType}
• Party Size: ${inq.guests} Guest(s)
• Special Requests: ${inq.notes || "None specified"}

What awaits you at Bataar Sanctuary:
• 100% Solar-Powered Luxury Lodge with 24/7 hot showers and heating
• Starlink Satellite High-Speed Wi-Fi throughout the camp
• Organic Pasture-to-Table Dining at our Gobi Oasis Restaurant
• Stargazing through our optical astronomical telescope
• Proximity to the legendary Cretaceous fossil beds of Khermen Tsav

Next Steps:
Please confirm if you will require 4x4 airport transfer from Dalanzadgad or direct expedition pickup. We will issue your official reservation invoice upon your reply.

If you have any urgent questions, reach our camp director directly at +976 7201 0099 or reply to this email.

Yours sincerely,

Bataar Sanctuary Hospitality & Expedition Team
Tost Tosonbumba Nature Reserve, South Gobi, Mongolia
Web: https://odko-prog.github.io/bataar-sanctuary-new/
WhatsApp / Phone: +976 7201 0099 / +976 8822 3584`;
    } else if (emailTemplateType === "quote") {
      subject = `Expedition Quote & Travel Guide for ${inq.name} • Bataar Sanctuary`;
      body = `Dear ${inq.name},

Thank you for reaching out to Bataar Sanctuary regarding your upcoming travel to the South Gobi!

We have prepared the following pricing and itinerary summary for your ${inq.guests} guest(s):

1. Accommodation:
• ${inq.roomType} — Includes full artisanal breakfast, Starlink Wi-Fi, and eco-lodge comforts.

2. Expedition Activities Available:
• Full-day guided 4x4 expedition to Khermen Tsav (The Grand Canyon of the Gobi)
• Hands-on fossil geology and virtual excavation lab orientation
• Sunset camel trek across golden dunes and stargazing sessions

3. Logistics:
• Private Toyota Land Cruiser 4x4 transfers from Dalanzadgad with experienced local drivers are available upon request.

Please let us know your preferred dates (${inq.dates}), and we will reserve your private lodge immediately.

Warm desert regards,

Expedition Management Team
Bataar Sanctuary
Phone: +976 7201 0099 / +976 9953 0099`;
    } else {
      subject = `Gobi Logistics & 4x4 Transfer Guide for ${inq.name} • Bataar Sanctuary`;
      body = `Dear ${inq.name},

We are excited to welcome you to Bataar Sanctuary in Gurvantes, South Gobi!

To ensure a smooth and breathtaking journey across the desert, here is the essential travel itinerary:

• Flight: Domestic flight from Ulaanbaatar (Chinggis Khaan Airport) to Dalanzadgad (approx. 1 hour).
• 4x4 Scenic Drive: Our Land Cruiser 4x4 will meet you at Dalanzadgad Airport. The drive to Bataar Sanctuary passes through the famous Bayanzag Flaming Cliffs and Khongor Sand Dunes.
• Camp Arrival: Check-in, welcome tea, and orientation under the pristine Gobi sky.

Camp Amenities:
• 24/7 Starlink Wi-Fi, 100% solar green power, deep well mineral water, organic dining.

We look forward to hosting your Cretaceous adventure!

Bataar Sanctuary Expedition Desk
Phone: +976 7201 0099`;
    }

    // If Gemini key is set and custom prompt is provided, enhance it
    if (geminiApiKey.trim() && customEmailPrompt.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        const res = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Draft a professional, warm email reply from "Bataar Sanctuary" camp manager to tourist: ${inq.name} (${inq.email}).
Inquiry info: Dates: ${inq.dates}, Room: ${inq.roomType}, Guests: ${inq.guests}, Notes: ${inq.notes}.
Specific instructions: ${customEmailPrompt}.
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
        // fallback to standard template
      }
    }

    setGeneratedEmail({ subject, body });
    setIsGeneratingEmail(false);
  };

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(key);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Export CSV for Notion
  const handleExportCSV = () => {
    const headers = ["Name,Email,Phone,Dates,Room Type,Guests,Status,Language,Notes,Created At"];
    const rows = inquiries.map((i) =>
      `"${i.name}","${i.email}","${i.phone}","${i.dates}","${i.roomType}",${i.guests},"${i.status}","${i.language}","${(i.notes || "").replace(/"/g, '""')}","${i.createdAt}"`
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
      {/* Floating Launcher Trigger */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        {!isOpen && (
          <div className="bg-stone-900/95 text-amber-300 text-xs px-3.5 py-1.5 rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium tracking-wide">AI Concierge & Notion CRM</span>
            <span className="text-[10px] text-stone-400">🇲🇳 🇬🇧 🇰🇷 🇨🇳</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center w-15 h-15 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/40"
          aria-label="Open AI Concierge"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-stone-950 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <div className="relative">
              <Bot className="w-7 h-7 text-stone-950" />
              <Sparkles className="w-3.5 h-3.5 text-stone-950 absolute -top-1 -right-1 animate-spin" />
            </div>
          )}
        </button>
      </div>

      {/* Main Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[94vw] max-w-[480px] h-[640px] max-h-[82vh] bg-stone-950/95 border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 text-stone-100 font-sans">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-amber-200 text-sm tracking-wide">BATAAR SMART CONCIERGE</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono">
                    24/7 ONLINE
                  </span>
                </div>
                <p className="text-xs text-stone-400">Expedition Agent & Notion Hub</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-colors ${showSettings ? "bg-amber-500/20 text-amber-300" : "text-stone-400 hover:text-amber-300 hover:bg-stone-800"}`}
                title="Settings & API Keys"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 bg-stone-900/80 p-1 border-b border-stone-800 text-xs font-medium">
            <button
              onClick={() => { setActiveTab("chat"); setShowSettings(false); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "chat" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tourist Chat</span>
            </button>

            <button
              onClick={() => { setActiveTab("email"); setShowSettings(false); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "email" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>AI Reply</span>
            </button>

            <button
              onClick={() => { setActiveTab("notion"); setShowSettings(false); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                activeTab === "notion" && !showSettings
                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Notion CRM</span>
              {inquiries.some((i) => i.status === "New") && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-2 animate-pulse" />
              )}
            </button>
          </div>

          {/* Settings Drawer (Overlay inside modal) */}
          {showSettings && (
            <div className="flex-1 p-5 overflow-y-auto bg-stone-950 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Integration Settings
                </h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Gemini Key */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium flex items-center justify-between">
                  <span>Gemini API Key (Optional)</span>
                  <span className="text-[10px] text-amber-400/80">Gemini 3.8 Flash</span>
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
                />
                <p className="text-[10px] text-stone-500">
                  Leave empty to use built-in instant knowledge base (works 100% offline).
                </p>
              </div>

              {/* Notion Token */}
              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                <label className="text-stone-300 font-medium">Notion Integration Token / Secret</label>
                <input
                  type="password"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="secret_..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              {/* Notion Database ID */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Notion Database ID</label>
                <input
                  type="text"
                  value={notionDbId}
                  onChange={(e) => setNotionDbId(e.target.value)}
                  placeholder="32-character Database ID"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              {/* Webhook */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Auto-Sync Webhook (Make / Zapier / n8n)</label>
                <input
                  type="text"
                  value={notionWebhookUrl}
                  onChange={(e) => setNotionWebhookUrl(e.target.value)}
                  placeholder="https://hook.eu1.make.com/..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
                <p className="text-[10px] text-stone-500">
                  New inquiries will automatically post to this webhook in real-time.
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl transition-colors mt-4 shadow-lg shadow-amber-500/20"
              >
                Save Settings
              </button>
            </div>
          )}

          {/* TAB 1: TOURIST CHAT */}
          {!showSettings && activeTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message scroll container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                        m.sender === "user"
                          ? "bg-amber-500 text-stone-950 font-medium rounded-tr-sm"
                          : m.sender === "system"
                          ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200"
                          : "bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-sm whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-stone-500">{m.timestamp}</span>
                      {m.action && (
                        <button
                          onClick={() => setShowBookingModal(true)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                        >
                          {m.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-stone-400 bg-stone-900 border border-stone-800 px-3 py-2 rounded-2xl w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-200" />
                    <span className="text-[10px] ml-1 font-mono">Bataar Concierge typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-stone-900/60 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                  📍 Route & 4x4
                </button>
                <button
                  onClick={() => setInputMessage("Do you have Starlink Wi-Fi and solar power?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full text-[11px] border border-stone-700/50 transition-colors"
                >
                  🛰️ Starlink Wi-Fi
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="whitespace-nowrap px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-full text-[11px] border border-amber-500/40 font-medium transition-colors"
                >
                  📅 Request Booking
                </button>
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-stone-900/90 border-t border-stone-800 flex items-center gap-2">
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

          {/* TAB 2: AI EMAIL REPLY GENERATOR */}
          {!showSettings && activeTab === "email" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                  <Mail className="w-4 h-4" />
                  <span>Multilingual Email Reply Generator</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Automatically craft polite, branded English booking confirmations and expedition quotes for foreign inquiries.
                </p>
              </div>

              {/* Select Target Inquiry */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Select Tourist Inquiry:</label>
                <select
                  value={selectedInquiryId}
                  onChange={(e) => setSelectedInquiryId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  {inquiries.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {inq.name} ({inq.roomType} • {inq.dates})
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Style */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Email Reply Type:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setEmailTemplateType("confirmation")}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      emailTemplateType === "confirmation"
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    1. Booking Confirmation
                  </button>
                  <button
                    onClick={() => setEmailTemplateType("quote")}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      emailTemplateType === "quote"
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    2. Rates & Expedition Quote
                  </button>
                  <button
                    onClick={() => setEmailTemplateType("logistics")}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      emailTemplateType === "logistics"
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    3. 4x4 Transfer Logistics
                  </button>
                  <button
                    onClick={() => setEmailTemplateType("custom")}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      emailTemplateType === "custom"
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    4. Custom AI Prompt
                  </button>
                </div>
              </div>

              {emailTemplateType === "custom" && (
                <div className="space-y-1.5">
                  <label className="text-stone-300 font-medium">Special instructions for AI:</label>
                  <textarea
                    rows={2}
                    value={customEmailPrompt}
                    onChange={(e) => setCustomEmailPrompt(e.target.value)}
                    placeholder="e.g. Include 10% group discount and offer free camel trek at sunset..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <button
                onClick={handleGenerateEmail}
                disabled={isGeneratingEmail}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {isGeneratingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Professional Reply...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Branded Email</span>
                  </>
                )}
              </button>

              {/* Generated Result */}
              {generatedEmail && (
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Generated Email Draft</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, "email")}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] flex items-center gap-1 border border-stone-700"
                      >
                        {copySuccess === "email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copySuccess === "email" ? "Copied!" : "Copy All"}</span>
                      </button>

                      {/* Mailto link */}
                      {(() => {
                        const inq = inquiries.find((i) => i.id === selectedInquiryId);
                        const targetEmail = inq?.email || "";
                        const mailtoHref = `mailto:${targetEmail}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
                        return (
                          <a
                            href={mailtoHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] flex items-center gap-1 border border-amber-500/40 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open in Mail</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 space-y-2">
                    <div className="border-b border-stone-800 pb-1.5 font-semibold text-stone-200">
                      <span className="text-stone-500">Subject: </span>
                      {generatedEmail.subject}
                    </div>
                    <div className="text-stone-300 whitespace-pre-line font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed">
                      {generatedEmail.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTION CRM & DATABASE */}
          {!showSettings && activeTab === "notion" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> Notion CRM & Inquiries
                  </h4>
                  <p className="text-[11px] text-stone-400">Total {inquiries.length} tourist reservations logged</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExportCSV}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-xl flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                    title="Export as CSV to import into Notion"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV Export</span>
                  </button>

                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 rounded-xl"
                    title="Notion API Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Notion Sync Status Banner */}
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${notionWebhookUrl || notionApiKey ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                  <div>
                    <div className="font-semibold text-stone-200">
                      {notionWebhookUrl ? "Notion Webhook Active" : "Local CRM Active (Ready for Notion)"}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {notionWebhookUrl ? "Auto-syncing incoming bookings" : "Click settings to configure Notion API or Webhook"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleExportCSV();
                    alert("CSV татагдлаа! Та Notion руу ороод 'Import' -> 'CSV' дарахад бүх мэдээлэл шууд орно.");
                  }}
                  className="px-2.5 py-1 bg-amber-500 text-stone-950 rounded-lg font-bold text-[10px]"
                >
                  Sync to Notion
                </button>
              </div>

              {/* Inquiry List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-stone-400 font-medium px-1">
                  <span>Recent Tourist Inquiries</span>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Add Inquiry
                  </button>
                </div>

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
                        <div className="text-stone-400 text-[11px] flex items-center gap-2 mt-0.5">
                          <span>{inq.email}</span>
                          <span>•</span>
                          <span>{inq.phone}</span>
                        </div>
                      </div>

                      <select
                        value={inq.status}
                        onChange={(e) => {
                          const val = e.target.value as "New" | "Contacted" | "Confirmed";
                          setInquiries((prev) =>
                            prev.map((item) => (item.id === inq.id ? { ...item, status: val } : item))
                          );
                        }}
                        className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-[10px] text-stone-300 focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-950/60 p-2 rounded-xl border border-stone-800/40">
                      <div>
                        <span className="text-stone-500">Dates: </span>
                        <span className="text-stone-300 font-medium">{inq.dates}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Room: </span>
                        <span className="text-amber-300/90 font-medium">{inq.roomType}</span>
                      </div>
                    </div>

                    {inq.notes && (
                      <div className="text-[10px] text-stone-400 italic bg-stone-950/30 p-1.5 rounded-lg">
                        "{inq.notes}"
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedInquiryId(inq.id);
                          setActiveTab("email");
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Draft AI Reply</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notion Setup Instructions */}
              <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-2xl space-y-2 text-[11px] text-stone-400">
                <div className="font-bold text-stone-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notion-той 1 минутад холбох заавар:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-stone-400 leading-relaxed">
                  <li>Notion дээрээ <b>"Bataar Inquiries"</b> нэртэй шинэ Table (хүснэгт) үүсгэнэ.</li>
                  <li>Дээрх <b>"CSV Export"</b> товчийг дараад татсан файлаа Notion-ийн баруун дээд цэсний <b>Import</b> хэсгээр оруулна.</li>
                  <li>Автоматжуулах бол Make.com эсвэл Zapier дээр Notion webhook холбоод энэ тохиргоонд хаягаа хийхэд шууд уншина!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Quick Booking Modal (Pop-up over chat) */}
          {showBookingModal && (
            <div className="absolute inset-0 bg-stone-950/95 z-20 p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Guest Inquiry & Reservation
                  </h4>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-stone-400 hover:text-stone-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {bookingSubmitted ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h5 className="font-bold text-stone-100 text-sm">Inquiry Successfully Saved!</h5>
                    <p className="text-stone-400 text-xs">
                      Logged into camp database and prepared for Notion synchronization.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-stone-300 block mb-1 font-medium">Guest Full Name *</label>
                      <input
                        type="text"
                        required
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                        placeholder="e.g. John Doe / Иргэний нэр"
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-300 block mb-1 font-medium">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          placeholder="tourist@example.com"
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-stone-300 block mb-1 font-medium">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                          placeholder="+976 / +1..."
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-300 block mb-1 font-medium">Expected Dates</label>
                        <input
                          type="text"
                          value={bookingForm.dates}
                          onChange={(e) => setBookingForm({ ...bookingForm, dates: e.target.value })}
                          placeholder="e.g. July 12 - 16"
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-stone-300 block mb-1 font-medium">Guests</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={bookingForm.guests}
                          onChange={(e) => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value) || 1 })}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-stone-300 block mb-1 font-medium">Room Category</label>
                      <select
                        value={bookingForm.roomType}
                        onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="Deluxe Room ($110/night)">Deluxe Wooden Room — $110/night (w/ breakfast)</option>
                        <option value="Standard Room ($65/night)">Standard Twin Room — $65/night</option>
                        <option value="Family Suite ($160/night)">Family 2-Bedroom Suite — $160/night</option>
                        <option value="Full Expedition Package">Full Expedition Package w/ 4x4 Tour</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-300 block mb-1 font-medium">Notes & Specific Interests</label>
                      <textarea
                        rows={2}
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        placeholder="Airport pickup, dietary needs, fossil expedition..."
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBookingModal(false)}
                        className="w-1/3 py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                      >
                        Submit & Sync Inquiry
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Footer branding */}
          <div className="px-4 py-2 bg-stone-950 border-t border-stone-900 flex items-center justify-between text-[10px] text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-500/70" />
              <span>Bataar Sanctuary Hospitality AI</span>
            </span>
            <span>Gurvantes, South Gobi</span>
          </div>

        </div>
      )}
    </>
  );
};
