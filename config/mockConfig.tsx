export interface SynagogueConfig {
  synagogue: {
    name: string;
    logo_url: string;
  };
  donation_targets: DonationTarget[];
  quick_amounts: number[];
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  settings: {
    companyId: string,
    copmainingId: string,
    copmainingToken: string,
    terminalName: string,
    auto_return_seconds: number;
    idle_timeout_seconds: number;
    require_id: boolean;
    bit_option: boolean;
  };
}

export interface DonationTarget {
  id: string;
  name: string;
  icon: string;
}

export const MOCK_QR_CONFIG: SynagogueConfig = {
  synagogue: {
    name: "בית שלמה ויעקב - בית הכנסת הקהילתי",
    logo_url: "https://service.taktzivit.co.il/N1/CampImage/company_logos/244.jpg",
  },
  donation_targets: [
    { id: "general", name: "קופה כללית", icon: "🏛️" },
    { id: "torah", name: "ספר תורה", icon: "📜" },
    { id: "renovation", name: "שיפוץ בית הכנסת", icon: "🔨" },
    { id: "poor", name: "קופת צדקה", icon: "🤲" }
  ],
  quick_amounts: [18, 36, 54, 100, 180, 360, 500],
  colors: {
    primary: "#0D3B66",
    secondary: "#D4AF37",
    background: "#F7F7F7"
  },
  settings: {
    companyId: '',
    copmainingId: '',
    copmainingToken: '',
    terminalName: '',
    auto_return_seconds: 60,
    idle_timeout_seconds: 120,
    require_id: false,
    bit_option: true
  }
};