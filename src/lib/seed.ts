import type {
  Company,
  ContentItem,
  Notification,
  PermissionMatrix,
  Priority,
  Settings,
  Ticket,
  TicketMessage,
  TicketStatus,
  User,
} from "./types";
import { DEFAULT_CATEGORIES, PERMISSIONS } from "./constants";

/*
 * Demo data. Everything is generated relative to "now" so the demo always
 * looks current, and a seeded RNG keeps it identical between resets.
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  brandName: "DeskSupport",
  brandColor: "#bdea72",
  tagline: "Friendly, fast IT support for UK businesses",
  supportEmail: "help@desksupport.co.uk",
  supportPhone: "0333 000 0000",
  businessHours: "Mon–Fri, 08:00–18:00",
  portalWelcome: "Hi there, how can we help today?",
  sla: {
    urgent: { response: 0.5, resolve: 4 },
    high: { response: 1, resolve: 8 },
    medium: { response: 4, resolve: 24 },
    low: { response: 8, resolve: 72 },
  },
  categories: DEFAULT_CATEGORIES,
  autoAssign: true,
  csatEnabled: true,
  clientCanCloseTickets: true,
};

const staff: Omit<User, "createdAt" | "lastActiveAt">[] = [
  { id: "u_admin", name: "Sarah Mitchell", email: "sarah.mitchell@desksupport.co.uk", role: "admin", companyId: null, jobTitle: "Operations Director", phone: "07700 900101", status: "active", mfa: true },
  { id: "u_james", name: "James Carter", email: "james.carter@desksupport.co.uk", role: "technician", companyId: null, jobTitle: "Service Desk Lead", phone: "07700 900102", status: "active", mfa: true },
  { id: "u_priya", name: "Priya Shah", email: "priya.shah@desksupport.co.uk", role: "technician", companyId: null, jobTitle: "2nd Line Engineer", phone: "07700 900103", status: "active", mfa: true },
  { id: "u_tom", name: "Tom Walker", email: "tom.walker@desksupport.co.uk", role: "technician", companyId: null, jobTitle: "Field Engineer", phone: "07700 900104", status: "active", mfa: true },
  { id: "u_aisha", name: "Aisha Khan", email: "aisha.khan@desksupport.co.uk", role: "technician", companyId: null, jobTitle: "1st Line Analyst", phone: "07700 900105", status: "active", mfa: true },
  { id: "u_daniel", name: "Daniel Hughes", email: "daniel.hughes@desksupport.co.uk", role: "technician", companyId: null, jobTitle: "Network Engineer", phone: "07700 900106", status: "active", mfa: false },
  { id: "u_emily", name: "Emily Rhodes", email: "emily.rhodes@desksupport.co.uk", role: "technician", companyId: null, jobTitle: "1st Line Analyst", phone: "07700 900107", status: "invited", mfa: false },
];

const companySeed: Omit<Company, "createdAt">[] = [
  { id: "c_harbour", name: "Harbour & Finch Solicitors", domain: "harbourfinch.co.uk", industry: "Legal", city: "Bristol", plan: "Enterprise", status: "active", seats: 48, devices: 61, accountManagerId: "u_james" },
  { id: "c_northgate", name: "Northgate Dental Group", domain: "northgatedental.co.uk", industry: "Healthcare", city: "Leeds", plan: "Business", status: "active", seats: 32, devices: 40, accountManagerId: "u_priya" },
  { id: "c_brightwell", name: "Brightwell Architects", domain: "brightwellarchitects.co.uk", industry: "Architecture", city: "Manchester", plan: "Business", status: "active", seats: 22, devices: 30, accountManagerId: "u_james" },
  { id: "c_cobalt", name: "Cobalt Logistics", domain: "cobaltlogistics.co.uk", industry: "Logistics", city: "Birmingham", plan: "Enterprise", status: "active", seats: 75, devices: 104, accountManagerId: "u_tom" },
  { id: "c_meadowbank", name: "Meadowbank Primary Academy", domain: "meadowbank.sch.uk", industry: "Education", city: "Reading", plan: "Business", status: "active", seats: 40, devices: 120, accountManagerId: "u_priya" },
  { id: "c_oakridge", name: "Oakridge Accountancy", domain: "oakridgeaccountancy.co.uk", industry: "Finance", city: "London", plan: "Essentials", status: "active", seats: 14, devices: 16, accountManagerId: "u_james" },
  { id: "c_thistle", name: "Thistle & Rose Hospitality", domain: "thistleandrose.co.uk", industry: "Hospitality", city: "Edinburgh", plan: "Essentials", status: "active", seats: 18, devices: 25, accountManagerId: "u_tom" },
  { id: "c_vantage", name: "Vantage Property Management", domain: "vantageproperty.co.uk", industry: "Property", city: "Milton Keynes", plan: "Business", status: "onboarding", seats: 26, devices: 28, accountManagerId: "u_priya" },
];

const contactSeed: [string, string, string, string][] = [
  // companyId, name, job title, local part
  ["c_harbour", "Oliver Bennett", "Office Manager", "oliver.bennett"],
  ["c_harbour", "Charlotte Hayes", "Partner", "charlotte.hayes"],
  ["c_harbour", "Ravi Patel", "Paralegal", "ravi.patel"],
  ["c_harbour", "Grace Thompson", "Legal Secretary", "grace.thompson"],
  ["c_northgate", "Dr. Hannah Clarke", "Practice Owner", "hannah.clarke"],
  ["c_northgate", "Mark Ellis", "Practice Manager", "mark.ellis"],
  ["c_northgate", "Sophie Turner", "Receptionist", "sophie.turner"],
  ["c_brightwell", "Lucas Grant", "Studio Director", "lucas.grant"],
  ["c_brightwell", "Megan Lloyd", "Architect", "megan.lloyd"],
  ["c_brightwell", "Ethan Price", "CAD Technician", "ethan.price"],
  ["c_cobalt", "Fiona Marshall", "Finance Director", "fiona.marshall"],
  ["c_cobalt", "Gareth Jones", "Warehouse Manager", "gareth.jones"],
  ["c_cobalt", "Kelly Watson", "Transport Planner", "kelly.watson"],
  ["c_cobalt", "Ben Fraser", "Operations Manager", "ben.fraser"],
  ["c_meadowbank", "Mrs. Julie Parker", "School Business Manager", "j.parker"],
  ["c_meadowbank", "Adam Reid", "Year 6 Teacher", "a.reid"],
  ["c_meadowbank", "Nadia Hussain", "Office Administrator", "n.hussain"],
  ["c_oakridge", "Richard Moore", "Managing Partner", "richard.moore"],
  ["c_oakridge", "Laura Kent", "Senior Accountant", "laura.kent"],
  ["c_thistle", "Callum Stewart", "General Manager", "callum.stewart"],
  ["c_thistle", "Isla Campbell", "Front of House Lead", "isla.campbell"],
  ["c_vantage", "Peter Walsh", "Director", "peter.walsh"],
  ["c_vantage", "Amy Collins", "Lettings Negotiator", "amy.collins"],
];

const subjectsByCategory: Record<string, string[]> = {
  Hardware: [
    "Laptop won't power on after update",
    "Second monitor not detected",
    "Docking station keeps disconnecting",
    "Keyboard keys sticking – need replacement",
    "Laptop battery draining very fast",
    "Request for new headset",
  ],
  Software: [
    "Adobe Acrobat keeps crashing",
    "Need Sage installed on new PC",
    "Excel freezes when opening large files",
    "AutoCAD licence expired",
    "Windows update stuck at 35%",
  ],
  "Network & Wi-Fi": [
    "Slow internet in the office this morning",
    "Wi-Fi drops in the back office",
    "Can't reach the shared drive",
    "Guest Wi-Fi password needs changing",
  ],
  "Email & Microsoft 365": [
    "Emails stuck in outbox",
    "Calendar not syncing to phone",
    "Need a distribution list for the sales team",
    "Out of office for a leaver's mailbox",
    "OneDrive says files are not syncing",
    "Teams notifications not appearing",
  ],
  Security: [
    "Received a suspicious email – please check",
    "Antivirus alert on reception PC",
    "Lost phone with work email on it",
    "MFA prompts appearing that I didn't request",
  ],
  "Accounts & Access": [
    "Locked out of my account",
    "Password reset needed",
    "Access to the HR folder please",
    "Add user to the Finance security group",
  ],
  Printing: [
    "Printer showing offline",
    "Scan to email not working",
    "Printer printing everything in colour",
  ],
  "Phones & VoIP": [
    "Desk phone has no dial tone",
    "Divert main line to mobile over Christmas",
    "Voicemail PIN reset",
  ],
  "New starter / Leaver": [
    "New starter next Monday – full setup",
    "Leaver on Friday – disable accounts",
    "Equipment collection for leaver",
  ],
  Other: ["Quote for 5 new laptops", "Office move – network cabling", "Question about our backup schedule"],
};

const genericReplies = [
  "Thanks for getting in touch. I've picked this up and will take a look now.",
  "I've connected remotely and can see the issue – working on a fix now.",
  "Could you let me know a good time for a quick remote session?",
  "I've applied a fix on our side. Could you try again and let me know?",
  "That should be sorted now. I'll leave this open for a day in case it comes back.",
];

const internalNotes = [
  "Checked RMM – device last checked in 2 hours ago, disk at 92%.",
  "Same issue as last month for this client. Might need a hardware swap.",
  "Escalating to 2nd line if the remote fix doesn't hold.",
  "Vendor ticket raised, ref #VN-20931.",
];

function pickWeighted<T>(rand: () => number, items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    if ((r -= w) <= 0) return item;
  }
  return items[items.length - 1][0];
}

interface Handcrafted {
  subject: string;
  companyId: string;
  requester: string;
  assigneeId: string | null;
  status: TicketStatus;
  priority: Priority;
  category: string;
  channel: Ticket["channel"];
  ageHours: number;
  tags: string[];
  thread: { by: "req" | string; body: string; internal?: boolean; afterMin: number }[];
}

const handcrafted: Handcrafted[] = [
  {
    subject: "Outlook keeps asking for my password since the MFA change",
    companyId: "c_harbour",
    requester: "oliver.bennett",
    assigneeId: "u_priya",
    status: "in_progress",
    priority: "high",
    category: "Email & Microsoft 365",
    channel: "portal",
    ageHours: 5,
    tags: ["mfa", "outlook"],
    thread: [
      { by: "req", body: "Hi team, since Monday's MFA rollout Outlook on my desktop keeps popping up asking for my password every 10 minutes. I've typed it in about 20 times today. Webmail works fine. Can you help? It's affecting a few of us in the office.", afterMin: 0 },
      { by: "u_priya", body: "Hi Oliver, thanks for flagging. This is usually a cached credential from before MFA was enforced. I'm going to clear the token cache and re-register Outlook with modern authentication. Are you free for a quick remote session in the next 30 minutes?", afterMin: 18 },
      { by: "u_priya", body: "Conditional access logs show legacy auth attempts from 3 devices at Harbour & Finch. Likely an old Outlook profile. Will check the other 2 users after this.", internal: true, afterMin: 25 },
      { by: "req", body: "Yes please – I'm at my desk now.", afterMin: 41 },
    ],
  },
  {
    subject: "Suspicious invoice email – I think I clicked the link",
    companyId: "c_northgate",
    requester: "sophie.turner",
    assigneeId: "u_james",
    status: "open",
    priority: "urgent",
    category: "Security",
    channel: "phone",
    ageHours: 1.2,
    tags: ["phishing", "security-incident"],
    thread: [
      { by: "req", body: "We received an email from 'NHS Supplies' with an invoice link. I clicked it and it asked me to sign in to Microsoft and I did before I realised. Really sorry!", afterMin: 0 },
      { by: "u_james", body: "Logged from phone call. Starting incident playbook: revoke sessions, reset password, review mailbox rules, check sign-ins from unfamiliar locations.", internal: true, afterMin: 6 },
    ],
  },
  {
    subject: "Wi-Fi dropping in meeting room 2",
    companyId: "c_brightwell",
    requester: "megan.lloyd",
    assigneeId: null,
    status: "open",
    priority: "medium",
    category: "Network & Wi-Fi",
    channel: "email",
    ageHours: 3,
    tags: ["wifi"],
    thread: [
      { by: "req", body: "The Wi-Fi in meeting room 2 keeps cutting out during Teams calls with clients. It's fine in the main studio. It's been like this since the weekend.", afterMin: 0 },
    ],
  },
  {
    subject: "New starter Monday – laptop and Microsoft 365 account",
    companyId: "c_oakridge",
    requester: "richard.moore",
    assigneeId: "u_aisha",
    status: "in_progress",
    priority: "medium",
    category: "New starter / Leaver",
    channel: "portal",
    ageHours: 26,
    tags: ["onboarding"],
    thread: [
      { by: "req", body: "We have a new trainee accountant, Jack Morgan, starting Monday at 9am. He'll need a laptop, an email address, access to Sage and the Clients shared folder. Thanks!", afterMin: 0 },
      { by: "u_aisha", body: "Hi Richard, no problem. I've created jack.morgan@oakridgeaccountancy.co.uk and I'm imaging a laptop from stock today. We'll courier it Friday so it's on his desk for Monday.", afterMin: 52 },
      { by: "u_aisha", body: "Laptop LT-OAK-017 assigned. Sage licence: need to check with Richard if they have a spare seat.", internal: true, afterMin: 60 },
    ],
  },
  {
    subject: "Server room UPS beeping continuously",
    companyId: "c_cobalt",
    requester: "gareth.jones",
    assigneeId: "u_tom",
    status: "in_progress",
    priority: "urgent",
    category: "Hardware",
    channel: "phone",
    ageHours: 2.5,
    tags: ["onsite", "ups"],
    thread: [
      { by: "req", body: "The big UPS in the comms room is beeping non-stop and showing a battery warning light.", afterMin: 0 },
      { by: "u_tom", body: "Hi Gareth, that'll likely be a failed battery module. I'm on my way to site now, ETA 40 minutes. Please don't switch anything off in the meantime.", afterMin: 9 },
    ],
  },
  {
    subject: "Can't connect to VPN from home",
    companyId: "c_cobalt",
    requester: "kelly.watson",
    assigneeId: "u_daniel",
    status: "waiting",
    priority: "high",
    category: "Network & Wi-Fi",
    channel: "portal",
    ageHours: 20,
    tags: ["vpn", "remote-working"],
    thread: [
      { by: "req", body: "The VPN client says 'connection timed out' when I try to connect from home. Worked fine last week.", afterMin: 0 },
      { by: "u_daniel", body: "Hi Kelly, I've checked the firewall and your account is fine. Could you send me a screenshot of the error and let me know if you've changed your home router recently?", afterMin: 35 },
    ],
  },
  {
    subject: "Reception printer printing blank pages",
    companyId: "c_meadowbank",
    requester: "n.hussain",
    assigneeId: "u_aisha",
    status: "waiting",
    priority: "low",
    category: "Printing",
    channel: "email",
    ageHours: 30,
    tags: ["printer"],
    thread: [
      { by: "req", body: "The reception printer is printing blank pages for some documents (PDFs mostly).", afterMin: 0 },
      { by: "u_aisha", body: "Thanks Nadia – I've pushed an updated driver. Could you try printing the same PDF again and let me know if it comes out OK?", afterMin: 80 },
    ],
  },
  {
    subject: "Shared mailbox not showing in Outlook",
    companyId: "c_vantage",
    requester: "amy.collins",
    assigneeId: "u_priya",
    status: "resolved",
    priority: "medium",
    category: "Email & Microsoft 365",
    channel: "chat",
    ageHours: 40,
    tags: ["shared-mailbox"],
    thread: [
      { by: "req", body: "I can't see the lettings@ mailbox in Outlook any more.", afterMin: 0 },
      { by: "u_priya", body: "Hi Amy, your permissions were removed during the migration. I've re-added Full Access and Send As – it should appear in Outlook within 30 minutes after a restart.", afterMin: 22 },
      { by: "req", body: "It's back, thank you so much!", afterMin: 95 },
    ],
  },
  {
    subject: "Access to the Finance SharePoint site",
    companyId: "c_oakridge",
    requester: "laura.kent",
    assigneeId: null,
    status: "open",
    priority: "low",
    category: "Accounts & Access",
    channel: "portal",
    ageHours: 0.6,
    tags: ["sharepoint", "access-request"],
    thread: [
      { by: "req", body: "Could I please get edit access to the Finance SharePoint site? Richard has approved this.", afterMin: 0 },
    ],
  },
  {
    subject: "Teams calls are choppy at the hotel office",
    companyId: "c_thistle",
    requester: "callum.stewart",
    assigneeId: "u_daniel",
    status: "in_progress",
    priority: "medium",
    category: "Phones & VoIP",
    channel: "email",
    ageHours: 8,
    tags: ["teams", "bandwidth"],
    thread: [
      { by: "req", body: "Our Teams calls keep breaking up, especially in the afternoons.", afterMin: 0 },
      { by: "u_daniel", body: "Hi Callum, I can see the line is saturating around 2pm – looks like the CCTV cloud backup. I'm going to add a QoS rule to prioritise Teams traffic.", afterMin: 70 },
    ],
  },
];

const kbArticles: { title: string; category: string; excerpt: string; body: string; views: number; helpful: number }[] = [
  {
    title: "How to raise a support ticket",
    category: "Getting started",
    excerpt: "The quickest ways to get help from our service desk and what to include.",
    views: 1284,
    helpful: 96,
    body: `<p>You can reach our service desk in three ways: through this portal, by email, or by phone. The portal is the fastest way to get help because your request goes straight into our queue with all the details we need.</p><h2>What to include</h2><ul><li>A short, clear subject, e.g. <em>"Outlook won't open on my laptop"</em></li><li>What you were trying to do and what happened instead</li><li>Any error messages (a screenshot is perfect)</li><li>How many people are affected</li></ul><h2>Response times</h2><p>Urgent issues that stop your business working are answered within 30 minutes during business hours. You can see the status of every ticket under <strong>My tickets</strong>.</p>`,
  },
  {
    title: "Setting up multi-factor authentication (MFA)",
    category: "Security",
    excerpt: "Protect your Microsoft 365 account with the Microsoft Authenticator app.",
    views: 2310,
    helpful: 91,
    body: `<p>Multi-factor authentication (MFA) adds a second step when you sign in, so a stolen password alone isn't enough to get into your account.</p><h2>Before you start</h2><ul><li>Install <strong>Microsoft Authenticator</strong> from the App Store or Google Play.</li><li>Have your computer and phone to hand.</li></ul><h2>Steps</h2><ol><li>Go to <a href="#">aka.ms/mfasetup</a> and sign in with your work email.</li><li>Choose <em>Mobile app</em> and click <em>Set up</em>.</li><li>Open Authenticator on your phone, tap <strong>+</strong> then <em>Work or school account</em>.</li><li>Scan the QR code on your screen and approve the test notification.</li></ol><blockquote>Never approve an MFA prompt you didn't start. If you get one unexpectedly, call us straight away.</blockquote>`,
  },
  {
    title: "How to spot a phishing email",
    category: "Security",
    excerpt: "Five warning signs that an email isn't what it seems – and what to do.",
    views: 1876,
    helpful: 94,
    body: `<p>Phishing emails try to trick you into clicking a link, opening an attachment or entering your password. Look out for:</p><ol><li><strong>Urgency</strong> – "Your account will be closed today".</li><li><strong>Mismatched senders</strong> – the display name says one thing, the address another.</li><li><strong>Unexpected attachments</strong> – especially invoices or delivery notes.</li><li><strong>Login pages</strong> – a link that asks you to sign in to Microsoft again.</li><li><strong>Spelling and tone</strong> – something just feels off.</li></ol><h2>If you think you've clicked</h2><p>Don't panic, and don't delete the email. Call the service desk immediately so we can secure your account.</p>`,
  },
  {
    title: "Connecting to the VPN when working from home",
    category: "Network & VPN",
    excerpt: "Install and connect the VPN client to reach office files securely.",
    views: 964,
    helpful: 88,
    body: `<p>The VPN creates a secure tunnel from your laptop to the office so you can reach shared drives and line-of-business apps.</p><h2>Connecting</h2><ol><li>Click the shield icon in your system tray.</li><li>Choose your office connection and click <strong>Connect</strong>.</li><li>Approve the MFA prompt on your phone.</li></ol><h2>Troubleshooting</h2><ul><li>Check your home internet works by opening a website.</li><li>Restart your laptop and try again.</li><li>If you see <code>connection timed out</code>, raise a ticket with a screenshot.</li></ul>`,
  },
  {
    title: "Adding a shared mailbox in Outlook",
    category: "Microsoft 365",
    excerpt: "Shared mailboxes usually appear automatically – here's what to do if not.",
    views: 742,
    helpful: 85,
    body: `<p>Once we've granted you access, a shared mailbox normally appears in Outlook within an hour.</p><h2>If it doesn't appear</h2><ol><li>Close and reopen Outlook.</li><li>Go to <strong>File → Account Settings → Account Settings</strong>.</li><li>Double-click your account, choose <em>More Settings → Advanced</em>, and add the mailbox.</li></ol>`,
  },
  {
    title: "Resetting your password",
    category: "Accounts & passwords",
    excerpt: "Use self-service password reset to get back in without waiting.",
    views: 3120,
    helpful: 97,
    body: `<p>If you've forgotten your password or you're locked out, you can reset it yourself in under two minutes.</p><ol><li>Go to <a href="#">passwordreset.microsoftonline.com</a>.</li><li>Enter your work email and the characters shown.</li><li>Verify with your phone and choose a new password.</li></ol><p>Use a passphrase of three random words – e.g. <code>Kettle-Harbour-Violet</code> – it's easier to remember and harder to crack.</p>`,
  },
  {
    title: "Fixing common printer problems",
    category: "Hardware & printing",
    excerpt: "Offline printers, stuck jobs and blank pages – quick fixes to try first.",
    views: 655,
    helpful: 79,
    body: `<h2>Printer shows as offline</h2><p>Check the printer is switched on and shows a network connection, then remove and re-add it from <strong>Settings → Printers</strong>.</p><h2>Jobs stuck in the queue</h2><p>Open the print queue, cancel all documents, and restart your computer.</p><h2>Blank pages</h2><p>Try printing a test page from the printer itself. If that's blank too, the toner may need replacing.</p>`,
  },
  {
    title: "Working securely from home",
    category: "Getting started",
    excerpt: "Simple habits that keep company data safe outside the office.",
    views: 512,
    helpful: 90,
    body: `<ul><li>Lock your screen when you step away (<code>Windows + L</code>).</li><li>Use the VPN for anything stored on office servers.</li><li>Don't let family members use your work laptop.</li><li>Keep your home router's firmware up to date.</li></ul>`,
  },
];

const pageSeed: { title: string; slug: string; excerpt: string; body: string; status: "published" | "draft"; showInNav: boolean }[] = [
  {
    title: "Home",
    slug: "home",
    excerpt: "Proactive IT support and cyber security for growing UK businesses.",
    status: "published",
    showInNav: true,
    body: `<h1>IT support that just works</h1><p>We look after the technology of small and medium-sized businesses across the UK, so you can get on with running yours. One friendly team for your helpdesk, devices, Microsoft 365, networks and cyber security.</p><h2>Why businesses choose us</h2><ul><li><strong>Fast response</strong> – urgent issues picked up within 30 minutes.</li><li><strong>Fixed monthly pricing</strong> – no surprises, no hourly bills.</li><li><strong>Proactive monitoring</strong> – we spot problems before you do.</li><li><strong>Real people</strong> – a UK-based service desk that knows your business.</li></ul><blockquote>"Since moving to DeskSupport our downtime has practically disappeared." – Office Manager, Bristol law firm</blockquote>`,
  },
  {
    title: "Managed IT Support",
    slug: "managed-it-support",
    excerpt: "Unlimited helpdesk, remote and onsite support on a fixed monthly fee.",
    status: "published",
    showInNav: true,
    body: `<h1>Managed IT Support</h1><p>Our managed service gives your team unlimited access to our service desk, plus proactive monitoring and maintenance of every device you own.</p><h2>What's included</h2><ul><li>Unlimited remote helpdesk support</li><li>Onsite engineer visits</li><li>24/7 monitoring and patching</li><li>New starter and leaver management</li><li>Quarterly IT strategy reviews</li></ul>`,
  },
  {
    title: "Cyber Security",
    slug: "cyber-security",
    excerpt: "Protect your people, devices and data from modern threats.",
    status: "published",
    showInNav: true,
    body: `<h1>Cyber Security</h1><p>From Cyber Essentials certification to managed detection and response, we help you stay one step ahead of attackers.</p><h2>Services</h2><ul><li>Cyber Essentials &amp; Cyber Essentials Plus</li><li>Endpoint detection and response</li><li>Email filtering and phishing simulations</li><li>Security awareness training</li></ul>`,
  },
  {
    title: "Cloud & Microsoft 365",
    slug: "cloud-microsoft-365",
    excerpt: "Migrations, licensing and day-to-day management of Microsoft 365.",
    status: "published",
    showInNav: true,
    body: `<h1>Cloud &amp; Microsoft 365</h1><p>We plan and deliver migrations to Microsoft 365, then manage your tenant so it stays secure and cost-effective.</p>`,
  },
  {
    title: "About Us",
    slug: "about",
    excerpt: "A friendly team of IT engineers who care about your business.",
    status: "published",
    showInNav: true,
    body: `<h1>About us</h1><p>We started with a simple idea: IT support should be friendly, fast and jargon-free. Today our team supports hundreds of users across the UK.</p>`,
  },
  {
    title: "Contact",
    slug: "contact",
    excerpt: "Get in touch with our team.",
    status: "published",
    showInNav: true,
    body: `<h1>Contact us</h1><p>Existing clients can raise a ticket through the client portal or call the service desk. For new enquiries, drop us an email and we'll be in touch within one working day.</p>`,
  },
  {
    title: "Pricing",
    slug: "pricing",
    excerpt: "Simple per-user pricing.",
    status: "draft",
    showInNav: false,
    body: `<h1>Pricing</h1><p>Draft – plans and per-user prices to be confirmed.</p><ul><li><strong>Essentials</strong> – from £35 per user / month</li><li><strong>Business</strong> – from £55 per user / month</li><li><strong>Enterprise</strong> – tailored</li></ul>`,
  },
];

export interface SeedData {
  users: User[];
  companies: Company[];
  tickets: Ticket[];
  content: ContentItem[];
  settings: Settings;
  permissions: PermissionMatrix;
  notifications: Notification[];
  nextTicketNumber: number;
}

export function createSeed(now = Date.now()): SeedData {
  const rand = mulberry32(20241008);
  const iso = (t: number) => new Date(t).toISOString();

  const users: User[] = staff.map((s, i) => ({
    ...s,
    createdAt: iso(now - (400 - i * 30) * DAY),
    lastActiveAt: s.status === "invited" ? null : iso(now - rand() * 6 * HOUR),
  }));

  const companies: Company[] = companySeed.map((c, i) => ({
    ...c,
    createdAt: iso(now - (720 - i * 70) * DAY),
  }));

  for (const [companyId, name, jobTitle, local] of contactSeed) {
    const company = companies.find((c) => c.id === companyId)!;
    const idx = users.length;
    users.push({
      id: `u_${local.replace(/\W/g, "")}`,
      name,
      email: `${local}@${company.domain}`,
      role: "client",
      companyId,
      jobTitle,
      phone: `0117 496 0${(100 + idx).toString().slice(-3)}`,
      status: idx % 11 === 0 ? "invited" : "active",
      mfa: rand() > 0.3,
      createdAt: iso(now - (300 - idx * 5) * DAY),
      lastActiveAt: idx % 11 === 0 ? null : iso(now - rand() * 9 * DAY),
    });
  }

  const technicians = users.filter((u) => u.role === "technician" && u.status === "active");
  const clientsByCompany = (companyId: string) => users.filter((u) => u.companyId === companyId && u.role === "client");
  const findClient = (local: string) => users.find((u) => u.email.startsWith(`${local}@`))!;

  const tickets: Ticket[] = [];
  let number = 1000;
  let msgId = 0;
  const mid = () => `m_${++msgId}`;

  const slaFor = (p: Priority) => DEFAULT_SETTINGS.sla[p];

  // Background volume: ~150 tickets over the last 30 days.
  const categories = Object.keys(subjectsByCategory);
  for (let i = 0; i < 150; i++) {
    const ageHours = Math.pow(rand(), 1.25) * 30 * 24 + 6;
    const created = now - ageHours * HOUR;
    const company = companies[Math.floor(rand() * companies.length)];
    const contacts = clientsByCompany(company.id);
    const requester = contacts[Math.floor(rand() * contacts.length)];
    const category = categories[Math.floor(rand() * categories.length)];
    const subjects = subjectsByCategory[category];
    const subject = subjects[Math.floor(rand() * subjects.length)];
    const priority = pickWeighted<Priority>(rand, [["low", 3], ["medium", 5], ["high", 2], ["urgent", 0.6]]);
    const channel = pickWeighted<Ticket["channel"]>(rand, [["portal", 5], ["email", 3], ["phone", 2], ["chat", 1]]);
    const assignee = technicians[Math.floor(rand() * technicians.length)];

    let status: TicketStatus;
    if (ageHours < 30) status = pickWeighted(rand, [["open", 3], ["in_progress", 3], ["waiting", 1], ["resolved", 2]]);
    else if (ageHours < 96) status = pickWeighted(rand, [["in_progress", 1], ["waiting", 1.2], ["resolved", 4], ["closed", 1]]);
    else status = pickWeighted(rand, [["waiting", 0.15], ["resolved", 1], ["closed", 4]]);

    const sla = slaFor(priority);
    const responseMins = (0.15 + rand() * 1.1) * sla.response * 60;
    const firstResponse = status === "open" && rand() > 0.4 ? null : created + responseMins * 60_000;
    const resolveHours = sla.resolve * (0.2 + rand() * 1.05);
    const resolvedAt =
      status === "resolved" || status === "closed" ? Math.min(created + resolveHours * HOUR, now - 0.5 * HOUR) : null;

    const messages: TicketMessage[] = [
      {
        id: mid(),
        authorId: requester.id,
        body: `Hi, ${subject.charAt(0).toLowerCase()}${subject.slice(1)}. Could someone take a look please? Thanks, ${requester.name.split(" ")[0]}`,
        internal: false,
        createdAt: iso(created),
      },
    ];
    if (firstResponse) {
      messages.push({
        id: mid(),
        authorId: assignee.id,
        body: genericReplies[Math.floor(rand() * 3)],
        internal: false,
        createdAt: iso(firstResponse),
      });
      if (rand() > 0.6) {
        messages.push({
          id: mid(),
          authorId: assignee.id,
          body: internalNotes[Math.floor(rand() * internalNotes.length)],
          internal: true,
          createdAt: iso(firstResponse + 20 * 60_000),
        });
      }
    }
    if (resolvedAt) {
      messages.push({ id: mid(), authorId: assignee.id, body: genericReplies[4], internal: false, createdAt: iso(resolvedAt) });
    }

    const assigned = status === "open" && rand() > 0.5 ? null : assignee.id;
    tickets.push({
      id: `t_${number}`,
      number: number++,
      subject,
      status,
      priority,
      category,
      channel,
      requesterId: requester.id,
      companyId: company.id,
      assigneeId: assigned,
      tags: [],
      createdAt: iso(created),
      updatedAt: messages[messages.length - 1].createdAt,
      dueAt: iso(created + sla.resolve * HOUR),
      firstResponseAt: firstResponse ? iso(firstResponse) : null,
      resolvedAt: resolvedAt ? iso(resolvedAt) : null,
      satisfaction: resolvedAt ? (rand() > 0.08 ? "positive" : "negative") : null,
      messages,
      events: [{ id: `e_${number}`, actorId: requester.id, text: "created this ticket", createdAt: iso(created) }],
    });
  }

  tickets.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  tickets.forEach((t, i) => {
    t.number = 1000 + i;
    t.id = `t_${t.number}`;
  });
  number = 1000 + tickets.length;

  // Hand-written tickets with realistic conversations, used in the demo walkthrough.
  for (const h of [...handcrafted].sort((a, b) => b.ageHours - a.ageHours)) {
    const created = now - h.ageHours * HOUR;
    const requester = findClient(h.requester);
    const messages: TicketMessage[] = h.thread.map((m) => ({
      id: mid(),
      authorId: m.by === "req" ? requester.id : m.by,
      body: m.body,
      internal: !!m.internal,
      createdAt: iso(created + m.afterMin * 60_000),
    }));
    const firstStaff = messages.find((m) => m.authorId !== requester.id && !m.internal);
    const sla = slaFor(h.priority);
    const resolved = h.status === "resolved" ? messages[messages.length - 1].createdAt : null;
    const events = [{ id: `e_h${number}`, actorId: requester.id, text: "created this ticket", createdAt: iso(created) }];
    if (h.assigneeId) {
      const tech = users.find((u) => u.id === h.assigneeId)!;
      events.push({
        id: `e_h${number}a`,
        actorId: "u_james",
        text: `assigned this ticket to ${tech.name}`,
        createdAt: iso(created + 4 * 60_000),
      });
    }
    tickets.push({
      id: `t_${number}`,
      number: number++,
      subject: h.subject,
      status: h.status,
      priority: h.priority,
      category: h.category,
      channel: h.channel,
      requesterId: requester.id,
      companyId: h.companyId,
      assigneeId: h.assigneeId,
      tags: h.tags,
      createdAt: iso(created),
      updatedAt: messages[messages.length - 1].createdAt,
      dueAt: iso(created + sla.resolve * HOUR),
      firstResponseAt: firstStaff?.createdAt ?? null,
      resolvedAt: resolved,
      satisfaction: resolved ? "positive" : null,
      messages,
      events,
    });
  }

  const content: ContentItem[] = [];
  pageSeed.forEach((p, i) => {
    const updated = now - (i + 1) * 3.3 * DAY;
    content.push({
      id: `p_${p.slug}`,
      type: "page",
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      body: p.body,
      status: p.status,
      authorId: i % 2 ? "u_james" : "u_admin",
      createdAt: iso(updated - 60 * DAY),
      updatedAt: iso(updated),
      publishedAt: p.status === "published" ? iso(updated) : null,
      category: null,
      views: p.status === "published" ? Math.round(4000 / (i + 1)) : 0,
      helpful: 0,
      seoTitle: `${p.title} | ${DEFAULT_SETTINGS.brandName}`,
      seoDescription: p.excerpt,
      level: null,
      showInNav: p.showInNav,
    });
  });

  kbArticles.forEach((a, i) => {
    const updated = now - (i * 2.2 + 1) * DAY;
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    content.push({
      id: `kb_${i + 1}`,
      type: "article",
      title: a.title,
      slug,
      excerpt: a.excerpt,
      body: a.body,
      status: i === kbArticles.length - 1 ? "draft" : "published",
      authorId: ["u_priya", "u_james", "u_aisha", "u_daniel"][i % 4],
      createdAt: iso(updated - 30 * DAY),
      updatedAt: iso(updated),
      publishedAt: i === kbArticles.length - 1 ? null : iso(updated),
      category: a.category,
      views: a.views,
      helpful: a.helpful,
      seoTitle: a.title,
      seoDescription: a.excerpt,
      level: null,
      showInNav: false,
    });
  });

  const announcements: Pick<ContentItem, "title" | "excerpt" | "body" | "level" | "status">[] = [
    {
      title: "Phishing alert: fake DocuSign emails",
      excerpt: "We're seeing fake DocuSign emails targeting UK businesses. Don't click links – forward them to us.",
      body: "<p>We're seeing a wave of fake DocuSign emails asking people to review a document. The link leads to a fake Microsoft sign-in page.</p><p>If you receive one, <strong>don't click</strong> – forward it to the service desk and delete it.</p>",
      level: "incident",
      status: "published",
    },
    {
      title: "Planned maintenance this Saturday 22:00–23:00",
      excerpt: "Firewall firmware updates. Remote access and VPN may be briefly unavailable.",
      body: "<p>We'll be updating firewall firmware for all managed clients this Saturday between 22:00 and 23:00. VPN connections may drop for up to 10 minutes.</p>",
      level: "maintenance",
      status: "published",
    },
    {
      title: "Christmas & New Year support hours",
      excerpt: "Our service desk hours over the festive period.",
      body: "<p>The service desk will be closed on bank holidays. Emergency support remains available for Enterprise clients.</p>",
      level: "info",
      status: "draft",
    },
  ];
  announcements.forEach((a, i) => {
    const updated = now - (i + 0.5) * DAY;
    content.push({
      id: `an_${i + 1}`,
      type: "announcement",
      title: a.title,
      slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      excerpt: a.excerpt,
      body: a.body,
      status: a.status,
      authorId: "u_admin",
      createdAt: iso(updated),
      updatedAt: iso(updated),
      publishedAt: a.status === "published" ? iso(updated) : null,
      category: null,
      views: 0,
      helpful: 0,
      seoTitle: a.title,
      seoDescription: a.excerpt,
      level: a.level,
      showInNav: false,
    });
  });

  const permissions: PermissionMatrix = {};
  for (const p of PERMISSIONS) {
    permissions[p.key] = {
      admin: true,
      technician: !["tickets.delete", "users.manage", "companies.manage", "settings.manage", "cms.publish"].includes(p.key),
      client: false,
    };
  }

  const ticketHref = (subjectStart: string) =>
    `/tickets/${tickets.find((t) => t.subject.startsWith(subjectStart))?.id ?? ""}`;

  const notifications: Notification[] = [
    { id: "n1", text: "Urgent ticket from Northgate Dental Group: suspicious invoice email", href: ticketHref("Suspicious invoice"), createdAt: iso(now - 1.2 * HOUR), read: false },
    { id: "n2", text: "Oliver Bennett replied to “Outlook keeps asking for my password…”", href: ticketHref("Outlook keeps asking"), createdAt: iso(now - 4.3 * HOUR), read: false },
    { id: "n3", text: "SLA warning: 2 tickets are due to breach in the next hour", href: "/tickets?view=breaching", createdAt: iso(now - 0.4 * HOUR), read: false },
    { id: "n4", text: "Emily Rhodes hasn't accepted her invite yet", href: "/users", createdAt: iso(now - 26 * HOUR), read: true },
  ];

  return {
    users,
    companies,
    tickets,
    content,
    settings: DEFAULT_SETTINGS,
    permissions,
    notifications,
    nextTicketNumber: number,
  };
}
