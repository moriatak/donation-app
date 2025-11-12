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
    tokenApi: string;
    companyId: string,
    copmainingId: string,
    copmainingToken: string,
    terminalName: string,
    auto_return_seconds: number;
    idle_timeout_seconds: number;
    require_id: boolean;
    bit_option: boolean;
    pax_shop_opt: boolean;
    showNameTerminal: boolean;
  };
}

export interface DonationTarget {
  lastId: string;
  itemId: string;
  name: string;
  icon: string;
}

export const MOCK_QR_CONFIG: SynagogueConfig = {
  synagogue: {
    name: "",
    logo_url: "",
  },
  // donation_targets: [
  //   { lastId: "general", itemId: "", name: "קופה כללית", icon: "🏛️" },
  //   { lastId: "torah", itemId: "", name: "ספר תורה", icon: "📜" },
  //   { lastId: "renovation", itemId: "", name: "שיפוץ בית הכנסת", icon: "🔨" },
  //   { lastId: "poor", itemId: "", name: "קופת צדקה", icon: "🤲" }
  // ],
  donation_targets: [],
  quick_amounts: [18, 36, 54, 100, 180, 360, 500],
  colors: {
    primary: "#0D3B66",
    secondary: "#D4AF37",
    background: "#F7F7F7"
  },
  settings: {
    tokenApi: '',
    companyId: '',
    copmainingId: '',
    copmainingToken: '',
    terminalName: '',
    auto_return_seconds: 60,
    idle_timeout_seconds: 120,
    require_id: false,
    bit_option: false,
    pax_shop_opt: false,
    showNameTerminal: false
  }
};