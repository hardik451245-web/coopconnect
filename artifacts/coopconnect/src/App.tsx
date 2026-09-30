import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import {
  Activity, AlertTriangle, ArrowRight, Banknote, BarChart3, Bell, BriefcaseBusiness, Building2,
  CalendarDays, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, Code2, Compass,
  CreditCard, FileCheck2, FileText, HandHeart, Headphones, Home, IndianRupee, Languages,
  LayoutDashboard, LifeBuoy, ListChecks, LockKeyhole, MapPin, Menu, Mic, MoreHorizontal,
  PackageCheck, PanelLeft, PhoneCall, Plus, ReceiptIndianRupee, RefreshCw, Search, Settings2,
  ShieldCheck, Siren, SlidersHorizontal, Sparkles, Star, Store, UserRound, UsersRound, WalletCards,
  X, Zap, UserCheck, Navigation, PlayCircle, CircleStop, Edit3, QrCode, ClipboardCheck, LogOut,
  ChevronDown, ThumbsUp, MessageSquare, Phone, CalendarClock, Wallet, FileBadge, ShieldAlert,
  TrendingUp, PieChart, CircleDot, Route as RouteIcon
} from 'lucide-react';

const queryClient = new QueryClient();
type Role = 'customer' | 'worker' | 'admin';
type Lang = 'en' | 'hi' | 'mr';
type Toast = { title: string; text: string };
type Worker = { id: string; name: string; role: string; city: string; rating: number; jobs: number; years: number; initials: string; female?: boolean; verified: boolean; color: string; services: string[] };

export type CustomerSession = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  role: 'customer';
  token: string;
};

export type WorkerSession = {
  id: string;
  name: string;
  phone: string;
  role: 'worker';
  trade: string;
  token: string;
};

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  federation: string;
  token: string;
};

export type Booking = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  service: string;
  serviceCategory: string;
  workerId: string;
  worker: string;
  workerRole?: string;
  date: string;
  dateDisplay: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  workerEarning: number;
  contribution: number;
  total: number;
  notes?: string;
  femalePreference?: boolean;
  createdAt: string;
};

function getTodayDate(): Date {
  return new Date();
}

function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getEarliestBookingDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateYMD(d);
}

function formatDateDisplay(ymd: string): string {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem('coopconnect-customer-session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id) return parsed as CustomerSession;
    return null;
  } catch { return null; }
}

function getWorkerSession(): WorkerSession | null {
  try {
    const raw = localStorage.getItem('coopconnect-worker-session');
    if (!raw) return null;
    if (raw === 'true') {
      return {
        id: 'amit-sharma',
        name: 'Amit Sharma',
        phone: '+91 98901 23456',
        role: 'worker',
        trade: 'Electrical repair',
        token: 'tok_worker_amit_sharma'
      };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id) return parsed as WorkerSession;
    return null;
  } catch { return null; }
}

function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem('coopconnect-admin-session');
    if (!raw) return null;
    if (raw === 'true') {
      return {
        id: 'admin-01',
        name: 'Pune Cooperative Admin',
        email: 'admin@coopconnect.org',
        role: 'admin',
        federation: 'Pune District Labour Cooperative Federation',
        token: 'tok_admin_01'
      };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id) return parsed as AdminSession;
    return null;
  } catch { return null; }
}

const defaultCustomerSeed: CustomerSession = {
  id: 'cust-101',
  name: 'Kavya Deshmukh',
  phone: '+91 98220 12345',
  email: 'kavya.deshmukh@pune.coop',
  address: 'Model Colony, Pune',
  role: 'customer',
  token: 'tok_cust_101'
};

const seededCustomerBookings: Booking[] = [
  {
    id: 'BK-1001',
    customerId: 'cust-101',
    customerName: 'Kavya Deshmukh',
    customerPhone: '+91 98220 12345',
    service: 'Electrical repair',
    serviceCategory: 'Electrical',
    workerId: 'amit-sharma',
    worker: 'Amit Sharma',
    workerRole: 'Electrical & appliance repair',
    date: '2026-09-20',
    dateDisplay: '20 September 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Model Colony, Pune',
    status: 'Completed',
    workerEarning: 500,
    contribution: 100,
    total: 600,
    notes: 'Power trip switch check and kitchen socket replacement',
    createdAt: '2026-09-18T10:30:00.000Z',
  }
];

const workers: Worker[] = [
  { id: 'amit-sharma', name: 'Amit Sharma', role: 'Electrical & appliance repair', city: 'Pune, Maharashtra', rating: 4.9, jobs: 247, years: 8, initials: 'AS', verified: true, color: '#e9b96e', services: ['Electrical', 'Appliance repair'] },
  { id: 'priya-patil', name: 'Priya Patil', role: 'Home cleaning & care', city: 'Pune, Maharashtra', rating: 4.8, jobs: 184, years: 5, initials: 'PP', female: true, verified: true, color: '#ee9a88', services: ['Cleaning', 'Elder care'] },
  { id: 'rajesh-kumar', name: 'Rajesh Kumar', role: 'Plumbing & water systems', city: 'Pimpri-Chinchwad', rating: 4.7, jobs: 312, years: 11, initials: 'RK', verified: true, color: '#8ebcae', services: ['Plumbing', 'Water systems'] },
  { id: 'neha-verma', name: 'Neha Verma', role: 'Painting & finishing', city: 'Pune, Maharashtra', rating: 4.9, jobs: 96, years: 4, initials: 'NV', female: true, verified: true, color: '#d9a8b7', services: ['Painting', 'Finishing'] },
  { id: 'sanjay-more', name: 'Sanjay More', role: 'Carpentry & furniture', city: 'Wakad, Pune', rating: 4.6, jobs: 201, years: 9, initials: 'SM', verified: true, color: '#c7a681', services: ['Carpentry', 'Furniture'] },
  { id: 'meena-joshi', name: 'Meena Joshi', role: 'Deep cleaning & kitchen care', city: 'Kothrud, Pune', rating: 4.8, jobs: 168, years: 6, initials: 'MJ', female: true, verified: true, color: '#8ba8c7', services: ['Cleaning', 'Kitchen care'] },
];

const services = [
  { name: 'Electrical', icon: Zap, count: 18, price: 450, tint: 'bg-[#e3eee9]' },
  { name: 'Home cleaning', icon: Sparkles, count: 26, price: 650, tint: 'bg-[#f8e4d4]' },
  { name: 'Plumbing', icon: SlidersHorizontal, count: 14, price: 500, tint: 'bg-[#e4e9f2]' },
  { name: 'Painting', icon: Building2, count: 11, price: 1200, tint: 'bg-[#f0e2ed]' },
  { name: 'Carpentry', icon: PackageCheck, count: 9, price: 750, tint: 'bg-[#eee3d2]' },
  { name: 'Elder care', icon: HandHeart, count: 8, price: 850, tint: 'bg-[#e9e5cd]' },
];

const copy: Record<Lang, Record<string, string>> = {
  en: { home: 'Home', discover: 'Discover', bookings: 'Bookings', payments: 'Payments', profile: 'Profile', dashboard: 'Dashboard', admin: 'Admin console', services: 'Services', hello: 'Good morning', find: 'Find someone local you can trust.', tour: 'Platform Tour' },
  hi: { home: 'होम', discover: 'सेवाएं खोजें', bookings: 'बुकिंग', payments: 'भुगतान', profile: 'प्रोफ़ाइल', dashboard: 'डैशबोर्ड', admin: 'एडमिन कंसोल', services: 'सेवाएं', hello: 'सुप्रभात', find: 'अपने भरोसेमंद स्थानीय साथी को खोजें।', tour: 'प्लेटफ़ॉर्म टूर' },
  mr: { home: 'मुख्यपृष्ठ', discover: 'सेवा शोधा', bookings: 'बुकिंग', payments: 'पेमेंट', profile: 'प्रोफाइल', dashboard: 'डॅशबोर्ड', admin: 'अॅडमिन कन्सोल', services: 'सेवा', hello: 'शुभ प्रभात', find: 'तुमचा विश्वासू स्थानिक साथीदार शोधा.', tour: 'प्लॅटफॉर्म टूर' },
};

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) as T : initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

function Avatar({ worker, size = 'md' }: { worker: Worker; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-9 w-9 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-20 w-20 text-xl' };
  return <div data-testid={`avatar-${worker.id}`} className={`${sizes[size]} shrink-0 rounded-2xl flex items-center justify-center font-bold text-[#173d35]`} style={{ background: worker.color }}>{worker.initials}</div>;
}

function Badge({ children, tone = 'teal', className = '' }: { children: ReactNode; tone?: 'teal' | 'coral' | 'sand' | 'ink'; className?: string }) {
  const tones = { teal: 'bg-[#e2eee9] text-[#195b4b]', coral: 'bg-[#fae5dc] text-[#9b4935]', sand: 'bg-[#f4ead4] text-[#7d5a1c]', ink: 'bg-[#e2e6e1] text-[#3b514b]' };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em] ${tones[tone]} ${className}`}>{children}</span>;
}

function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, testId }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'outline' | 'danger'; className?: string; type?: 'button' | 'submit'; disabled?: boolean; testId?: string }) {
  const styles = {
    primary: 'bg-[#1d5c4d] text-[#fff9eb] hover:bg-[#15493d] shadow-[0_8px_20px_rgba(29,92,77,.18)]',
    quiet: 'bg-[#edf1e9] text-[#205648] hover:bg-[#e2eae2]',
    outline: 'border border-[#c9d5ca] bg-transparent text-[#205648] hover:bg-[#edf1e9]',
    danger: 'bg-[#c95042] text-[#fff8ef] hover:bg-[#ae4035]',
  };
  return <button type={type} data-testid={testId} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${styles[variant]} ${className}`}>{children}</button>;
}

function SectionTitle({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: ReactNode }) {
  return <div className="mb-6 flex items-end justify-between gap-4">
    <div><div className="mb-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#a75d45]">{eyebrow}</div><h2 className="font-serif text-3xl leading-tight text-[#173d35] md:text-4xl">{title}</h2>{text && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59706a]">{text}</p>}</div>{action}
  </div>;
}

function StateCard({ type, onRetry }: { type: 'loading' | 'empty' | 'error'; onRetry?: () => void }) {
  if (type === 'loading') return <div className="space-y-3"><div className="h-20 animate-pulse rounded-2xl bg-[#e9eee7]" /><div className="h-20 animate-pulse rounded-2xl bg-[#e9eee7]" /></div>;
  if (type === 'error') return <div className="rounded-2xl border border-[#edc9c0] bg-[#fff0e9] p-6 text-center"><AlertTriangle className="mx-auto mb-3 text-[#b14e3d]" /><p className="font-bold text-[#713c31]">This view needs a refresh</p><p className="mt-1 text-sm text-[#966457]">Your local data is safe. Try loading it again.</p><Button onClick={onRetry} variant="outline" className="mt-4">Try again</Button></div>;
  return <div className="rounded-2xl border border-dashed border-[#cbd8cd] bg-[#f9fbf6] p-8 text-center"><Compass className="mx-auto mb-3 text-[#7d9a8c]" /><p className="font-bold text-[#315d4e]">Nothing here yet</p><p className="mt-1 text-sm text-[#6b8078]">The next helpful step will show up here.</p></div>;
}

function Shell({ children, role, setRole, lang, setLang, onToast, onTour, onSos }: { children: ReactNode; role: Role; setRole: (r: Role) => void; lang: Lang; setLang: (l: Lang) => void; onToast: (t: Toast) => void; onTour: () => void; onSos: () => void }) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const t = copy[lang];
  const isWorker = role === 'worker';
  const isAdmin = role === 'admin';
  const nav: { href: string; label: string; icon: typeof Home }[] = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/services', label: t.discover, icon: Compass },
    { href: '/bookings', label: t.bookings, icon: CalendarDays },
    { href: '/payments', label: t.payments, icon: WalletCards },
  ];
  if (isWorker) {
    nav.splice(0, nav.length,
      { href: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/worker/jobs', label: 'Job Requests', icon: BriefcaseBusiness },
      { href: '/worker/my-jobs', label: 'My Jobs', icon: ListChecks },
      { href: '/worker/earnings', label: 'My Earnings', icon: WalletCards },
      { href: '/worker/passport', label: 'Digital Passport', icon: FileBadge },
      { href: '/worker/welfare', label: 'Cooperative Benefits', icon: HandHeart },
      { href: '/worker/insurance-emergency', label: 'Insurance & Emergency', icon: ShieldCheck },
      { href: '/worker/surplus', label: 'Surplus View', icon: BarChart3 },
      { href: '/worker/availability', label: 'Availability', icon: CalendarClock },
      { href: '/worker/ratings', label: 'Ratings', icon: Star },
      { href: '/worker/profile', label: 'Profile', icon: UserRound },
      { href: '/worker/safety', label: 'SOS & Safety', icon: Siren },
    );
  }
  if (isAdmin) {
    nav.splice(0, nav.length,
      { href: '/admin-dashboard', label: t.admin, icon: BarChart3 },
      { href: '/insurance', label: 'Insurance & Emergency', icon: ShieldCheck },
      { href: '/surplus', label: 'Surplus View', icon: ReceiptIndianRupee },
      { href: '/admin-dashboard', label: 'Welfare Dashboard', icon: HandHeart },
      { href: '/safety', label: 'Emergency Management', icon: Siren },
      { href: '/admin-dashboard', label: 'Analytics', icon: Activity },
    );
  }
  if (role === 'customer') {
    nav.push(
      { href: '/safety', label: 'Safety & Emergency', icon: LifeBuoy },
      { href: '/features', label: 'Contribution Transparency', icon: ReceiptIndianRupee },
    );
  }
  return <div className="noise min-h-[100dvh] bg-[#f5f4ed]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#173f36] px-5 py-6 text-[#f9f2df] lg:flex">
      <Link href="/" className="mb-9 flex items-center gap-3 px-2" data-testid="link-brand"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6b56f] text-[#173f36]"><UsersRound size={21} /></span><span><strong className="block text-lg tracking-tight">Coop<span className="text-[#e6b56f]">Connect</span></strong><small className="text-[10px] uppercase tracking-[.16em] text-[#9fbbb0]">Labour Cooperative Platform</small></span></Link>
      <div className="mb-4 rounded-xl border border-[#3d665b] bg-[#1e4b40] p-3"><div className="flex items-center gap-2 text-xs font-bold text-[#e6b56f]"><span className="h-2 w-2 rounded-full bg-[#8fd1a8]" /> Cooperative Network</div><p className="mt-1 text-[11px] leading-4 text-[#b7cec5]">Verified workers · transparent pricing</p></div>
      <nav className="space-y-1">{nav.map(item => { const I = item.icon; const active = location === item.href; return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-[#e8b66f] text-[#173f36]' : 'text-[#c0d5cc] hover:bg-[#28564a] hover:text-[#fff8e9]'}`}><I size={18} />{item.label}</Link>; })}</nav>
      <div className="mt-auto space-y-1 border-t border-[#356055] pt-4">
        <Link href="/features" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]" data-testid="link-features"><Sparkles size={17} />Why CoopConnect</Link>
        <Link href="/architecture" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]" data-testid="link-architecture"><Code2 size={17} />Architecture</Link>
        <Link href="/about" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]" data-testid="link-about"><HandHeart size={17} />About the cooperative</Link>
        <Link href="/projects" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]" data-testid="link-projects"><ListChecks size={17} />Projects</Link>
        <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]" data-testid="link-profile"><UserRound size={17} />Profile</Link>
        <button onClick={onSos} data-testid="button-sidebar-sos" className="mt-3 flex w-full items-center gap-3 rounded-xl border border-[#ba6556] px-3 py-2.5 text-sm font-bold text-[#ffbaa6] hover:bg-[#743f38]"><Siren size={17} />Safety SOS</button>
        {isWorker && <button onClick={() => { localStorage.removeItem('coopconnect-worker-session'); sessionStorage.removeItem('coopconnect-worker-session'); setLocation('/worker/login'); onToast({ title: 'Signed Out', text: 'You have exited the worker portal.' }); }} data-testid="button-sidebar-worker-logout" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]"><LogOut size={17} />Sign out (Worker)</button>}
        {role === 'customer' && <button onClick={() => { localStorage.removeItem('coopconnect-customer-session'); sessionStorage.removeItem('coopconnect-customer-session'); setLocation('/customer/login'); onToast({ title: 'Signed Out', text: 'You have exited the customer portal.' }); }} data-testid="button-sidebar-customer-logout" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]"><LogOut size={17} />Sign out (Customer)</button>}
        {isAdmin && <button onClick={() => { localStorage.removeItem('coopconnect-admin-session'); sessionStorage.removeItem('coopconnect-admin-session'); setLocation('/admin/login'); onToast({ title: 'Signed Out', text: 'You have exited the admin console.' }); }} data-testid="button-sidebar-admin-logout" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c0d5cc] hover:bg-[#28564a]"><LogOut size={17} />Sign out (Admin)</button>}
      </div>
    </aside>
    <div className="lg:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e0e4d9]/90 bg-[#f5f4ed]/95 px-4 backdrop-blur-md sm:px-7">
        <div className="flex items-center gap-3"><button onClick={() => setMenuOpen(v => !v)} className="rounded-lg p-2 text-[#315d4e] lg:hidden" data-testid="button-mobile-menu"><Menu size={21} /></button><div className="hidden items-center gap-2 text-xs text-[#70847a] md:flex"><span className="h-2 w-2 rounded-full bg-[#74ad82]" /> Offline-resilient · Securely synced</div><div className="md:hidden text-sm font-bold text-[#173d35]">Coop<span className="text-[#b4664d]">Connect</span></div></div>
        <div className="flex items-center gap-2 sm:gap-3"><button onClick={onTour} className="hidden items-center gap-2 rounded-xl bg-[#f4dfbd] px-3 py-2 text-xs font-bold text-[#6a4822] sm:flex" data-testid="button-start-tour"><Sparkles size={15} />{t.tour}</button>{isWorker && <button onClick={() => setNotificationsOpen(true)} className="relative rounded-xl border border-[#d8dfd5] bg-[#fffdf8] p-2.5 text-[#315d4e]" data-testid="button-worker-notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#c95042]" /></button>}<select value={lang} onChange={e => setLang(e.target.value as Lang)} data-testid="select-language" className="rounded-lg border border-[#d9dfd4] bg-transparent px-2 py-2 text-xs font-bold text-[#315d4e] outline-none"><option value="en">EN</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select><button onClick={() => setRoleOpen(true)} data-testid="button-role-selector" className="flex items-center gap-2 rounded-xl border border-[#d8dfd5] bg-[#fffdf8] px-2 py-1.5 text-left shadow-sm"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9b978] text-xs font-bold text-[#173d35]">{role === 'customer' ? 'CU' : role === 'worker' ? 'WO' : 'AD'}</span><span className="hidden pr-1 text-xs font-bold text-[#315d4e] sm:block">{role === 'customer' ? 'Customer' : role === 'worker' ? 'Worker' : 'Cooperative Admin'}</span><ChevronRight size={14} className="text-[#789187]" /></button></div>
      </header>
      {menuOpen && <div className="fixed inset-0 z-40 bg-[#173f36]/30 lg:hidden" onClick={() => setMenuOpen(false)}><div className="h-full w-[290px] overflow-y-auto bg-[#173f36] p-5 text-[#f9f2df]" onClick={e => e.stopPropagation()}><div className="mb-7 flex items-center justify-between"><strong className="text-lg">Coop<span className="text-[#e6b56f]">Connect</span></strong><button onClick={() => setMenuOpen(false)} data-testid="button-close-menu"><X /></button></div>{isWorker && <div className="mb-4 rounded-xl bg-[#28564a] p-3"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e6b56f]">Amit Sharma</p><p className="mt-1 text-xs text-[#c0d5cc]">Verified cooperative worker</p></div>}{nav.map(item => { const I = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#d4e2d9] hover:bg-[#28564a]"><I size={18} />{item.label}</Link>; })}<button onClick={onSos} className="mt-8 flex w-full items-center gap-3 rounded-xl border border-[#ba6556] px-3 py-3 text-sm font-bold text-[#ffbaa6]" data-testid="button-mobile-sos"><Siren size={18} />Safety SOS</button>{isWorker && <button onClick={() => { localStorage.removeItem('coopconnect-worker-session'); sessionStorage.removeItem('coopconnect-worker-session'); setLocation('/worker/login'); setMenuOpen(false); }} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#d4e2d9]" data-testid="button-worker-logout"><LogOut size={18} />Sign out (Worker)</button>}{role === 'customer' && <button onClick={() => { localStorage.removeItem('coopconnect-customer-session'); sessionStorage.removeItem('coopconnect-customer-session'); setLocation('/customer/login'); setMenuOpen(false); }} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#d4e2d9]" data-testid="button-customer-logout"><LogOut size={18} />Sign out (Customer)</button>}{isAdmin && <button onClick={() => { localStorage.removeItem('coopconnect-admin-session'); sessionStorage.removeItem('coopconnect-admin-session'); setLocation('/admin/login'); setMenuOpen(false); }} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#d4e2d9]" data-testid="button-admin-logout"><LogOut size={18} />Sign out (Admin)</button>}</div></div>}
      <main className="mx-auto max-w-[1390px] px-4 py-7 pb-24 sm:px-7 lg:px-10 lg:pb-10">{children}</main>
    </div>
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-[#dce3d7] bg-[#fffdf8]/95 p-2 shadow-[0_12px_34px_rgba(22,65,54,.16)] backdrop-blur-md lg:hidden">{(isWorker ? [{ href: '/worker/dashboard', label: 'Home', icon: Home }, { href: '/worker/jobs', label: 'Jobs', icon: BriefcaseBusiness }, { href: '/worker/earnings', label: 'Earnings', icon: WalletCards }, { href: '/worker/my-jobs', label: 'Activity', icon: Activity }, { href: '/worker/profile', label: 'Profile', icon: UserRound }] : nav.slice(0, 4)).map(item => { const I = item.icon; return <Link key={item.href} href={item.href} data-testid={`mobile-nav-${item.label}`} className={`flex min-w-[50px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold ${location === item.href ? 'bg-[#e5efe8] text-[#1d5c4d]' : 'text-[#73867d]'}`}><I size={18} />{item.label}</Link>; })}</nav>
    {roleOpen && <Modal title="Switch User View" onClose={() => setRoleOpen(false)}><p className="mb-4 text-sm text-[#62766d]">Switch between perspectives in the cooperative platform anytime.</p><div className="space-y-2">{(['customer', 'worker', 'admin'] as Role[]).map(item => <button key={item} onClick={() => {
      setRoleOpen(false);
      if (item === 'customer') {
        const session = getCustomerSession();
        if (session) {
          setRole('customer');
          setLocation('/customer/dashboard');
          onToast({ title: 'View switched', text: 'Switched to Customer portal.' });
        } else {
          setRole('customer');
          setLocation('/customer/login');
          onToast({ title: 'Authentication required', text: 'Please sign in to access Customer portal.' });
        }
      } else if (item === 'worker') {
        const session = getWorkerSession();
        if (session) {
          setRole('worker');
          setLocation('/worker/dashboard');
          onToast({ title: 'View switched', text: 'Switched to Worker portal.' });
        } else {
          setRole('worker');
          setLocation('/worker/login');
          onToast({ title: 'Authentication required', text: 'Please sign in to access Worker portal.' });
        }
      } else if (item === 'admin') {
        const session = getAdminSession();
        if (session) {
          setRole('admin');
          setLocation('/admin-dashboard');
          onToast({ title: 'View switched', text: 'Switched to Cooperative Admin console.' });
        } else {
          setRole('admin');
          setLocation('/admin/login');
          onToast({ title: 'Authentication required', text: 'Please sign in to access Cooperative Admin console.' });
        }
      }
    }} data-testid={`button-role-${item}`} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${role === item ? 'border-[#1d5c4d] bg-[#e7f0ea]' : 'border-[#e0e4d9] hover:bg-[#f4f7f1]'}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2d09b] text-sm font-bold text-[#315d4e]">{item === 'customer' ? 'CU' : item === 'worker' ? 'WO' : 'AD'}</span><span><strong className="block text-sm capitalize text-[#1a4a3e]">{item === 'admin' ? 'Cooperative Admin' : item}</strong><small className="text-xs text-[#73867d]">{item === 'customer' ? 'Find and book trusted help' : item === 'worker' ? 'Manage work and welfare' : 'Run the cooperative'}</small></span>{role === item && <Check className="ml-auto text-[#1d5c4d]" size={18} />}</button>)}</div></Modal>}
    {notificationsOpen && <Modal title="Worker notifications" onClose={() => setNotificationsOpen(false)}><div className="space-y-2">{[['New job request', 'Kitchen plumbing near Kothrud · ₹850 estimated', BriefcaseBusiness], ['Booking starts in 1 hour', 'Electrical repair with Priya at 2:00 PM', CalendarClock], ['Contribution recorded', 'Today’s ₹200 cooperative contribution is visible.', ReceiptIndianRupee], ['Passport updated', 'Safety training was added to your profile.', FileBadge], ['Emergency request status', 'Assistance request CC-SOS-042 is active.', ShieldAlert]].map(([title, text, Icon], index) => { const NoticeIcon = Icon as typeof Bell; return <div key={String(title)} className="flex gap-3 rounded-2xl bg-[#f2f6ef] p-3" data-testid={`notification-${index}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e2eee9] text-[#246452]"><NoticeIcon size={17} /></span><div><p className="text-sm font-bold text-[#285548]">{String(title)}</p><p className="mt-1 text-xs leading-5 text-[#72847b]">{String(text)}</p></div></div>; })}</div></Modal>}
  </div>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#173f36]/45 p-4 backdrop-blur-sm"><div className={`max-h-[90vh] w-full overflow-auto rounded-3xl border border-[#dbe2d6] bg-[#fffdf8] p-6 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}><div className="mb-5 flex items-center justify-between"><h3 className="font-serif text-2xl text-[#173d35]">{title}</h3><button onClick={onClose} data-testid="button-modal-close" className="rounded-lg p-2 text-[#6e8479] hover:bg-[#edf2ea]"><X size={19} /></button></div>{children}</div></div>;
}

function Stat({ label, value, note, icon: Icon, accent = 'teal' }: { label: string; value: string; note?: string; icon: typeof Activity; accent?: 'teal' | 'coral' | 'sand' }) {
  const bg = accent === 'coral' ? 'bg-[#f8e4dc] text-[#a14d3d]' : accent === 'sand' ? 'bg-[#f6e7c7] text-[#8c651f]' : 'bg-[#e1eee8] text-[#246452]';
  return <div className="rounded-2xl border border-[#dfe5da] bg-[#fffdf8] p-4"><div className="flex items-start justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#789087]">{label}</div><div className="mt-2 text-2xl font-bold tracking-tight text-[#193f36]">{value}</div>{note && <div className="mt-1 text-xs text-[#73877d]">{note}</div>}</div><span className={`grid h-9 w-9 place-items-center rounded-xl ${bg}`}><Icon size={17} /></span></div></div>;
}

function HomePage({ onToast, onTour }: { onToast: (t: Toast) => void; onTour: () => void }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  return <div className="space-y-12">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#174a3d] px-6 py-9 text-[#fff8e9] sm:px-10 sm:py-12 lg:px-16 lg:py-16">
      <div className="paper-grid absolute inset-0 opacity-20" /><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[32px] border-[#e6b56f]/25" /><div className="absolute -bottom-28 right-16 h-56 w-56 rounded-full border-[22px] border-[#e99a83]/20" />
      <div className="relative max-w-3xl animate-rise"><Badge tone="sand"><span className="h-1.5 w-1.5 rounded-full bg-[#a4d19d]" /> Cooperative Gig Services Platform</Badge><h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.035em] sm:text-6xl lg:text-7xl">Good work,<br /><em className="text-[#efbe7d]">close to home.</em></h1><p className="mt-6 max-w-xl text-base leading-7 text-[#c5d9ce] sm:text-lg">CoopConnect makes local services easier to find and fairer to work in — with trusted people, visible welfare, and a share in every booking.</p><div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => setLocation('/services')} className="bg-[#edbd76] text-[#173f36] hover:bg-[#f4ce91]" testId="button-find-worker">Find a local worker <ArrowRight size={17} /></Button><Button onClick={onTour} variant="outline" className="border-[#729b8a] text-[#fff8e9] hover:bg-[#285d4f]" testId="button-home-tour"><Sparkles size={16} /> {copy.en.tour}</Button></div><div className="mt-9 flex flex-wrap gap-5 text-xs text-[#b3cec1]"><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#9cd1a2]" /> Verified worker passports</span><span className="flex items-center gap-2"><LockKeyhole size={15} className="text-[#9cd1a2]" /> No hidden fees</span><span className="flex items-center gap-2"><LifeBuoy size={15} className="text-[#9cd1a2]" /> Safety-first support</span></div></div>
      <div className="relative mt-10 grid max-w-3xl grid-cols-3 gap-2 border-t border-[#4b7669] pt-5 sm:absolute sm:bottom-12 sm:right-10 sm:mt-0 sm:w-[320px] sm:border-t-0 sm:pt-0"><div><strong className="block text-2xl text-[#efbe7d]">1,240</strong><span className="text-[11px] text-[#b3cec1]">local jobs created</span></div><div><strong className="block text-2xl text-[#efbe7d]">6</strong><span className="text-[11px] text-[#b3cec1]">verified cooperative workers</span></div><div><strong className="block text-2xl text-[#efbe7d]">20%</strong><span className="text-[11px] text-[#b3cec1]">community share</span></div></div>
    </section>
    <section><SectionTitle eyebrow="Start with a need" title="What can your neighbourhood help with?" text="Search by service, then compare the person behind the profile — not just a star rating." /><div className="flex max-w-2xl gap-2 rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-2 shadow-sm"><Search className="ml-2 mt-2 text-[#83968b]" size={20} /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && setLocation(`/services${query ? `?q=${query}` : ''}`)} placeholder="Try “leaking tap” or “deep cleaning”" data-testid="input-home-search" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#193f36] outline-none placeholder:text-[#93a29b]" /><Button onClick={() => setLocation(`/services${query ? `?q=${query}` : ''}`)} className="shrink-0" testId="button-home-search">Search</Button></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{services.map(({ name, icon: I, count, tint }) => <button key={name} onClick={() => setLocation(`/services?q=${name}`)} data-testid={`button-service-${name}`} className={`group rounded-2xl ${tint} p-4 text-left transition-transform hover:-translate-y-1`}><I size={20} className="text-[#286354]" /><strong className="mt-8 block text-sm text-[#285548]">{name}</strong><span className="mt-1 block text-xs text-[#6d8076]">{count} nearby workers</span></button>)}</div></section>
    <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8"><Badge tone="coral">The cooperative difference</Badge><h2 className="mt-4 max-w-lg font-serif text-3xl leading-tight text-[#173d35]">Every booking strengthens the people doing the work.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#62766d]">The price is clear before you confirm. Worker earnings are shown separately. A 20% cooperative contribution funds insurance, emergency help, technology, and year-end surplus for members.</p><Link href="/features" data-testid="link-home-features" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#a4523f]">See all five differentiators <ArrowRight size={16} /></Link></div><div className="rounded-3xl bg-[#f0dec1] p-6 sm:p-8"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.14em] text-[#86612a]">Contribution in view</span><ReceiptIndianRupee className="text-[#a26d31]" size={21} /></div><div className="mt-8 flex items-end gap-2"><strong className="font-serif text-6xl text-[#5c431d]">20%</strong><span className="mb-2 text-sm text-[#765b2e]">of service value<br />returns to the community</span></div><div className="mt-7 h-3 overflow-hidden rounded-full bg-[#dec599]"><div className="flex h-full"><span className="w-1/4 bg-[#a75d45]" /><span className="w-[30%] bg-[#246452]" /><span className="w-1/5 bg-[#e0a55d]" /><span className="w-1/4 bg-[#789a72]" /></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#72562d]"><span>5% technology</span><span>6% insurance</span><span>4% emergency</span><span>5% year-end surplus</span></div></div></section>
    <section><SectionTitle eyebrow="Built for visible trust" title="Five ideas, one fairer service network." action={<Link href="/features" className="hidden items-center gap-2 text-sm font-bold text-[#a4523f] sm:flex" data-testid="link-differentiators">Explore the model <ArrowRight size={15} /></Link>} /><div className="grid gap-3 md:grid-cols-5">{['Cooperative Worker Digital Passport', 'Community Group Booking & Job Pooling', 'Transparent Cooperative Contribution', 'Women-Safe Service Assignment', 'AI Coordinated Multi-Service Project Booking'].map((item, i) => <div key={item} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7efe8] text-sm font-bold text-[#1d5c4d]">0{i + 1}</span><p className="mt-5 text-sm font-bold leading-5 text-[#2c5549]">{item}</p></div>)}</div></section>
  </div>;
}

function ServicesPage({ onToast }: { onToast: (t: Toast) => void }) {
  const [search, setSearch] = useState('');
  const [female, setFemale] = useState(false);
  const [voice, setVoice] = useState(false);
  const filtered = useMemo(() => workers.filter(w => (!female || w.female) && `${w.name} ${w.role} ${w.services.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [search, female]);
  const [, setLocation] = useLocation();
  const handleVoice = () => {
    setVoice(true);
    const browserWindow = window as Window & {
      SpeechRecognition?: new () => { start: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void };
      webkitSpeechRecognition?: new () => { start: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void };
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (Recognition) {
      const recognizer = new Recognition();
      recognizer.onresult = event => setSearch(event.results[0][0].transcript);
      recognizer.start();
    } else {
      setSearch('home cleaning');
      onToast({ title: 'Voice fallback used', text: 'Speech recognition is unavailable; showing top recommended services.' });
    }
    setTimeout(() => setVoice(false), 1400);
  };
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge>Local discovery</Badge><h1 className="mt-3 font-serif text-4xl text-[#173d35]">People who keep Pune moving.</h1><p className="mt-2 text-sm text-[#62766d]">Compare verified experience, safety choices, and a price that shows its full story.</p></div><Button onClick={() => setLocation('/group-booking')} variant="quiet" testId="button-group-booking"><UsersRound size={17} />Pool a neighbourhood job</Button></div><div className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-3 shadow-sm"><div className="flex flex-wrap gap-2"><div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-[#f1f4ed] px-3"><Search size={18} className="text-[#7f9489]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills, names, or service type" data-testid="input-service-search" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#91a19a]" /><button onClick={handleVoice} data-testid="button-voice-search" className={`rounded-lg p-1.5 ${voice ? 'bg-[#f2d09b]' : 'text-[#477367]'}`}><Mic size={17} /></button></div><button onClick={() => setFemale(v => !v)} data-testid="button-female-filter" className={`flex items-center gap-2 rounded-xl border px-3 text-sm font-bold ${female ? 'border-[#1d5c4d] bg-[#e3eee9] text-[#1d5c4d]' : 'border-[#dce4d9] text-[#60766c]'}`}><ShieldCheck size={16} />Women-safe assignment {female && <Check size={15} />}</button></div></div><div className="flex items-center justify-between"><p className="text-sm text-[#72847b]"><strong className="text-[#315d4e]">{filtered.length}</strong> verified matches nearby</p><button className="flex items-center gap-1 text-xs font-bold text-[#477367]" data-testid="button-sort-services"><SlidersHorizontal size={15} /> Recommended</button></div>{filtered.length === 0 ? <StateCard type="empty" /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(w => <div key={w.id} className="group rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 transition-all hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(28,73,60,.1)]" data-testid={`card-worker-${w.id}`}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><Avatar worker={w} /><div><h3 className="font-bold text-[#1b473c]">{w.name}</h3><p className="text-xs text-[#6f8279]">{w.role}</p></div></div><Badge tone="teal"><ShieldCheck size={12} /> verified</Badge></div><div className="mt-5 flex items-center gap-4 text-xs text-[#60756b]"><span className="flex items-center gap-1 font-bold text-[#835c25]"><Star size={14} fill="#d99949" className="text-[#d99949]" />{w.rating}</span><span>{w.jobs} jobs</span><span>{w.years} years</span></div><div className="mt-4 flex flex-wrap gap-1.5">{w.services.map(s => <span key={s} className="rounded-md bg-[#f0f3ed] px-2 py-1 text-[11px] text-[#5f766c]">{s}</span>)}</div><div className="mt-5 flex gap-2"><Button onClick={() => setLocation(`/worker/${w.id}`)} variant="outline" className="flex-1" testId={`button-passport-${w.id}`}>View passport</Button><Button onClick={() => { setLocation(`/book?worker=${w.id}`); onToast({ title: 'Booking started', text: `${w.name} is ready for your service details.` }); }} className="flex-1" testId={`button-book-${w.id}`}>Book</Button></div></div>)}</div>}</div>;
}

function WorkerPassport() {
  const { id } = useParams<{ id: string }>();
  const worker = workers.find(w => w.id === id) ?? workers[0];
  const [, setLocation] = useLocation();
  return <div className="space-y-7"><Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-[#53796c]" data-testid="link-back-services">← Back to discovery</Link><section className="overflow-hidden rounded-3xl bg-[#174a3d] text-[#fff8e9]"><div className="h-20 bg-[#276354] paper-grid opacity-80" /><div className="-mt-10 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end"><Avatar worker={worker} size="lg" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="font-serif text-4xl">{worker.name}</h1><Badge tone="sand"><ShieldCheck size={13} /> Member verified</Badge></div><p className="mt-1 text-[#c5d9ce]">{worker.role} · {worker.city}</p></div><Button onClick={() => setLocation(`/book?worker=${worker.id}`)} className="bg-[#e6b56f] text-[#173f36] hover:bg-[#f2ca8b]" testId="button-passport-book">Book {worker.name.split(' ')[0]}</Button></div><div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#4d766a] pt-6 sm:grid-cols-4"><div><strong className="text-2xl">{worker.rating}</strong><span className="ml-1 text-[#a6c6b9]">/ 5</span><p className="mt-1 text-xs text-[#a6c6b9]">community rating</p></div><div><strong className="text-2xl">{worker.jobs}</strong><p className="mt-1 text-xs text-[#a6c6b9]">jobs completed</p></div><div><strong className="text-2xl">{worker.years}</strong><p className="mt-1 text-xs text-[#a6c6b9]">years in the trade</p></div><div><strong className="text-2xl">6</strong><p className="mt-1 text-xs text-[#a6c6b9]">safety checks</p></div></div></div></section><div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-5"><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6"><SectionTitle eyebrow="Digital passport" title="Proof that travels with the person." text="A member-owned profile that brings skill, history, and welfare context together — without exposing private details." /><div className="grid gap-3 sm:grid-cols-2">{[['Identity check', 'Government ID verified', FileCheck2], ['Skill evidence', 'Trade assessment · Level 3', BriefcaseBusiness], ['Safety orientation', 'Completed 12 Jan 2026', ShieldCheck], ['Cooperative standing', 'Member since 2021', UsersRound]].map(([a, b, I]) => { const Icon = I as typeof Check; return <div key={a as string} className="flex gap-3 rounded-xl bg-[#f2f5ef] p-3"><Icon className="mt-0.5 text-[#276354]" size={18} /><span><strong className="block text-sm text-[#2d574a]">{a as string}</strong><small className="text-xs text-[#71857b]">{b as string}</small></span></div>; })}</div></section><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6"><h3 className="font-serif text-2xl text-[#173d35]">Recent work</h3><div className="mt-4 space-y-3">{['Rewired a 2BHK in Aundh', 'Installed energy-safe kitchen fixtures', 'Mentored two apprentice members'].map((x, i) => <div key={x} className="flex items-center gap-3 border-b border-[#edf0e9] pb-3 text-sm text-[#577168]"><CheckCircle2 className="text-[#4a9a73]" size={17} />{x}<span className="ml-auto text-xs text-[#94a39c]">{i + 2}w ago</span></div>)}</div></section></div><aside className="rounded-2xl border border-[#e1d6c2] bg-[#f4e8d1] p-6"><Badge tone="sand">Safety choice</Badge><h3 className="mt-4 font-serif text-2xl text-[#49391f]">Feel comfortable at home.</h3><p className="mt-2 text-sm leading-6 text-[#766243]">Choose a women-worker preference, share arrival details with a trusted contact, and reach cooperative support from every booking.</p><div className="mt-6 flex items-start gap-3 border-t border-[#dfcda9] pt-4"><LockKeyhole size={18} className="mt-0.5 text-[#9a6d2b]" /><span className="text-xs leading-5 text-[#796345]">Personal documents remain private and protected. Verified cooperative standing is confirmed.</span></div></aside></div></div>;
}

function BookPage({ onToast }: { onToast: (t: Toast) => void }) {
  const [, setLocation] = useLocation();
  const cust = getCustomerSession();
  useEffect(() => {
    if (!cust) {
      setLocation('/customer/login');
    }
  }, [cust, setLocation]);

  if (!cust) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center" data-testid="redirecting-customer-login">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d5c4d] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#285548]">Redirecting to Customer Sign In...</p>
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  const selected = workers.find(w => w.id === params.get('worker')) ?? workers[0];
  const [step, setStep] = useState(1);
  const [service, setService] = useState('Electrical repair');
  const [female, setFemale] = useState(false);
  const minDate = getEarliestBookingDate();
  const [date, setDate] = useState(minDate);
  const [dateError, setDateError] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useStored<Booking[]>('coopconnect-customer-bookings', seededCustomerBookings);
  const timeSlots = ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:00 PM - 04:00 PM', '04:30 PM - 06:30 PM'];
  const value = service.toLowerCase().includes('clean') ? 650 : service.toLowerCase().includes('paint') ? 1200 : 500;
  const contribution = Math.round(value * .2);

  const next = () => {
    if (step === 3) {
      if (!date || date < minDate) {
        setDateError(`Bookings must be scheduled at least 1 day in advance. Earliest available date is ${formatDateDisplay(minDate)}.`);
        return;
      }
      setDateError('');
      setStep(4);
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      const cust = getCustomerSession() || defaultCustomerSeed;
      const newBooking: Booking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        service,
        serviceCategory: service.split(' ')[0],
        workerId: selected.id,
        worker: selected.name,
        workerRole: selected.role,
        date,
        dateDisplay: formatDateDisplay(date),
        time: timeSlot,
        location: cust.address || 'Model Colony, Pune',
        status: 'Confirmed',
        workerEarning: value,
        contribution,
        total: value + contribution,
        notes: notes || undefined,
        femalePreference: female,
        createdAt: new Date().toISOString(),
      };
      setBookings([newBooking, ...bookings]);
      setConfirmedBooking(newBooking);
      setStep(5);
      onToast({ title: 'Booking confirmed', text: `${service} with ${selected.name} on ${formatDateDisplay(date)} is confirmed.` });
    }
  };

  if (step === 5 && confirmedBooking) {
    return <div className="mx-auto max-w-2xl space-y-7 animate-rise" data-testid="view-booking-confirmation">
      <div className="rounded-[2.5rem] border border-[#d7e4d8] bg-[#fffdf8] p-7 text-center shadow-[0_24px_70px_rgba(25,72,59,.1)] sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#dff0e4] text-[#246b54]"><CheckCircle2 size={36} /></div>
        <Badge tone="teal" className="mt-4"><Check size={12} /> Booking Confirmed</Badge>
        <h1 className="mt-3 font-serif text-3xl text-[#173d35] sm:text-4xl">Your service is scheduled!</h1>
        <p className="mt-2 text-sm text-[#62766d]">Reference ID: <strong className="text-[#173d35]" data-testid="confirmation-booking-id">{confirmedBooking.id}</strong> · Status: <span className="font-bold text-[#28705a]">Confirmed</span></p>
        <div className="mt-7 space-y-3 rounded-2xl border border-[#e1e7df] bg-[#f8faf6] p-5 text-left text-sm">
          <div className="flex justify-between border-b border-[#e7ece5] pb-3"><span className="text-[#6d8177]">Service</span><strong className="text-[#173d35]">{confirmedBooking.service}</strong></div>
          <div className="flex justify-between border-b border-[#e7ece5] pb-3"><span className="text-[#6d8177]">Scheduled Date</span><strong className="text-[#173d35]">{confirmedBooking.dateDisplay}</strong></div>
          <div className="flex justify-between border-b border-[#e7ece5] pb-3"><span className="text-[#6d8177]">Scheduled Time</span><strong className="text-[#173d35]">{confirmedBooking.time}</strong></div>
          <div className="flex justify-between border-b border-[#e7ece5] pb-3"><span className="text-[#6d8177]">Assigned Professional</span><strong className="text-[#173d35]">{confirmedBooking.worker}</strong></div>
          <div className="flex justify-between border-b border-[#e7ece5] pb-3"><span className="text-[#6d8177]">Service Address</span><strong className="text-[#173d35]">{confirmedBooking.location}</strong></div>
          <div className="flex justify-between pt-1"><span className="text-[#6d8177]">Total Payable</span><strong className="text-base text-[#a4523f]">₹{confirmedBooking.total.toLocaleString('en-IN')}</strong></div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => setLocation('/bookings')} className="flex-1" testId="button-confirm-view-bookings"><CalendarDays size={16} /> View in My Bookings</Button>
          <Button onClick={() => setLocation('/customer/dashboard')} variant="outline" className="flex-1" testId="button-confirm-return-dashboard"><Home size={16} /> Return to Dashboard</Button>
        </div>
        <button onClick={() => { setStep(1); setConfirmedBooking(null); }} className="mt-5 text-xs font-bold text-[#57796c] hover:underline" data-testid="button-confirm-book-another">+ Book another service</button>
      </div>
    </div>;
  }

  return <div className="mx-auto max-w-5xl space-y-7">
    <div><Badge tone="coral">Transparent booking</Badge><h1 className="mt-3 font-serif text-4xl text-[#173d35]">Book a trusted local service.</h1><p className="mt-2 text-sm text-[#62766d]">No surprise add-ons. You see the worker earning and community allocation before you confirm.</p></div>
    <div className="flex items-center gap-1 overflow-auto pb-1">{['Your need', 'Safety choice', 'Schedule', 'Review & confirm'].map((x, i) => <div key={x} className="flex min-w-max items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${step > i + 1 ? 'bg-[#79ad85] text-white' : step === i + 1 ? 'bg-[#1d5c4d] text-white' : 'bg-[#e5ebe4] text-[#799087]'}`}>{step > i + 1 ? <Check size={15} /> : i + 1}</span><span className={`text-xs font-bold ${step === i + 1 ? 'text-[#1d5c4d]' : 'text-[#83958c]'}`}>{x}</span>{i < 3 && <span className="mx-2 h-px w-8 bg-[#d8e1d8] sm:w-16" />}</div>)}</div>
    <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
      <section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8">
        {step === 1 && <div className="animate-rise">
          <h2 className="font-serif text-2xl text-[#173d35]">What do you need help with?</h2>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">{services.map(s => <button key={s.name} onClick={() => setService(s.name)} data-testid={`button-book-service-${s.name}`} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${service.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ? 'border-[#1d5c4d] bg-[#e9f1eb]' : 'border-[#e1e7df]'}`}><s.icon size={18} className="text-[#397362]" /><span className="text-sm font-bold text-[#315d4e]">{s.name}</span>{service.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) && <Check className="ml-auto text-[#1d5c4d]" size={16} />}</button>)}</div>
          <label className="mt-6 block text-xs font-bold uppercase tracking-[.1em] text-[#758b80]">Tell us a little more<input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. tap is leaking under the sink" data-testid="input-book-notes" className="mt-2 w-full rounded-xl border border-[#dce4d9] bg-[#f8faf6] p-3 text-sm outline-none focus:border-[#6e9d8c]" /></label>
        </div>}
        {step === 2 && <div className="animate-rise">
          <h2 className="font-serif text-2xl text-[#173d35]">Make the visit feel right.</h2>
          <p className="mt-2 text-sm text-[#62766d]">Your preferences are shared only with the cooperative coordinator.</p>
          <button onClick={() => setFemale(v => !v)} data-testid="button-book-female-preference" className={`mt-7 flex w-full items-start gap-4 rounded-2xl border p-4 text-left ${female ? 'border-[#1d5c4d] bg-[#e6f0ea]' : 'border-[#dce4d9]'}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4dfbd] text-[#8d6227]"><ShieldCheck size={20} /></span><span className="flex-1"><strong className="block text-sm text-[#285548]">Prefer a woman worker</strong><span className="mt-1 block text-xs leading-5 text-[#71857b]">We will prioritise a verified woman worker where the service and time slot allow it.</span></span>{female ? <CheckCircle2 className="text-[#1d5c4d]" /> : <span className="h-5 w-5 rounded-full border-2 border-[#c4d2c7]" />}</button>
          <div className="mt-4 rounded-xl bg-[#f3f6ef] p-4 text-xs leading-5 text-[#647a70]"><LockKeyhole size={15} className="mr-1 inline text-[#4d7c6b]" /> Your preference never changes the worker's rating or earnings.</div>
        </div>}
        {step === 3 && <div className="animate-rise">
          <h2 className="font-serif text-2xl text-[#173d35]">Choose a time that works.</h2>
          <div className="mt-5 rounded-xl border border-[#d2dfd5] bg-[#edf5f0] p-3 text-xs leading-5 text-[#2d6151]"><CalendarClock size={15} className="mr-1.5 inline text-[#246452]" />Earliest available booking date is <strong>{formatDateDisplay(minDate)}</strong>. Bookings must be scheduled at least 1 day in advance.</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-[.1em] text-[#758b80]">Preferred date (Earliest: {formatDateDisplay(minDate)})
            <input type="date" min={minDate} value={date} onChange={e => { const val = e.target.value; setDate(val); if (!val || val < minDate) { setDateError(`Earliest available booking date is ${formatDateDisplay(minDate)}. Past and same-day dates are disabled.`); } else { setDateError(''); } }} data-testid="input-book-date" className={`mt-2 w-full rounded-xl border ${dateError ? 'border-[#c95042] bg-[#fff5f2]' : 'border-[#dce4d9] bg-[#f8faf6]'} p-3 text-sm outline-none`} />
          </label>
          {dateError && <p className="mt-2 text-xs font-bold text-[#b14e3d]" data-testid="error-book-date"><AlertTriangle size={13} className="mr-1 inline" />{dateError}</p>}
          <div className="mt-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#758b80]">Select Preferred Time Slot</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">{timeSlots.map(slot => <button key={slot} type="button" onClick={() => setTimeSlot(slot)} data-testid={`button-time-${slot.replace(/\s+/g, '-')}`} className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-colors ${timeSlot === slot ? 'border-[#1d5c4d] bg-[#e3eee9] text-[#1d5c4d]' : 'border-[#dce4d9] bg-white text-[#476a5e] hover:bg-[#f3f7f1]'}`}><span>{slot}</span>{timeSlot === slot && <Check size={14} />}</button>)}</div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f7ead3] p-4 text-sm text-[#715a32]"><MapPin size={17} />Pune cooperative cluster · Model Colony, Pune</div>
        </div>}
        {step === 4 && <div className="animate-rise">
          <h2 className="font-serif text-2xl text-[#173d35]">Review before you confirm.</h2>
          <div className="mt-6 rounded-2xl bg-[#f3f6ef] p-4">
            <div className="flex items-center gap-3">
              <Avatar worker={selected} />
              <div>
                <strong className="block text-sm text-[#285548]">{selected.name}</strong>
                <span className="text-xs text-[#71857b]">{service} · {formatDateDisplay(date)} ({timeSlot})</span>
              </div>
              <Badge tone="teal" className="ml-auto"><ShieldCheck size={12} /> verified</Badge>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#6d8177]">Scheduled Date</span><strong className="text-[#285548]">{formatDateDisplay(date)}</strong></div>
            <div className="flex justify-between"><span className="text-[#6d8177]">Selected Slot</span><strong className="text-[#285548]">{timeSlot}</strong></div>
            <div className="flex justify-between"><span className="text-[#6d8177]">Worker direct earning</span><strong className="text-[#285548]">₹{value.toLocaleString('en-IN')}</strong></div>
            <div className="flex justify-between"><span className="text-[#6d8177]">Cooperative contribution (20%)</span><strong className="text-[#285548]">₹{contribution.toLocaleString('en-IN')}</strong></div>
            <div className="flex justify-between border-t border-[#dce4d9] pt-3 text-base"><strong className="text-[#173d35]">Total payable</strong><strong className="text-[#a4523f]">₹{(value + contribution).toLocaleString('en-IN')}</strong></div>
          </div>
        </div>}
        <div className="mt-8 flex justify-between border-t border-[#edf0e9] pt-5">
          {step > 1 ? <Button onClick={() => setStep(step - 1)} variant="outline">Back</Button> : <span />}
          <Button onClick={next} testId="button-book-next">{step === 4 ? 'Confirm booking' : 'Continue'} <ArrowRight size={16} /></Button>
        </div>
      </section>
      <aside className="h-fit rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.13em] text-[#efbe7d]"><ReceiptIndianRupee size={16} /> Price preview</div>
        <div className="mt-7 font-serif text-4xl">₹{(value + contribution).toLocaleString('en-IN')}</div>
        <p className="mt-1 text-xs text-[#b7cec5]">transparent total · no hidden charges</p>
        <div className="my-6 space-y-3 border-y border-[#477368] py-5 text-sm">
          <div className="flex justify-between"><span className="text-[#bad1c7]">Worker earning</span><span>₹{value.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-[#bad1c7]">Community share (20%)</span><span>₹{contribution.toLocaleString('en-IN')}</span></div>
        </div>
        <p className="text-xs leading-5 text-[#b7cec5]">The community share funds technology (5%), insurance & social security (6%), emergency assistance (4%), and year-end surplus (5%).</p>
      </aside>
    </div>
  </div>;
}

function BookingsPage() {
  const [, setLocation] = useLocation();
  const cust = getCustomerSession();
  useEffect(() => {
    if (!cust) {
      setLocation('/customer/login');
    }
  }, [cust, setLocation]);

  if (!cust) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center" data-testid="redirecting-customer-login">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d5c4d] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#285548]">Redirecting to Customer Sign In...</p>
      </div>
    );
  }

  const [bookings] = useStored<Booking[]>('coopconnect-customer-bookings', seededCustomerBookings);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const currentCustomerId = cust.id;
  const myBookings = bookings.filter(b => b.customerId === currentCustomerId);
  const displayed = filter === 'all' ? myBookings : filter === 'upcoming' ? myBookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress') : myBookings.filter(b => b.status === 'Completed');

  return <div className="space-y-7 animate-rise" data-testid="view-my-bookings">
    <SectionTitle eyebrow="Customer Portal" title="My Bookings & History" text="View all your scheduled home services, assigned cooperative professionals, and transparent contributions." action={<Link href="/book" data-testid="link-new-booking" className="inline-flex items-center gap-2 rounded-xl bg-[#1d5c4d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#256f5d]"><Plus size={16} /> Book another service</Link>} />
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total Bookings" value={String(myBookings.length)} note="Lifetime booked services" icon={CalendarDays} />
      <Stat label="Upcoming" value={String(myBookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress').length)} note="Scheduled visits" icon={Clock3} accent="sand" />
      <Stat label="Completed" value={String(myBookings.filter(b => b.status === 'Completed').length)} note="Satisfied jobs" icon={CheckCircle2} accent="teal" />
      <Stat label="Welfare Fund" value={`₹${myBookings.reduce((sum, b) => sum + (b.contribution || 0), 0)}`} note="Your cooperative impact" icon={HandHeart} accent="coral" />
    </section>
    <div className="flex gap-2 border-b border-[#dfe5da] pb-3 text-xs font-bold">
      <button onClick={() => setFilter('all')} data-testid="tab-filter-all" className={`rounded-xl px-4 py-2 ${filter === 'all' ? 'bg-[#1d5c4d] text-white' : 'bg-[#eef3ec] text-[#557569] hover:bg-[#e4ede1]'}`}>All ({myBookings.length})</button>
      <button onClick={() => setFilter('upcoming')} data-testid="tab-filter-upcoming" className={`rounded-xl px-4 py-2 ${filter === 'upcoming' ? 'bg-[#1d5c4d] text-white' : 'bg-[#eef3ec] text-[#557569] hover:bg-[#e4ede1]'}`}>Upcoming ({myBookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress').length})</button>
      <button onClick={() => setFilter('completed')} data-testid="tab-filter-completed" className={`rounded-xl px-4 py-2 ${filter === 'completed' ? 'bg-[#1d5c4d] text-white' : 'bg-[#eef3ec] text-[#557569] hover:bg-[#e4ede1]'}`}>Completed ({myBookings.filter(b => b.status === 'Completed').length})</button>
    </div>
    {displayed.length === 0 ? <div className="rounded-3xl border border-dashed border-[#ccd9cf] bg-[#fffdf8] p-10 text-center">
      <CalendarDays className="mx-auto text-[#7d9b8e]" size={36} />
      <h3 className="mt-4 font-serif text-2xl text-[#173d35]">No bookings found</h3>
      <p className="mt-1 text-sm text-[#677c72]">You do not have any {filter !== 'all' ? filter : ''} bookings yet.</p>
      <Link href="/services" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1d5c4d] px-4 py-2.5 text-sm font-bold text-white" data-testid="link-empty-browse-services">Browse local services <ArrowRight size={15} /></Link>
    </div> : <div className="space-y-3">
      {displayed.map(b => <div key={b.id} data-testid={`row-booking-${b.id}`} className="flex flex-col gap-4 rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e3eee9] text-[#1d5c4d]"><CalendarDays size={22} /></div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-base text-[#1b473c]">{b.service}</strong>
            <span className="rounded-md bg-[#edf3ea] px-2 py-0.5 text-xs font-mono font-bold text-[#326958]" data-testid={`badge-booking-id-${b.id}`}>{b.id}</span>
            <Badge tone={b.status === 'Confirmed' ? 'teal' : b.status === 'Completed' ? 'sand' : 'coral'}><Check size={11} />{b.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-[#63796f]"><strong>{b.dateDisplay || b.date}</strong> at <strong>{b.time}</strong> · Assigned: {b.worker} · {b.location}</p>
        </div>
        <div className="text-left sm:text-right">
          <strong className="block text-lg text-[#173d35]">₹{b.total.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-[#7a8e85]">Worker: ₹{b.workerEarning} · Share: ₹{b.contribution}</span>
        </div>
        <button onClick={() => setSelectedBooking(b)} data-testid={`button-view-booking-${b.id}`} className="rounded-xl bg-[#eaf1e8] px-3.5 py-2.5 text-xs font-bold text-[#23604f] hover:bg-[#dce7da]">View Details</button>
      </div>)}
    </div>}
    {selectedBooking && <Modal title={`Booking Details · ${selectedBooking.id}`} onClose={() => setSelectedBooking(null)} wide>
      <div className="space-y-5 text-sm" data-testid={`modal-booking-details-${selectedBooking.id}`}>
        <div className="flex items-center justify-between rounded-2xl bg-[#edf5ef] p-4">
          <div><Badge tone="teal"><Check size={12} /> {selectedBooking.status}</Badge><h3 className="mt-2 font-serif text-2xl text-[#173d35]">{selectedBooking.service}</h3><p className="text-xs text-[#697d74]">Booked by {selectedBooking.customerName} ({selectedBooking.customerId})</p></div>
          <strong className="text-2xl text-[#a4523f]">₹{selectedBooking.total.toLocaleString('en-IN')}</strong>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e0e7de] bg-[#fcfdfa] p-4">
            <span className="text-xs font-bold uppercase tracking-[.1em] text-[#869b91]">Appointment Schedule</span>
            <p className="mt-2 text-sm font-bold text-[#173d35]">{selectedBooking.dateDisplay || selectedBooking.date}</p>
            <p className="text-xs text-[#63786f]">Time window: {selectedBooking.time}</p>
            <p className="mt-1 text-xs text-[#63786f]"><MapPin size={12} className="inline mr-1 text-[#427364]" />{selectedBooking.location}</p>
          </div>
          <div className="rounded-xl border border-[#e0e7de] bg-[#fcfdfa] p-4">
            <span className="text-xs font-bold uppercase tracking-[.1em] text-[#869b91]">Assigned Professional</span>
            <p className="mt-2 text-sm font-bold text-[#173d35]">{selectedBooking.worker}</p>
            <p className="text-xs text-[#63786f]">{selectedBooking.workerRole || 'Certified Cooperative Member'}</p>
            <Badge tone="sand" className="mt-2"><ShieldCheck size={11} /> Verified Passport</Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e1e9df] p-4">
          <span className="text-xs font-bold uppercase tracking-[.1em] text-[#869b91]">Transparent Cost Breakdown</span>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between"><span>Worker Direct Remuneration</span><strong>₹{selectedBooking.workerEarning}</strong></div>
            <div className="flex justify-between"><span>Cooperative Statutory Contribution (20%)</span><strong>₹{selectedBooking.contribution}</strong></div>
            <div className="flex justify-between border-t border-[#e8ece5] pt-2 text-sm font-bold text-[#173d35]"><span>Total Paid / Payable</span><span className="text-[#a4523f]">₹{selectedBooking.total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[#f7eedc] p-3 text-xs text-[#7d5f2a]">
          <span><LifeBuoy size={14} className="inline mr-1" />On-duty cooperative safety coordinator assigned to this booking</span>
          <span className="font-bold">Desk CC-SOS-042</span>
        </div>
        <div className="flex justify-end pt-3">
          <Button onClick={() => setSelectedBooking(null)}>Close Details</Button>
        </div>
      </div>
    </Modal>}
  </div>;
}

function PaymentsPage({ onToast }: { onToast: (t: Toast) => void }) {
  const [paid, setPaid] = useState(false);
  const value = 1200; const contribution = value * .2;
  return <div className="space-y-7"><SectionTitle eyebrow="Money with a paper trail" title="Payment, explained in one glance." text="Transparent payment breakdown showing direct worker earnings and statutory cooperative fund contributions." /><div className="grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8"><div className="flex items-center justify-between"><div><Badge tone="teal"><LockKeyhole size={12} /> Secure cooperative payment</Badge><h2 className="mt-3 font-serif text-3xl text-[#173d35]">Kitchen appliance repair</h2><p className="mt-1 text-sm text-[#71857b]">Amit Sharma · 14 Mar 2026</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7efe8] text-[#1d5c4d]"><CreditCard /></div></div><div className="my-8 border-y border-[#edf0e9] py-6"><div className="flex justify-between text-sm"><span className="text-[#6b8177]">Worker earning</span><strong className="text-[#285548]">₹{value.toLocaleString('en-IN')}</strong></div><div className="mt-4 flex justify-between text-sm"><span className="text-[#6b8177]">Cooperative contribution</span><strong className="text-[#285548]">₹{contribution.toLocaleString('en-IN')}</strong></div><div className="mt-5 flex justify-between border-t border-[#edf0e9] pt-4 text-lg"><strong className="text-[#173d35]">Payable total</strong><strong className="text-[#a4523f]">₹1,440</strong></div></div><Button onClick={() => { setPaid(true); onToast({ title: 'Payment confirmed', text: 'The contribution has been allocated across four cooperative funds.' }); }} disabled={paid} className="w-full" testId="button-simulate-payment">{paid ? <><CheckCircle2 size={17} /> Payment confirmed</> : <><CreditCard size={17} /> Proceed to secure payment</>}</Button></section><aside className="rounded-3xl bg-[#f0dec1] p-6 sm:p-8"><div className="flex items-center justify-between"><h3 className="font-serif text-2xl text-[#49391f]">Where 20% goes</h3><ReceiptIndianRupee className="text-[#a26d31]" /></div><div className="mt-6 space-y-4">{[['5%', 'App & technology', 72], ['6%', 'Insurance & social security', 86], ['4%', 'Emergency assistance', 58], ['5%', 'Year-end surplus', 72]].map(([pct, label, width]) => <div key={label as string}><div className="flex justify-between text-xs font-bold text-[#72562d]"><span>{pct} · {label}</span><span>₹{Math.round(value * Number(pct) / 100)}</span></div><div className="mt-2 h-2 rounded-full bg-[#dec599]"><div className="h-full rounded-full bg-[#9d6a30]" style={{ width: `${width}%` }} /></div></div>)}</div><div className="mt-7 border-t border-[#dfcda9] pt-5 text-xs leading-5 text-[#766243]">Worker earning stays separate: <strong>₹{value.toLocaleString('en-IN')}</strong>. This structure is the cooperative promise, visible on every booking.</div></aside></div></div>;
}

function SafetyPage({ onSos }: { onSos: () => void }) {
  return <div className="space-y-8"><section className="rounded-3xl bg-[#174a3d] p-7 text-[#fff8e9] sm:p-10"><Badge tone="coral"><Siren size={12} /> Cooperative safety desk</Badge><h1 className="mt-4 max-w-2xl font-serif text-5xl leading-tight">Support should be visible before you need it.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#c2d8cc]">Every active visit has a human escalation path. Certified cooperative safety coordinators stand ready to assist at all times.</p><Button onClick={onSos} variant="danger" className="mt-7" testId="button-open-safety-page-sos"><Siren size={17} /> Open SOS confirmation</Button></section><div className="grid gap-4 md:grid-cols-3">{[['Before a visit', LockKeyhole, 'Choose your worker preferences and share only the context needed for a safe arrival.'], ['During a visit', PhoneCall, 'A coordinator can see the active booking, worker passport, and location context in an escalation.'], ['After a visit', FileCheck2, 'Safety follow-up is recorded separately from ratings, so speaking up never costs a worker trust.']].map(([title, Icon, text]) => { const I = Icon as typeof LockKeyhole; return <div key={title as string} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5"><I className="text-[#1d5c4d]" size={21} /><h2 className="mt-5 font-serif text-2xl text-[#285548]">{title as string}</h2><p className="mt-2 text-sm leading-6 text-[#71857b]">{text as string}</p></div>; })}</div><section className="rounded-2xl border border-[#e1d6c2] bg-[#f4e8d1] p-6"><div className="flex gap-3"><CircleHelp className="mt-0.5 text-[#9b6b2c]" /><div><h2 className="font-serif text-2xl text-[#49391f]">Need help right now?</h2><p className="mt-2 text-sm leading-6 text-[#766243]">Emergency assistance requests are managed through our direct cooperative safety dispatch network.</p></div></div></section></div>;
}

function GroupBookingPage({ onToast }: { onToast: (t: Toast) => void }) {
  const [joined, setJoined] = useState(false);
  return <div className="space-y-8"><section className="rounded-3xl bg-[#e5efe8] p-7 sm:p-10"><Badge>Community job pooling</Badge><h1 className="mt-4 max-w-2xl font-serif text-5xl leading-tight text-[#173d35]">One street. One coordinated visit. Better work for everyone.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#5d766b]">Pool similar tasks with neighbours so workers spend less time travelling and more time earning. You still approve your own quote.</p><Button onClick={() => onToast({ title: 'Neighbour invite copied', text: 'Neighbourhood invitation link copied to clipboard.' })} className="mt-6" testId="button-invite-neighbours"><Plus size={16} /> Invite neighbours</Button></section><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-[#173d35]">Open neighbourhood pools</h2><Badge tone="sand">3 active</Badge></div><div className="mt-5 space-y-3">{[['Aundh · Sunday electrical check', '4 of 6 homes joined', '₹380 estimated saving'], ['Kothrud · Pre-monsoon plumbing', '2 of 5 homes joined', '₹240 estimated saving'], ['Wakad · Stairwell repaint', '6 of 8 homes joined', '₹1,150 shared saving']].map((x, i) => <div key={x[0]} className="rounded-2xl border border-[#e2e8df] p-4"><div className="flex items-start justify-between gap-3"><span><strong className="block text-sm text-[#285548]">{x[0]}</strong><span className="mt-1 block text-xs text-[#74877e]">{x[1]}</span></span><span className="rounded-full bg-[#edf2ea] px-2 py-1 text-[11px] font-bold text-[#397362]">Pool 0{i + 1}</span></div><div className="mt-3 flex items-center justify-between"><span className="text-xs font-bold text-[#a4523f]">{x[2]}</span><Button onClick={() => setJoined(true)} variant={joined && i === 0 ? 'quiet' : 'outline'} className="px-3 py-1.5 text-xs" testId={`button-join-pool-${i}`}>{joined && i === 0 ? 'Joined' : 'Join pool'}</Button></div></div>)}</div></section><aside className="rounded-2xl bg-[#174a3d] p-6 text-[#fff8e9]"><UsersRound className="text-[#efbe7d]" /><h2 className="mt-5 font-serif text-3xl">Shared jobs, not shared hassle.</h2><div className="mt-6 space-y-4 text-sm text-[#c3d8cc]">{['Coordinator groups compatible tasks', 'Workers see a reliable block of paid work', 'Each household gets its own receipt and safety controls'].map(x => <div key={x} className="flex gap-3"><CheckCircle2 size={17} className="shrink-0 text-[#91c99d]" />{x}</div>)}</div></aside></div></div>;
}

function ProjectsPage({ onToast }: { onToast: (t: Toast) => void }) {
  const [started, setStarted] = useState(false);
  const tasks = ['Measure rooms & plan scope', 'Electrical safety check', 'Plumbing and water points', 'Painting and finishing', 'Final quality walk-through'];
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge tone="coral">AI-Coordinated Multi-Service</Badge><h1 className="mt-3 font-serif text-4xl text-[#173d35]">Projects, not a pile of bookings.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#62766d]">Describe the desired project outcome. CoopConnect decomposes the request into ordered, reviewable trade tasks.</p></div><Button onClick={() => setStarted(true)} testId="button-start-project"><Plus size={17} /> New home project</Button></div><div className="grid gap-5 lg:grid-cols-[1fr_.72fr]"><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8"><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-[.14em] text-[#a75d45]">Active project · CC-PROJ-018</div><h2 className="mt-2 font-serif text-3xl text-[#173d35]">2BHK refresh · Baner</h2></div><Badge tone="sand">42% scoped</Badge></div><div className="mt-7 h-2 rounded-full bg-[#e4eae1]"><div className="h-full w-[42%] rounded-full bg-[#e0a55d]" /></div><div className="mt-7 space-y-2">{tasks.map((x, i) => <div key={x} className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#f4f7f1]"><span className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${i < 2 ? 'bg-[#dcefe1] text-[#35714e]' : 'bg-[#eef1ec] text-[#83968b]'}`}>{i < 2 ? <Check size={14} /> : i + 1}</span><span className={`text-sm ${i < 2 ? 'text-[#537065] line-through' : 'font-bold text-[#315d4e]'}`}>{x}</span>{i === 2 && <Badge tone="coral">next</Badge>}</div>)}</div></section><aside className="rounded-2xl border border-[#e1d6c2] bg-[#f4e8d1] p-6"><Sparkles className="text-[#a26d31]" /><h3 className="mt-4 font-serif text-2xl text-[#49391f]">Coordinator note</h3><p className="mt-2 text-sm leading-6 text-[#766243]">AI suggestions are always reviewable. A cooperative coordinator confirms skills, timing, and safety before anyone is assigned.</p><Button onClick={() => onToast({ title: 'Recommendations refreshed', text: 'Three compatible members are ready for review.' })} variant="outline" className="mt-5 border-[#c9af80] text-[#7b5826]" testId="button-refresh-recommendations"><RefreshCw size={15} /> Refresh recommendations</Button></aside></div>{started && <Modal title="Start a home project" onClose={() => setStarted(false)}><p className="text-sm text-[#657970]">Describe the desired project outcome. CoopConnect decomposes the request into reviewable trade packages.</p><textarea data-testid="textarea-project-brief" placeholder="Example: Refresh our 2BHK before monsoon — paint, fix leaks, and make the kitchen safer." className="mt-5 h-28 w-full rounded-xl border border-[#dce4d9] bg-[#f8faf6] p-3 text-sm outline-none" /><Button onClick={() => { setStarted(false); onToast({ title: 'Project brief added', text: 'Task decomposition is ready for review.' }); }} className="mt-4 w-full" testId="button-create-project">Create project brief <ArrowRight size={16} /></Button></Modal>}</div>;
}

function WorkerDashboard() {
  const [available, setAvailable] = useStored('coop-worker-available', true);
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge tone="sand">Worker Portal · Verified Member</Badge><h1 className="mt-3 font-serif text-4xl text-[#173d35]">Good morning, Amit.</h1><p className="mt-2 text-sm text-[#62766d]">Your work, earnings, and safety support in one place.</p></div><button onClick={() => setAvailable(!available)} data-testid="button-availability-toggle" className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${available ? 'bg-[#dcefe1] text-[#35714e]' : 'bg-[#eceee9] text-[#74877e]'}`}><span className={`h-2 w-2 rounded-full ${available ? 'bg-[#4a9a73]' : 'bg-[#9aa89e]'}`} />{available ? 'Available for work' : 'Paused for now'}</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="This month" value="₹18,460" note="+12% from last month" icon={IndianRupee} /><Stat label="Jobs completed" value="27" note="4.8 community rating" icon={CheckCircle2} accent="sand" /><Stat label="Coop contribution" value="₹3,692" note="visible on your work" icon={HandHeart} accent="coral" /><Stat label="Safety status" value="Protected" note="Insurance active" icon={ShieldCheck} /></div><div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6"><SectionTitle eyebrow="Next up" title="Your work queue" action={<button data-testid="button-worker-filter" className="text-[#54796c]"><MoreHorizontal /></button>} /><div className="space-y-3">{[['Today · 10:00', 'Kitchen appliance repair', 'Shivaji Nagar', '₹500'], ['Tomorrow · 14:00', 'Full home electrical check', 'Aundh', '₹1,100'], ['16 Mar · 09:00', 'Fan installation', 'Baner', '₹450']].map((x, i) => <div key={x[0]} className="flex items-center gap-3 rounded-xl border border-[#edf0e9] p-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6efe9] text-[#1d5c4d]"><BriefcaseBusiness size={18} /></div><div className="flex-1"><strong className="block text-sm text-[#2b564a]">{x[1]}</strong><span className="text-xs text-[#778a81]">{x[0]} · {x[2]}</span></div><strong className="text-sm text-[#a4523f]">{x[3]}</strong><ChevronRight size={16} className="text-[#9aaa9f]" /></div>)}</div></section><aside className="rounded-2xl bg-[#174a3d] p-6 text-[#fff8e9]"><div className="flex items-center justify-between"><h3 className="font-serif text-2xl">Your welfare wallet</h3><WalletCards className="text-[#efbe7d]" /></div><p className="mt-2 text-sm leading-6 text-[#bad1c7]">Because cooperative work is more than the next job.</p><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#285d4f] p-3"><strong className="block text-2xl text-[#efbe7d]">₹4,880</strong><span className="text-xs text-[#bad1c7]">insurance cover</span></div><div className="rounded-xl bg-[#285d4f] p-3"><strong className="block text-2xl text-[#efbe7d]">₹1,920</strong><span className="text-xs text-[#bad1c7]">surplus accrued</span></div></div><button className="mt-5 text-sm font-bold text-[#efbe7d]" data-testid="button-view-welfare">View welfare statement →</button></aside></div><section className="rounded-2xl border border-[#e3d6c2] bg-[#f6ead6] p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><Siren className="mt-1 text-[#b14e3d]" /><span><strong className="block text-[#713c31]">Safety support is always one tap away.</strong><span className="text-sm text-[#8d665c]">A coordinator can see your active job and help escalate an issue.</span></span></div><Button variant="danger" className="sm:shrink-0" testId="button-worker-sos">Open safety support</Button></div></section></div>;
}

function AdminDashboard({ onToast }: { onToast: (t: Toast) => void }) {
  const [, setLocation] = useLocation();
  const admin = getAdminSession();
  useEffect(() => {
    if (!admin) {
      setLocation('/admin/login');
    }
  }, [admin, setLocation]);

  if (!admin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center" data-testid="redirecting-admin-login">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d5c4d] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#285548]">Redirecting to Cooperative Admin Sign In...</p>
      </div>
    );
  }

  const [error, setError] = useState(false);
  return <div className="space-y-7" data-testid="view-admin-dashboard"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge tone="coral">Cooperative admin</Badge><h1 className="mt-3 font-serif text-4xl text-[#173d35]">The network, at a glance.</h1><p className="mt-2 text-sm text-[#62766d]">Monitor trust, work allocation, welfare, and safety — not just volume.</p></div><Button onClick={() => onToast({ title: 'Report exported', text: 'Cooperative performance report exported to CSV.' })} variant="outline" testId="button-export-report"><FileText size={16} /> Export report</Button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Active workers" value="86" note="7 awaiting verification" icon={UsersRound} /><Stat label="Jobs this week" value="142" note="92% on time" icon={BriefcaseBusiness} accent="sand" /><Stat label="Welfare allocated" value="₹28,640" note="across four funds" icon={HandHeart} accent="coral" /><Stat label="Safety response" value="04m 12s" note="average this month" icon={Siren} /></div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-[#173d35]">Verification queue</h2><Badge tone="coral">7 pending</Badge></div>{error ? <div className="mt-5"><StateCard type="error" onRetry={() => setError(false)} /></div> : <div className="mt-5 space-y-3">{workers.slice(0, 4).map((w, i) => <div key={w.id} className="flex items-center gap-3 rounded-xl border border-[#edf0e9] p-3"><Avatar worker={w} size="sm" /><div className="flex-1"><strong className="block text-sm text-[#2b564a]">{w.name}</strong><span className="text-xs text-[#778a81]">{w.role} · documents {i === 0 ? 'reviewed' : 'submitted'}</span></div><button onClick={() => onToast({ title: 'Worker reviewed', text: `${w.name} application is in the verification queue.` })} data-testid={`button-review-worker-${w.id}`} className="rounded-lg bg-[#edf2ea] px-3 py-2 text-xs font-bold text-[#285548]">Review</button></div>)}</div>}<button onClick={() => setError(true)} className="mt-5 text-xs font-bold text-[#a4523f]" data-testid="button-simulate-admin-error">Test system diagnostics</button></section><aside className="rounded-2xl bg-[#174a3d] p-6 text-[#fff8e9]"><h2 className="font-serif text-2xl">Contribution health</h2><p className="mt-2 text-sm text-[#bad1c7]">₹12,800 allocated this week</p><div className="mt-7 space-y-4">{[['Technology', '₹3,200', 25], ['Insurance & social security', '₹3,840', 30], ['Emergency assistance', '₹2,560', 20], ['Year-end surplus', '₹3,200', 25]].map(([x, y, n]) => <div key={x as string}><div className="flex justify-between text-xs"><span className="text-[#bad1c7]">{x}</span><strong>{y}</strong></div><div className="mt-2 h-2 rounded-full bg-[#315f52]"><div className="h-full rounded-full bg-[#efbe7d]" style={{ width: `${Number(n) * 3}%` }} /></div></div>)}</div><div className="mt-6 border-t border-[#477368] pt-4 text-xs text-[#bad1c7]">Allocation rule: exactly 5% app & technology, 6% insurance & social security, 4% emergency assistance, 5% year-end surplus.</div></aside></div><section className="grid gap-3 sm:grid-cols-3"><button onClick={() => onToast({ title: 'Bookings opened', text: 'Showing all active bookings in the admin workspace.' })} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 text-left hover:bg-[#f6f8f3]" data-testid="button-admin-bookings"><CalendarDays className="text-[#1d5c4d]" /><strong className="mt-4 block text-[#2b564a]">Booking operations</strong><span className="mt-1 block text-xs text-[#778a81]">Track 142 active jobs</span></button><button onClick={() => onToast({ title: 'Emergency desk opened', text: 'Two coordinators are currently on call.' })} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 text-left hover:bg-[#f6f8f3]" data-testid="button-admin-emergency"><Siren className="text-[#b14e3d]" /><strong className="mt-4 block text-[#2b564a]">Emergency desk</strong><span className="mt-1 block text-xs text-[#778a81]">1 case needs follow-up</span></button><button onClick={() => onToast({ title: 'Welfare ledger opened', text: 'Fund history and member statements are available.' })} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 text-left hover:bg-[#f6f8f3]" data-testid="button-admin-welfare"><HandHeart className="text-[#a4523f]" /><strong className="mt-4 block text-[#2b564a]">Welfare ledger</strong><span className="mt-1 block text-xs text-[#778a81]">Four protected funds</span></button></section></div>;
}

function SimpleInfoPage({ kind }: { kind: 'features' | 'architecture' | 'about' }) {
  const content = {
    features: { eyebrow: 'Why this is different', title: 'A service marketplace with a memory and a conscience.', intro: 'CoopConnect is designed around the relationship between households, workers, and the cooperative that holds both sides together.', items: ['Cooperative Worker Digital Passport', 'Community Group Booking & Job Pooling', 'Transparent Cooperative Contribution', 'Women-Safe Service Assignment', 'AI Coordinated Multi-Service Project Booking'] },
    architecture: { eyebrow: 'How it works', title: 'A calm interface over a serious public-interest system.', intro: 'The cooperative architecture keeps complexity visible without burdening members. Each layer has a clear function, a boundary, and human accountability.', items: ['Discovery layer · service search, digital passports, preference-aware matching', 'Coordination layer · task decomposition, pooling, scheduling, worker capacity', 'Trust layer · verification, safety escalation, community ratings', 'Cooperative layer · contribution ledger, welfare, insurance and surplus', 'Offline-first resilience layer · distributed edge persistence and sync'] },
    about: { eyebrow: 'The cooperative model', title: 'Owned by the workers, accountable to the neighbourhood.', intro: 'CoopConnect is a cooperative-owned digital gig services platform. It provides a community-governed alternative to corporate aggregator monopolies.', items: ['Households find verified local help through clear information and fair pricing.', 'Workers carry an official digital passport recognizing verified skills and experience.', 'The cooperative embeds welfare, insurance, and safety as core infrastructure.', 'Every booking transparently details direct worker earnings and cooperative fund allocations.', 'Pricing, digital worker passports, and contribution ledgers follow cooperative society governance standards.'] },
  };
  const data = content[kind];
  return <div className="space-y-10"><section className="max-w-4xl"><Badge tone="coral">{data.eyebrow}</Badge><h1 className="mt-4 font-serif text-5xl leading-tight text-[#173d35] sm:text-6xl">{data.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#62766d]">{data.intro}</p></section><div className="grid gap-3 md:grid-cols-2">{data.items.map((x, i) => <div key={x} className="group rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6 transition-transform hover:-translate-y-1"><span className="font-mono text-xs text-[#a4523f]">0{i + 1}</span><h2 className="mt-10 font-serif text-2xl text-[#285548]">{x}</h2><p className="mt-3 text-sm leading-6 text-[#71857b]">{['The profile, work history, safety checks, and cooperative standing travel together.', 'Neighbours can turn fragmented errands into a reliable block of work.', 'A contribution is not a fee to hide; it is a promise to explain.', 'Comfort, consent, and escalation are part of the booking flow.', 'A coordinator stays accountable when a recommendation is not enough.'][i]}</p></div>)}</div><div className="rounded-3xl bg-[#174a3d] p-7 text-[#fff8e9] sm:p-10"><div className="flex items-start gap-4"><CircleHelp className="mt-1 shrink-0 text-[#efbe7d]" /><div><h2 className="font-serif text-3xl">Designed to be questioned.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#c2d8cc]">CoopConnect combines AI-assisted workflow coordination with human cooperative governance. Certified coordinators oversee every project, ensuring fairness, transparency, and accountability across all service engagements.</p></div></div></div></div>;
}

function ProfilePage({ role, lang, setLang, onToast }: { role: Role; lang: Lang; setLang: (l: Lang) => void; onToast: (t: Toast) => void }) {
  return <div className="space-y-7"><SectionTitle eyebrow="Your account" title="A profile that remembers your preferences." text="Preferences and account settings are saved to your secure profile." /><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><section className="rounded-2xl bg-[#174a3d] p-6 text-[#fff8e9]"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e6b56f] text-xl font-bold text-[#173f36]">{role === 'customer' ? 'CU' : role === 'worker' ? 'AS' : 'AD'}</div><h2 className="mt-5 font-serif text-3xl">{role === 'customer' ? 'Kavya Deshmukh' : role === 'worker' ? 'Amit Sharma' : 'Pune Cooperative Admin'}</h2><p className="mt-1 text-sm text-[#bad1c7]">{role === 'customer' ? 'Household member · Pune' : role === 'worker' ? 'Electrical member · Pune' : 'Network operations'}</p><Badge tone="sand">Member Profile</Badge><div className="mt-8 border-t border-[#477368] pt-5 text-xs leading-5 text-[#b7cec5]">Member profile registered under Labour Cooperative Federation bylaws.</div></section><section className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-6"><h2 className="font-serif text-2xl text-[#173d35]">Preferences</h2><div className="mt-5 space-y-2"><label className="flex items-center justify-between rounded-xl bg-[#f4f7f1] p-4"><span><strong className="block text-sm text-[#315d4e]">Language</strong><span className="text-xs text-[#7a8d84]">Navigation and key labels</span></span><select value={lang} onChange={e => { setLang(e.target.value as Lang); onToast({ title: 'Language updated', text: 'Navigation language updated.' }); }} data-testid="profile-language" className="rounded-lg border border-[#d4ded5] bg-[#fffdf8] p-2 text-xs font-bold text-[#315d4e]"><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></label><div className="flex items-center justify-between rounded-xl bg-[#f4f7f1] p-4"><span><strong className="block text-sm text-[#315d4e]">Offline resilience mode</strong><span className="text-xs text-[#7a8d84]">Persist changes on this device</span></span><span className="h-6 w-11 rounded-full bg-[#6da17f] p-1"><span className="block h-4 w-4 translate-x-5 rounded-full bg-white" /></span></div><div className="flex items-center justify-between rounded-xl bg-[#f4f7f1] p-4"><span><strong className="block text-sm text-[#315d4e]">Safety contact</strong><span className="text-xs text-[#7a8d84]">Neighbourhood coordinator · connected</span></span><ShieldCheck size={19} className="text-[#4b926b]" /></div></div><Button onClick={() => onToast({ title: 'Preferences saved', text: 'Preferences saved successfully.' })} className="mt-5" testId="button-save-profile">Save preferences</Button></section></div></div>;
}

function SafetyModal({ onClose, onToast }: { onClose: () => void; onToast: (t: Toast) => void }) {
  const [confirmed, setConfirmed] = useState(false);
  return <Modal title="Safety SOS" onClose={onClose}><div className="rounded-2xl bg-[#f9e6df] p-4 text-sm leading-6 text-[#713c31]"><Siren className="mb-2 text-[#b14e3d]" />Cooperative emergency assistance routes directly to on-call safety coordinators.</div>{confirmed ? <div className="py-6 text-center"><CheckCircle2 size={42} className="mx-auto text-[#4b926b]" /><h3 className="mt-4 font-serif text-2xl text-[#285548]">A coordinator is with you.</h3><p className="mt-2 text-sm text-[#70847a]">Emergency alert CC-SOS-042 is assigned to on-duty coordinators.</p><Button onClick={onClose} className="mt-5 w-full">Close support view</Button></div> : <><p className="mt-5 text-sm text-[#63776e]">If you feel unsafe during a visit, we will share your active booking context with a trained cooperative coordinator.</p><Button onClick={() => { setConfirmed(true); onToast({ title: 'SOS alert dispatched', text: 'A cooperative safety coordinator has been notified and is responding.' }); }} variant="danger" className="mt-5 w-full" testId="button-confirm-sos"><Siren size={17} /> Confirm Emergency Assistance</Button><button onClick={onClose} className="mt-3 w-full text-center text-xs font-bold text-[#71857b]" data-testid="button-cancel-sos">Cancel, I am safe</button></>}</Modal>;
}

function TourWizard({ onClose, onToast }: { onClose: () => void; onToast: (t: Toast) => void }) {
  const [step, setStep] = useState(0);
  const items = [{ label: 'Home Renovation', title: 'Start with an outcome, not a list of apps.', text: 'Tell CoopConnect: “Refresh my 2BHK before monsoon.” The cooperative turns the brief into a plan.' }, { label: 'Task decomposition', title: 'The work becomes understandable.', text: 'Electrical, plumbing, painting, and a final quality walk-through — each is reviewable.' }, { label: 'Worker recommendations', title: 'People come before algorithms.', text: 'Recommendations consider skill, distance, safety preference, and member availability.' }, { label: 'Schedule', title: 'One timeline, fewer phone calls.', text: 'Coordinate multiple members while keeping every household informed.' }, { label: 'Price', title: 'The price story stays open.', text: 'Worker earning and cooperative contribution are shown separately before you commit.' }, { label: 'Contribution', title: '20% returns to the community.', text: '5% app & technology, 6% insurance & social security, 4% emergency assistance, 5% year-end surplus.' }, { label: 'Confirmation', title: 'A fair booking is a shared promise.', text: 'Your confirmation creates a visible timeline and a safety path for everyone.' }]; const item = items[step];
  return <Modal title="CoopConnect Platform Tour" onClose={onClose} wide><div className="flex items-center gap-1">{items.map((x, i) => <button key={x.label} onClick={() => setStep(i)} data-testid={`tour-step-${i}`} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#1d5c4d]' : 'bg-[#e0e8df]'}`} />)}</div><div className="mt-8 grid gap-6 sm:grid-cols-[.7fr_1.3fr]"><div className="rounded-2xl bg-[#e5efe8] p-5"><div className="text-xs font-bold uppercase tracking-[.14em] text-[#a4523f]">Step {step + 1} / {items.length}</div><div className="mt-10 font-serif text-3xl text-[#173d35]">{item.label}</div><div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#4b7869]"><Activity size={15} /> AI-Coordinated Platform</div></div><div><h2 className="font-serif text-3xl leading-tight text-[#173d35]">{item.title}</h2><p className="mt-4 text-sm leading-7 text-[#62766d]">{item.text}</p>{step === 5 && <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-[#4f6d60]"><div className="rounded-xl bg-[#f3f6ef] p-3">5% technology</div><div className="rounded-xl bg-[#f3f6ef] p-3">6% insurance</div><div className="rounded-xl bg-[#f3f6ef] p-3">4% emergency</div><div className="rounded-xl bg-[#f3f6ef] p-3">5% surplus</div></div>}<div className="mt-8 flex justify-between"><Button onClick={() => step ? setStep(step - 1) : onClose()} variant="outline">{step ? 'Back' : 'Close tour'}</Button><Button onClick={() => { if (step < items.length - 1) setStep(step + 1); else { onClose(); onToast({ title: 'Platform tour complete', text: 'Explore services, bookings, and worker portals from the navigation.' }); } }} testId="button-tour-next">{step === items.length - 1 ? 'Finish journey' : 'Next step'} <ArrowRight size={16} /></Button></div></div></div></Modal>;
}

type EmergencyRequest = { id: string; type: string; worker: string; location: string; description: string; contact: string; createdAt: string };

function InsurancePage({ onToast }: { onToast: (t: Toast) => void }) {
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [created, setCreated] = useState<EmergencyRequest | null>(null);
  const [requests, setRequests] = useStored<EmergencyRequest[]>('coopconnect-emergency-requests', []);
  const [form, setForm] = useState({ type: 'Workplace injury', worker: 'Aarav Kulkarni', location: 'Pune, Maharashtra', description: '', contact: '' });
  const update = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const request = { ...form, id: `KAARYA-EMG-${String(Math.floor(1000 + Math.random() * 9000))}`, createdAt: new Date().toISOString() };
    setRequests(old => [request, ...old]);
    setCreated(request);
    setSupportOpen(false);
    onToast({ title: 'Emergency Request Created', text: `${request.id} is Under Cooperative Review.` });
  };
  return <div className="space-y-8 animate-rise">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#174a3d] px-6 py-9 text-[#fff8e9] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
      <div className="welfare-grid absolute inset-0 opacity-25" /><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[26px] border-[#e6b56f]/20" />
      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><Badge tone="sand"><ShieldCheck size={12} /> Cooperative protection</Badge><h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.035em] sm:text-6xl">A safer way<br /><em className="text-[#efbe7d]">to do the work.</em></h1><p className="mt-5 max-w-xl text-base leading-7 text-[#c5d9ce]">Every cooperative contribution carries a visible promise: support for the worker before, during, and after a difficult day.</p><div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => setSupportOpen(true)} className="bg-[#edbd76] text-[#173f36] hover:bg-[#f4ce91]" testId="button-request-emergency"><Siren size={16} /> Request emergency support</Button><Link href="/surplus" className="inline-flex items-center gap-2 rounded-xl border border-[#729b8a] px-4 py-2.5 text-sm font-bold text-[#fff8e9] hover:bg-[#285d4f]" data-testid="link-insurance-surplus">See where the contribution travels <ArrowRight size={16} /></Link></div></div><div className="rounded-2xl border border-[#4a7568] bg-[#1d5447]/80 p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6b56f] text-[#173f36]"><Activity size={22} /></span><div><p className="text-sm font-bold">Human review stays in the loop</p><p className="mt-1 text-xs text-[#b8d0c4]">Dedicated coordinator review on every claim. Fast emergency dispatch.</p></div></div><div className="mt-5 border-t border-[#477368] pt-4 text-xs leading-5 text-[#b8d0c4]">An audited cooperative ledger for worker welfare — transparent and inspectable.</div></div></div>
    </section>
    <section><SectionTitle eyebrow="20% cooperative model" title="Two protected funds, one clear explanation." text="Under our standard 20% cooperative contribution model, a ₹1,000 service allocates ₹200 across welfare, emergency, tech, and surplus funds." /><div className="grid gap-5 lg:grid-cols-2">
      <div className="welfare-card rounded-3xl border border-[#d8e3d8] bg-[#fffdf8] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><Badge>Worker welfare</Badge><h2 className="mt-4 font-serif text-3xl text-[#173d35]">Worker Insurance &amp; Social Security</h2></div><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e5efe8] text-[#1d5c4d]"><ShieldCheck size={27} /></span></div><div className="mt-7 flex items-end justify-between border-b border-[#e3e9df] pb-5"><div><div className="font-serif text-5xl text-[#1d5c4d]">6%</div><p className="mt-1 text-sm text-[#6c8077]">of the cooperative contribution</p></div><div className="text-right"><strong className="block text-2xl text-[#285548]">₹60</strong><span className="text-xs text-[#788b82]">from every ₹1,000 service</span></div></div><p className="mt-5 text-sm font-bold text-[#315d4e]">Purpose of this protected share</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[#63776d]"><li className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#4c8a68]" />Support access and social-security pathways for working members.</li><li className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#4c8a68]" />Build a record of cooperative welfare contribution over time.</li><li className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#4c8a68]" />Keep the worker relationship visible beyond one completed job.</li></ul><div className="mt-6 rounded-2xl bg-[#f1f5ee] p-4"><div className="flex items-center justify-between text-xs font-bold text-[#527266]"><span>Protected allocation visual</span><span>6 / 20</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-[#dfe8dc]"><div className="h-full w-[30%] rounded-full bg-[#6fae8b]" /></div><p className="mt-2 text-xs leading-5 text-[#71857b]">The 6% share is represented within the cooperative contribution, not added as a hidden fee.</p></div><Button onClick={() => setCoverageOpen(true)} variant="outline" className="mt-6 w-full" testId="button-view-coverage">View coverage details <ArrowRight size={16} /></Button></div>
      <div className="welfare-card rounded-3xl border border-[#ecdcd4] bg-[#fffaf5] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><Badge tone="coral">Safety net</Badge><h2 className="mt-4 font-serif text-3xl text-[#173d35]">Emergency Assistance Fund</h2></div><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fae5dc] text-[#a14d3d]"><Siren size={27} /></span></div><div className="mt-7 flex items-end justify-between border-b border-[#eee0d8] pb-5"><div><div className="font-serif text-5xl text-[#a14d3d]">4%</div><p className="mt-1 text-sm text-[#806d65]">of the cooperative contribution</p></div><div className="text-right"><strong className="block text-2xl text-[#9b4935]">₹40</strong><span className="text-xs text-[#806d65]">from every ₹1,000 service</span></div></div><p className="mt-5 text-sm font-bold text-[#694b42]">Purpose of this protected share</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[#786862]"><li className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#c46d58]" />Create a cooperative route for urgent worker support requests.</li><li className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#c46d58]" />Help coordinators document incidents with context and consent.</li><li className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#c46d58]" />Keep emergency support separate from earnings and surplus.</li></ul><div className="mt-6 rounded-2xl bg-[#f8e8df] p-4"><div className="flex items-center justify-between text-xs font-bold text-[#87594c]"><span>Fund indicator</span><span>₹40 / ₹200 example</span></div><div className="mt-2 flex gap-1"><span className="h-3 flex-[4] rounded-l-full bg-[#c96c57]" /><span className="h-3 flex-[16] rounded-r-full bg-[#ead5cb]" /></div><p className="mt-2 text-xs leading-5 text-[#876e65]">Statutory 4% emergency assistance allocation from every cooperative service.</p></div><Button onClick={() => setSupportOpen(true)} variant="danger" className="mt-6 w-full" testId="button-open-support-form"><Siren size={16} /> Request emergency support</Button></div>
    </div></section>
    {created && <section className="rounded-3xl border border-[#c7dfcf] bg-[#eaf5ec] p-6 sm:p-8" data-testid="status-emergency-created"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2b7657] text-[#f5ffef]"><CheckCircle2 size={25} /></span><div className="flex-1"><Badge>Emergency Request Created</Badge><h2 className="mt-3 font-serif text-3xl text-[#194d3b]">{created.id}</h2><p className="mt-2 text-sm font-bold text-[#3d6f58]">Under Cooperative Review</p><p className="mt-3 text-sm leading-6 text-[#5d796a]">Your emergency assistance ticket has been logged with the on-call cooperative safety coordinator.</p></div><Badge tone="sand">Cooperative Safety Desk · Active Ticket</Badge></div></section>}
    {coverageOpen && <Modal title="Coverage details" onClose={() => setCoverageOpen(false)} wide><div className="space-y-5 text-sm leading-6 text-[#62766d]"><div className="rounded-2xl border border-[#e6c98d] bg-[#fbf1dc] p-4"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-[#9a6b24]" /><p><strong className="text-[#6f4e1d]">Cooperative Group Welfare & Protection.</strong> Administered through member contributions under registered cooperative society guidelines.</p></div></div><p>Under our cooperative charter, <strong className="text-[#285548]">6% of the cooperative contribution</strong> — ₹60 from every ₹1,000 service — is earmarked for worker insurance and social security pathways.</p><Button onClick={() => setCoverageOpen(false)} className="w-full">Acknowledge Policy Terms</Button></div></Modal>}
    {supportOpen && <Modal title="Request emergency support" onClose={() => setSupportOpen(false)} wide><div className="mb-5 rounded-2xl border border-[#edc9c0] bg-[#fff0e9] p-4 text-sm leading-6 text-[#7f5147]"><div className="flex gap-3"><AlertTriangle className="mt-1 shrink-0 text-[#b14e3d]" /><p>For immediate life-threatening situations, dial 112/108 immediately. Cooperative emergency response coordinates localized worker support.</p></div></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-[#315d4e]">Emergency type<select required value={form.type} onChange={e => update('type', e.target.value)} data-testid="select-emergency-type" className="mt-2 w-full rounded-xl border border-[#d7e0d6] bg-[#f9fbf6] px-3 py-3 font-normal outline-none"><option>Workplace injury</option><option>Unsafe situation</option><option>Medical concern</option><option>Weather or travel disruption</option><option>Other urgent support</option></select></label><label className="text-sm font-bold text-[#315d4e]">Worker name<input required value={form.worker} onChange={e => update('worker', e.target.value)} data-testid="input-emergency-worker" className="mt-2 w-full rounded-xl border border-[#d7e0d6] bg-[#f9fbf6] px-3 py-3 font-normal outline-none" /></label><label className="text-sm font-bold text-[#315d4e]">Location<input required value={form.location} onChange={e => update('location', e.target.value)} data-testid="input-emergency-location" className="mt-2 w-full rounded-xl border border-[#d7e0d6] bg-[#f9fbf6] px-3 py-3 font-normal outline-none" /></label><label className="text-sm font-bold text-[#315d4e]">Emergency contact<input required value={form.contact} onChange={e => update('contact', e.target.value)} placeholder="Name and phone" data-testid="input-emergency-contact" className="mt-2 w-full rounded-xl border border-[#d7e0d6] bg-[#f9fbf6] px-3 py-3 font-normal outline-none" /></label><label className="text-sm font-bold text-[#315d4e] sm:col-span-2">What happened?<textarea required minLength={10} value={form.description} onChange={e => update('description', e.target.value)} rows={4} data-testid="textarea-emergency-description" className="mt-2 w-full resize-none rounded-xl border border-[#d7e0d6] bg-[#f9fbf6] px-3 py-3 font-normal outline-none" placeholder="Share only what is useful for cooperative review." /></label><div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setSupportOpen(false)}>Cancel</Button><Button type="submit" variant="danger" testId="button-submit-emergency"><Siren size={16} /> Dispatch Emergency Request</Button></div></form></Modal>}
  </div>;
}

type ActivityRow = { date: string; service: string; km: number; value: number; surplus: number; type: 'Individual Booking' | 'Group Booking' | 'Multi-Service Project' };
function SurplusPage() {
  const [time, setTime] = useState('This Month');
  const [activityType, setActivityType] = useState('All Services');
  const [distance, setDistance] = useState('All distances');
  const rows: ActivityRow[] = [{ date: '20 Sep', service: 'Plumbing', km: 8.4, value: 1000, surplus: 50, type: 'Individual Booking' }, { date: '19 Sep', service: 'Electrical', km: 5.2, value: 1500, surplus: 75, type: 'Group Booking' }, { date: '18 Sep', service: 'Carpentry', km: 11.6, value: 2000, surplus: 100, type: 'Multi-Service Project' }, { date: '16 Sep', service: 'Home cleaning', km: 3.8, value: 800, surplus: 40, type: 'Individual Booking' }];
  const filteredRows = useMemo(() => rows.filter((row, index) => {
    const timeMatch = time === 'Today' ? index === 0 : time === 'This Week' ? index < 2 : true;
    const typeMatch = activityType === 'All Services' || (activityType === 'Group Bookings' && row.type === 'Group Booking') || (activityType === 'Multi-Service Projects' && row.type === 'Multi-Service Project') || (activityType === 'Individual Bookings' && row.type === 'Individual Booking');
    const distanceMatch = distance === 'All distances' || (distance === '0–5 KM' && row.km <= 5) || (distance === '5–10 KM' && row.km > 5 && row.km <= 10) || (distance === '10–20 KM' && row.km > 10 && row.km <= 20) || (distance === '20+ KM' && row.km > 20);
    return timeMatch && typeMatch && distanceMatch;
  }), [time, activityType, distance]);
  return <div className="space-y-8 animate-rise">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-9 lg:p-12"><div className="welfare-grid absolute inset-0 opacity-70" /><div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><div className="flex flex-wrap gap-2"><Badge tone="sand"><ReceiptIndianRupee size={12} /> Cooperative ledger</Badge><Badge tone="ink">Audited Ledger</Badge></div><h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.035em] text-[#173d35] sm:text-6xl">See the work.<br /><em className="text-[#a4523f]">Follow the surplus.</em></h1><p className="mt-5 max-w-xl text-base leading-7 text-[#62766d]">Year-End Cooperative Surplus is <strong className="text-[#285548]">5% of the cooperative contribution</strong>, not 5% of service value. This page makes the path visible without promising an individual payout.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/insurance" className="inline-flex items-center gap-2 rounded-xl bg-[#1d5c4d] px-4 py-2.5 text-sm font-bold text-[#fff9eb] hover:bg-[#15493d]" data-testid="link-surplus-insurance"><ShieldCheck size={16} /> Insurance &amp; Emergency <ArrowRight size={16} /></Link><span className="inline-flex items-center gap-2 rounded-xl border border-[#d6e0d5] px-4 py-2.5 text-xs font-bold text-[#60766c]"><LockKeyhole size={15} /> Verified Ledger</span></div></div><div className="rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9] sm:p-7"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#efbe7d]">One booking, explained</p><div className="mt-6 flex flex-wrap items-end gap-2"><span className="font-serif text-4xl">₹1,000</span><ArrowRight className="mb-2 text-[#efbe7d]" size={18} /><span className="font-serif text-4xl">₹200</span><ArrowRight className="mb-2 text-[#efbe7d]" size={18} /><span className="font-serif text-4xl text-[#efbe7d]">₹50</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-[#b9d2c6]"><span>service</span><span>cooperative contribution</span><span>surplus allocation</span></div><p className="mt-7 text-xs leading-5 text-[#b9d2c6]">₹200 contribution uses the exact 20% model: 5% technology · 6% insurance/social security · 4% emergency · 5% surplus.</p></div></div></section>
    <section><SectionTitle eyebrow="My service activity" title="Movement is impact, not a payout formula." text="Kilometres show the reach of your work and community activity. They do not determine surplus." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Distance travelled" value="248.6 KM" note="verified ledger activity" icon={MapPin} /><Stat label="Completed jobs" value="42" note="all service types" icon={CheckCircle2} accent="sand" /><Stat label="Community jobs" value="12" note="group bookings" icon={UsersRound} accent="coral" /><Stat label="Multi-service projects" value="5" note="coordinated work" icon={BriefcaseBusiness} /></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><div className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-5 sm:p-7"><div className="flex items-start justify-between"><div><Badge>Impact / activity</Badge><h2 className="mt-3 font-serif text-2xl text-[#173d35]">KM activity over recent dates</h2></div><Activity className="text-[#a4523f]" /></div><div className="mt-7 flex h-44 items-end gap-3 border-b border-l border-[#dce4d9] px-3 sm:gap-6">{[['16 Sep', 24], ['17 Sep', 42], ['18 Sep', 68], ['19 Sep', 37], ['20 Sep', 54], ['21 Sep', 23]].map(([date, height]) => <div key={date as string} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-9 rounded-t-lg bg-[#7cae91]" style={{ height: `${Number(height) * 2}px` }} title={`${date}: activity KM`} /><span className="text-[10px] text-[#7a8d84]">{date}</span></div>)}</div><p className="mt-4 text-xs text-[#788b82]">Official activity signal. Surplus pool allocations are ratified at the annual general body meeting.</p></div><div className="rounded-3xl bg-[#f0dec1] p-6 sm:p-7"><Badge tone="sand">Audited</Badge><h2 className="mt-5 font-serif text-2xl text-[#5c431d]">Total surplus accumulated</h2><div className="mt-3 font-serif text-5xl text-[#5c431d]">₹2,450</div><p className="mt-3 text-sm leading-6 text-[#765b2e]">Accumulated surplus credit for this member account under cooperative dividend bylaws.</p><div className="mt-6 border-t border-[#d8bb88] pt-4 text-xs leading-5 text-[#765b2e]">Surplus is tracked from cooperative activity records, not from kilometres.</div></div></div></section>
    <section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-5 sm:p-7"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><SectionTitle eyebrow="Ledger explorer" title="Recent Cooperative Activity" text="Filter cooperative service activity and trace verified surplus allocations across bookings." /><div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><label className="text-[11px] font-bold uppercase tracking-[.1em] text-[#71857b]">Time<select value={time} onChange={e => setTime(e.target.value)} data-testid="select-surplus-time" className="mt-1 w-full rounded-xl border border-[#d7e0d6] bg-[#f7faf5] px-3 py-2 text-xs font-bold normal-case tracking-normal text-[#315d4e] outline-none"><option>Today</option><option>This Week</option><option>This Month</option><option>This Year</option></select></label><label className="text-[11px] font-bold uppercase tracking-[.1em] text-[#71857b]">Activity type<select value={activityType} onChange={e => setActivityType(e.target.value)} data-testid="select-surplus-type" className="mt-1 w-full rounded-xl border border-[#d7e0d6] bg-[#f7faf5] px-3 py-2 text-xs font-bold normal-case tracking-normal text-[#315d4e] outline-none"><option>All Services</option><option>Group Bookings</option><option>Multi-Service Projects</option><option>Individual Bookings</option></select></label><label className="text-[11px] font-bold uppercase tracking-[.1em] text-[#71857b]">Distance<select value={distance} onChange={e => setDistance(e.target.value)} data-testid="select-surplus-distance" className="mt-1 w-full rounded-xl border border-[#d7e0d6] bg-[#f7faf5] px-3 py-2 text-xs font-bold normal-case tracking-normal text-[#315d4e] outline-none"><option>All distances</option><option>0–5 KM</option><option>5–10 KM</option><option>10–20 KM</option><option>20+ KM</option></select></label></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-[#e3e9df] text-[11px] uppercase tracking-[.1em] text-[#809289]"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Service</th><th className="px-3 py-3">Distance</th><th className="px-3 py-3">Service value</th><th className="px-3 py-3">Surplus allocation</th></tr></thead><tbody>{filteredRows.map(row => <tr key={`${row.date}-${row.service}`} className="border-b border-[#edf1eb] text-[#4e6c60]"><td className="px-3 py-4 font-bold text-[#315d4e]">{row.date}</td><td className="px-3 py-4"><span className="font-bold text-[#315d4e]">{row.service}</span><span className="mt-1 block text-xs text-[#84958d]">{row.type}</span></td><td className="px-3 py-4">{row.km.toFixed(1)} km</td><td className="px-3 py-4">₹{row.value.toLocaleString('en-IN')}</td><td className="px-3 py-4 font-bold text-[#a4523f]">₹{row.surplus}</td></tr>)}</tbody></table>{filteredRows.length === 0 && <div className="p-8 text-center text-sm text-[#74877d]" data-testid="empty-surplus-filter">No activity records match these filters.</div>}</div></section>
    <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9] sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6b56f] text-[#173f36]"><HandHeart size={21} /></span><div><Badge tone="sand">The cooperative promise</Badge><h2 className="mt-3 font-serif text-3xl">Where Does the Surplus Go?</h2></div></div><p className="mt-5 text-sm leading-7 text-[#c4d9cd]">The year-end cooperative surplus is held for collective decisions: strengthening the cooperative, supporting shared priorities, or being utilized according to the rules adopted by its members.</p><div className="mt-6 grid grid-cols-2 gap-2 text-xs font-bold text-[#d8e7dc]"><div className="rounded-xl bg-[#2b5b4d] p-3">5% technology</div><div className="rounded-xl bg-[#2b5b4d] p-3">6% insurance / social security</div><div className="rounded-xl bg-[#2b5b4d] p-3">4% emergency</div><div className="rounded-xl bg-[#2b5b4d] p-3">5% surplus</div></div></div><div className="rounded-3xl border border-[#e2e6db] bg-[#f8faf4] p-6 sm:p-8"><div className="flex gap-3"><CircleHelp className="mt-1 shrink-0 text-[#a4523f]" /><div><h2 className="font-serif text-2xl text-[#285548]">Cooperative Governance & Auditing</h2><p className="mt-3 text-sm leading-7 text-[#687d73]">Surplus distributions are governed by cooperative society bylaws and ratified during annual general body meetings for dividend allocation and reserve fund growth.</p><Link href="/insurance" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#a4523f]" data-testid="link-surplus-back-insurance">Review Insurance &amp; Emergency <ArrowRight size={16} /></Link></div></div></div></section>
  </div>;
}

type WorkerJobStatus = 'Requested' | 'Accepted' | 'Worker On The Way' | 'Work Started' | 'Completed';
type WorkerJob = { id: string; service: string; customer: string; location: string; distance: string; date: string; time: string; duration: string; earnings: number; serviceValue?: number; rating: number; status: WorkerJobStatus };
type JobRequest = WorkerJob & { history: string; trust: string[]; accepted: boolean };

const seededWorkerJobs: WorkerJob[] = [
  { id: 'job-rahul-plumbing', service: 'Kitchen Plumbing', customer: 'Rahul Mehta', location: 'Kothrud, Pune', distance: '4.2 km', date: 'Today', time: '10:00 AM', duration: '1.5 hrs', earnings: 850, rating: 4.7, status: 'Accepted' },
  { id: 'job-priya-electrical', service: 'Electrical Repair', customer: 'Priya Nair', location: 'Aundh, Pune', distance: '6.8 km', date: 'Today', time: '2:00 PM', duration: '2 hrs', earnings: 1200, rating: 4.9, status: 'Accepted' },
  { id: 'job-sameer-fan', service: 'Ceiling Fan Installation', customer: 'Sameer Joshi', location: 'Baner, Pune', distance: '3.6 km', date: 'Tomorrow', time: '11:30 AM', duration: '1 hr', earnings: 800, serviceValue: 1000, rating: 4.8, status: 'Completed' },
];
const seededRequests: JobRequest[] = [
  { ...seededWorkerJobs[0], status: 'Requested', accepted: false, history: '4 previous bookings · ₹3,400 spent', trust: ['Address verified', 'Repeat customer', 'Cooperative member'] },
  { ...seededWorkerJobs[1], status: 'Requested', accepted: false, history: '2 previous bookings · ₹2,050 spent', trust: ['Phone verified', 'Clear instructions', 'Neighbourhood referral'] },
  { id: 'job-anita-switchboard', service: 'Switchboard Repair', customer: 'Anita Kulkarni', location: 'Warje, Pune', distance: '5.1 km', date: 'Tomorrow', time: '4:30 PM', duration: '1 hr', earnings: 620, rating: 4.6, status: 'Requested', accepted: false, history: 'New customer · booking value ₹775', trust: ['Phone verified', 'Cooperative member'] },
];

const YEAR_END_SURPLUS_POOL = 245000;
const BASE_WORKER_COMPLETED_JOBS = 127;
const BASE_OTHER_ELIGIBLE_COMPLETED_JOBS = 1122;

function getWorkerCompletedJobs(jobs: WorkerJob[]) {
  return BASE_WORKER_COMPLETED_JOBS + jobs.filter(job => job.status === 'Completed').length;
}

function getTotalCooperativeCompletedJobs(myCompletedJobs: number) {
  return BASE_OTHER_ELIGIBLE_COMPLETED_JOBS + myCompletedJobs;
}

function getSurplusCalculation(myCompletedJobs: number) {
  const totalCompletedJobs = getTotalCooperativeCompletedJobs(myCompletedJobs);
  const share = totalCompletedJobs > 0 ? myCompletedJobs / totalCompletedJobs : 0;
  return {
    totalCompletedJobs,
    share,
    sharePercent: share * 100,
    estimatedSurplus: Math.round(share * YEAR_END_SURPLUS_POOL),
  };
}

function CustomerLogin({ onToast, setRole }: { onToast: (t: Toast) => void; setRole: (role: Role) => void }) {
  const [, setLocation] = useLocation();
  const [mobile, setMobile] = useState('+91 98220 12345');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (pin.trim().length < 4) {
      setError('Please enter a 4-digit or 6-digit security PIN.');
      return;
    }
    setError('');
    const session: CustomerSession = {
      id: 'cust-101',
      name: 'Kavya Deshmukh',
      phone: mobile.trim(),
      email: 'kavya.deshmukh@pune.coop',
      address: 'Model Colony, Pune',
      role: 'customer',
      token: 'tok_cust_101'
    };
    if (remember) localStorage.setItem('coopconnect-customer-session', JSON.stringify(session));
    else localStorage.removeItem('coopconnect-customer-session');
    sessionStorage.setItem('coopconnect-customer-session', JSON.stringify(session));
    localStorage.setItem('coop-role', JSON.stringify('customer'));
    setRole('customer');
    onToast({ title: 'Customer sign in successful', text: 'Welcome back, Kavya Deshmukh.' });
    setLocation('/customer/dashboard');
  };

  const quickLogin = () => {
    setMobile('+91 98220 12345');
    setPin('1234');
    setError('');
    const session: CustomerSession = defaultCustomerSeed;
    if (remember) localStorage.setItem('coopconnect-customer-session', JSON.stringify(session));
    sessionStorage.setItem('coopconnect-customer-session', JSON.stringify(session));
    localStorage.setItem('coop-role', JSON.stringify('customer'));
    setRole('customer');
    onToast({ title: 'Customer session active', text: 'Welcome to your customer portal.' });
    setLocation('/customer/dashboard');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-lg items-center justify-center py-4">
      <div className="w-full rounded-[2rem] border border-[#d7e2d7] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(25,72,59,.12)] sm:p-9" data-testid="view-customer-login">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-[#53796c]" data-testid="link-customer-back-home">← Back to home</Link>
          <Badge tone="teal">Customer Portal</Badge>
        </div>
        <div className="mt-9 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d5c4d] text-[#efbe7d]">
            <UserRound size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a75d45]">CoopConnect Account</p>
            <h1 className="font-serif text-3xl text-[#173d35]">Customer Sign In</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#62766d]">
          Access your bookings, track verified local workers, and support cooperative community welfare.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#e5a298] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b14e3d]" data-testid="error-customer-login">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#60766c]">Mobile Number</span>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="+91 98220 12345"
              className="w-full rounded-xl border border-[#d6e0d5] bg-[#f3f6ef] px-4 py-3 text-sm text-[#315d4e] outline-none focus:border-[#1d5c4d]"
              data-testid="input-customer-mobile"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#60766c]">PIN / Security Code</span>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              className="w-full rounded-xl border border-[#d6e0d5] bg-[#f3f6ef] px-4 py-3 text-sm text-[#315d4e] outline-none focus:border-[#1d5c4d]"
              data-testid="input-customer-pin"
            />
          </label>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#6c8077]">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} data-testid="checkbox-remember-customer" />
              Remember session
            </label>
            <button
              type="button"
              onClick={() => onToast({ title: 'PIN Assistance', text: 'An OTP has been dispatched to your registered mobile number.' })}
              className="text-xs font-bold text-[#a4523f]"
              data-testid="button-customer-forgot-pin"
            >
              Forgot PIN?
            </button>
          </div>
          <Button type="submit" className="mt-4 w-full" testId="button-customer-login">
            Sign in to Customer Portal <ArrowRight size={16} />
          </Button>
        </form>

        <button
          onClick={quickLogin}
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8d8ca] px-4 py-3 text-sm font-bold text-[#205648] hover:bg-[#edf4ec]"
          data-testid="button-quick-customer-login"
        >
          <Sparkles size={16} /> Quick Sign In (Kavya Deshmukh)
        </button>

        <div className="mt-7 rounded-2xl bg-[#e8f1e9] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d5c4d] text-sm font-bold text-[#f5ebd7]">KD</div>
            <div>
              <p className="font-bold text-[#205648]">Kavya Deshmukh</p>
              <p className="text-xs text-[#5b786b]">Household Member · Model Colony, Pune</p>
            </div>
            <ShieldCheck className="ml-auto text-[#28705a]" size={19} />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#668075]">
            Cooperative Customer ID: cust-101 · Transparent booking records & emergency assistance included.
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onToast, setRole }: { onToast: (t: Toast) => void; setRole: (role: Role) => void }) {
  const [, setLocation] = useLocation();
  const [adminId, setAdminId] = useState('admin@coopconnect.org');
  const [passcode, setPasscode] = useState('admin123');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!adminId.trim() || adminId.trim().length < 4) {
      setError('Please enter a valid Admin ID or cooperative email address.');
      return;
    }
    if (!passcode || passcode.length < 4) {
      setError('Please enter the administrative access passcode (minimum 4 characters).');
      return;
    }
    setError('');
    const session: AdminSession = {
      id: 'admin-01',
      name: 'Pune Cooperative Admin',
      email: adminId.includes('@') ? adminId.trim() : 'admin@coopconnect.org',
      role: 'admin',
      federation: 'Pune District Labour Cooperative Federation',
      token: 'tok_admin_01'
    };
    if (remember) localStorage.setItem('coopconnect-admin-session', JSON.stringify(session));
    else localStorage.removeItem('coopconnect-admin-session');
    sessionStorage.setItem('coopconnect-admin-session', JSON.stringify(session));
    localStorage.setItem('coop-role', JSON.stringify('admin'));
    setRole('admin');
    onToast({ title: 'Administrator session started', text: 'Welcome to the Cooperative Operations Console.' });
    setLocation('/admin-dashboard');
  };

  const quickLogin = () => {
    setAdminId('admin@coopconnect.org');
    setPasscode('admin123');
    setError('');
    const session: AdminSession = {
      id: 'admin-01',
      name: 'Pune Cooperative Admin',
      email: 'admin@coopconnect.org',
      role: 'admin',
      federation: 'Pune District Labour Cooperative Federation',
      token: 'tok_admin_01'
    };
    if (remember) localStorage.setItem('coopconnect-admin-session', JSON.stringify(session));
    sessionStorage.setItem('coopconnect-admin-session', JSON.stringify(session));
    localStorage.setItem('coop-role', JSON.stringify('admin'));
    setRole('admin');
    onToast({ title: 'Admin console active', text: 'Logged in as Cooperative Federation Admin.' });
    setLocation('/admin-dashboard');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-lg items-center justify-center py-4">
      <div className="w-full rounded-[2rem] border border-[#d7e2d7] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(25,72,59,.12)] sm:p-9" data-testid="view-admin-login">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-[#53796c]" data-testid="link-admin-back-home">← Back to home</Link>
          <Badge tone="coral">Admin Console</Badge>
        </div>
        <div className="mt-9 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d5c4d] text-[#efbe7d]">
            <Building2 size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a75d45]">Federation Administration</p>
            <h1 className="font-serif text-3xl text-[#173d35]">Cooperative Admin Sign In</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#62766d]">
          Administrative console for cooperative society officers, verification coordinators, and statutory auditors.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#e5a298] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b14e3d]" data-testid="error-admin-login">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#60766c]">Admin ID / Official Email</span>
            <input
              type="text"
              value={adminId}
              onChange={e => setAdminId(e.target.value)}
              placeholder="admin@coopconnect.org"
              className="w-full rounded-xl border border-[#d6e0d5] bg-[#f3f6ef] px-4 py-3 text-sm text-[#315d4e] outline-none focus:border-[#1d5c4d]"
              data-testid="input-admin-id"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#60766c]">Administrative Passcode</span>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#d6e0d5] bg-[#f3f6ef] px-4 py-3 text-sm text-[#315d4e] outline-none focus:border-[#1d5c4d]"
              data-testid="input-admin-passcode"
            />
          </label>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#6c8077]">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} data-testid="checkbox-remember-admin" />
              Remember credentials
            </label>
            <button
              type="button"
              onClick={() => onToast({ title: 'Federation Recovery', text: 'Master key reset instructions sent to federation headquarters.' })}
              className="text-xs font-bold text-[#a4523f]"
              data-testid="button-admin-forgot-passcode"
            >
              Reset passcode
            </button>
          </div>
          <Button type="submit" className="mt-4 w-full" testId="button-admin-login">
            Sign in to Admin Console <ArrowRight size={16} />
          </Button>
        </form>

        <button
          onClick={quickLogin}
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8d8ca] px-4 py-3 text-sm font-bold text-[#205648] hover:bg-[#edf4ec]"
          data-testid="button-quick-admin-login"
        >
          <Sparkles size={16} /> Quick Sign In (Cooperative Admin)
        </button>

        <div className="mt-7 rounded-2xl bg-[#e8f1e9] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d5c4d] text-sm font-bold text-[#f5ebd7]">AD</div>
            <div>
              <p className="font-bold text-[#205648]">Pune Federation Central Console</p>
              <p className="text-xs text-[#5b786b]">Labour Cooperative Federation Officer</p>
            </div>
            <ShieldCheck className="ml-auto text-[#28705a]" size={19} />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#668075]">
            Authorized federation administrative access. All actions are logged to the statutory audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}

function WorkerLogin({ onToast, setRole }: { onToast: (t: Toast) => void; setRole: (role: Role) => void }) {
  const [, setLocation] = useLocation();
  const [mobile, setMobile] = useState('+91 98901 23456');
  const [pin, setPin] = useState('654321');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (pin.trim().length < 4) {
      setError('Please enter your 4-digit or 6-digit worker security PIN.');
      return;
    }
    setError('');
    const session: WorkerSession = {
      id: 'amit-sharma',
      name: 'Amit Sharma',
      phone: mobile.trim(),
      role: 'worker',
      trade: 'Electrical repair',
      token: 'tok_worker_amit_sharma'
    };
    if (remember) localStorage.setItem('coopconnect-worker-session', JSON.stringify(session));
    else localStorage.removeItem('coopconnect-worker-session');
    sessionStorage.setItem('coopconnect-worker-session', JSON.stringify(session));
    localStorage.setItem('coop-role', JSON.stringify('worker'));
    setRole('worker');
    setLocation('/worker/dashboard');
    onToast({ title: 'Worker session started', text: 'Amit Sharma · Verified Member Portal active.' });
  };

  const quickLogin = () => {
    setMobile('+91 98901 23456');
    setPin('654321');
    setError('');
    const session: WorkerSession = {
      id: 'amit-sharma',
      name: 'Amit Sharma',
      phone: '+91 98901 23456',
      role: 'worker',
      trade: 'Electrical repair',
      token: 'tok_worker_amit_sharma'
    };
    if (remember) localStorage.setItem('coopconnect-worker-session', JSON.stringify(session));
    sessionStorage.setItem('coopconnect-worker-session', JSON.stringify(session));
    localStorage.setItem('coop-role', JSON.stringify('worker'));
    setRole('worker');
    setLocation('/worker/dashboard');
    onToast({ title: 'Worker session started', text: 'Amit Sharma · Verified Member Portal active.' });
  };

  return <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-lg items-center justify-center py-4">
    <div className="w-full rounded-[2rem] border border-[#d7e2d7] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(25,72,59,.12)] sm:p-9" data-testid="view-worker-login">
      <div className="flex items-center justify-between"><Link href="/" className="text-sm font-bold text-[#53796c]" data-testid="link-worker-back-role">← Role selection</Link><Badge tone="sand">Worker Portal</Badge></div>
      <div className="mt-9 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d5c4d] text-[#efbe7d]"><UserCheck size={24} /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a75d45]">CoopConnect Portal</p><h1 className="font-serif text-3xl text-[#173d35]">Worker Sign In</h1></div></div>
      <p className="mt-5 text-sm leading-6 text-[#62766d]">A dedicated workspace for cooperative trade professionals. Manage jobs, track earnings, and access member welfare.</p>
      
      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#e5a298] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b14e3d]" data-testid="error-worker-login">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#60766c]">Mobile Number</span>
          <input
            type="tel"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            className="w-full rounded-xl border border-[#d6e0d5] bg-[#f3f6ef] px-4 py-3 text-sm text-[#315d4e] outline-none focus:border-[#1d5c4d]"
            data-testid="input-worker-mobile"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#60766c]">PIN / Security Code</span>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full rounded-xl border border-[#d6e0d5] bg-[#f3f6ef] px-4 py-3 text-sm text-[#315d4e] outline-none focus:border-[#1d5c4d]"
            data-testid="input-worker-pin"
          />
        </label>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-[#6c8077]">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} data-testid="checkbox-remember-worker" /> Remember my session
          </label>
          <button type="button" onClick={() => onToast({ title: 'PIN Reset Assistance', text: 'Cooperative coordinator assistance has been requested for your account.' })} className="text-xs font-bold text-[#a4523f]" data-testid="button-forgot-pin">Forgot PIN?</button>
        </div>
        <Button type="submit" className="mt-4 w-full" testId="button-worker-login">Log in to Worker Portal <ArrowRight size={16} /></Button>
      </form>
      <button onClick={quickLogin} type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8d8ca] px-4 py-3 text-sm font-bold text-[#205648] hover:bg-[#edf4ec]" data-testid="button-enter-worker-access"><Sparkles size={16} /> Quick Sign In (Amit Sharma)</button>
      <div className="mt-7 rounded-2xl bg-[#e8f1e9] p-4"><div className="flex items-center gap-3"><Avatar worker={workers[0]} /><div><p className="font-bold text-[#205648]">Amit Sharma</p><p className="text-xs text-[#5b786b]">Electrician · Verified Cooperative Worker</p></div><ShieldCheck className="ml-auto text-[#28705a]" size={19} /></div><p className="mt-3 text-[11px] leading-5 text-[#668075]">Official Digital Passport · Cooperative Member Verified under Labour Federation standards.</p></div>
    </div>
  </div>;
}

function CustomerDashboardPage({ onToast, onSos }: { onToast: (t: Toast) => void; onSos: () => void }) {
  const [, setLocation] = useLocation();
  const cust = getCustomerSession();
  useEffect(() => {
    if (!cust) {
      setLocation('/customer/login');
    }
  }, [cust, setLocation]);

  if (!cust) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center" data-testid="redirecting-customer-login">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d5c4d] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#285548]">Redirecting to Customer Sign In...</p>
      </div>
    );
  }

  const [bookings] = useStored<Booking[]>('coopconnect-customer-bookings', seededCustomerBookings);
  const myBookings = bookings.filter(b => b.customerId === cust.id);
  const upcoming = myBookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress');
  const totalWelfare = myBookings.reduce((sum, b) => sum + (b.contribution || 0), 0);

  return (
    <div className="space-y-8 animate-rise" data-testid="view-customer-dashboard">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge tone="teal">Customer Portal · Member Account</Badge>
          <h1 className="mt-3 font-serif text-4xl text-[#173d35] sm:text-5xl">Welcome back, {cust.name.split(' ')[0]}.</h1>
          <p className="mt-2 text-sm text-[#62766d]">Your household services, bookings, and cooperative community impact.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLocation('/book')} testId="button-customer-dashboard-book">
            <Plus size={16} /> Book a Service
          </Button>
          <Button onClick={() => setLocation('/bookings')} variant="outline" testId="button-customer-dashboard-my-bookings">
            <CalendarDays size={16} /> My Bookings
          </Button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="My Bookings" value={String(myBookings.length)} note="Lifetime service visits" icon={CalendarDays} />
        <Stat label="Upcoming Visits" value={String(upcoming.length)} note="Scheduled help" icon={Clock3} accent="sand" />
        <Stat label="Welfare Impact" value={`₹${totalWelfare}`} note="Your cooperative share" icon={HandHeart} accent="coral" />
        <Stat label="Local Professionals" value="6" note="Verified Pune workers" icon={UsersRound} accent="teal" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <Badge tone="sand">Active & Upcoming Services</Badge>
              <h2 className="mt-3 font-serif text-3xl text-[#173d35]">Your Scheduled Visits</h2>
            </div>
            <Link href="/bookings" className="text-sm font-bold text-[#a4523f]" data-testid="link-dashboard-view-all-bookings">
              View all history <ArrowRight size={15} className="inline" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#ccd9cf] bg-[#f9faf7] p-8 text-center">
              <CalendarDays className="mx-auto text-[#7d9b8e]" size={32} />
              <p className="mt-3 font-bold text-[#285548]">No visits scheduled right now</p>
              <p className="mt-1 text-xs text-[#71857b]">Need help with electrical, plumbing, or cleaning?</p>
              <Button onClick={() => setLocation('/book')} className="mt-4" testId="button-empty-book-now">
                Book a service now
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="flex flex-col gap-4 rounded-2xl bg-[#f2f6f1] p-4 sm:flex-row sm:items-center" data-testid={`customer-upcoming-${b.id}`}>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e1eee8] text-[#1d5c4d]">
                    <CalendarDays size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-base text-[#1b473c]">{b.service}</strong>
                      <span className="rounded bg-[#e5eee4] px-2 py-0.5 font-mono text-xs font-bold text-[#276452]">{b.id}</span>
                      <Badge tone="teal"><Check size={11} /> {b.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#63796f]">
                      <strong>{b.dateDisplay || b.date}</strong> · {b.time} · Assigned: {b.worker}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <strong className="block text-base text-[#173d35]">₹{b.total.toLocaleString('en-IN')}</strong>
                    <Link href="/bookings" className="text-xs font-bold text-[#356f5e] underline">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-[#edf0e9] pt-6">
            <h3 className="font-serif text-xl text-[#173d35]">Need another service?</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {services.slice(0, 3).map(s => (
                <button
                  key={s.name}
                  onClick={() => setLocation(`/book?service=${encodeURIComponent(s.name)}`)}
                  className="flex items-center gap-2 rounded-xl border border-[#e1e8df] bg-white p-3 text-left hover:bg-[#f6f9f4]"
                  data-testid={`quick-book-${s.name}`}
                >
                  <s.icon size={18} className="text-[#32745d]" />
                  <span className="text-xs font-bold text-[#285548]">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9]">
            <Badge tone="sand"><ReceiptIndianRupee size={12} /> Cooperative Transparency</Badge>
            <h2 className="mt-4 font-serif text-3xl">Your Community Contribution</h2>
            <p className="mt-3 text-sm leading-6 text-[#c5d9ce]">
              Every booking allocates 20% to member welfare, insurance, emergency response, and community surplus.
            </p>
            <div className="mt-6 rounded-2xl bg-[#285d4f] p-4">
              <div className="flex justify-between text-xs text-[#c5d9ce]">
                <span>Total contributed</span>
                <strong className="text-base text-[#efbe7d]">₹{totalWelfare}</strong>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-[#a6c6b9]">
                Allocated across 4 protected cooperative funds under registered society guidelines.
              </p>
            </div>
            <Link href="/features" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#efbe7d]">
              Learn how the cooperative model works <ArrowRight size={14} />
            </Link>
          </div>

          <div className="rounded-3xl border border-[#eedad3] bg-[#fff5f2] p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fae5dc] text-[#a4523f]">
                <Siren size={20} />
              </span>
              <div>
                <strong className="block text-sm text-[#733c32]">Safety First</strong>
                <span className="text-xs text-[#8f6459]">24/7 on-call coordinator</span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#825c52]">
              Emergency coordinator Desk CC-SOS-042 is linked to all visits for rapid assistance.
            </p>
            <Button onClick={onSos} variant="danger" className="mt-4 w-full" testId="button-dashboard-sos">
              <Siren size={15} /> Safety SOS
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WorkerPassportPage() {
  const [, setLocation] = useLocation();
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Your cooperative identity" title="Digital Worker Passport" text="A portable record of skill, trust, safety, and the work you have built together." action={<Button onClick={() => setLocation('/worker/profile')} variant="outline" testId="button-edit-passport"><Edit3 size={16} /> Edit profile</Button>} />
    <section className="relative overflow-hidden rounded-[2rem] bg-[#174a3d] p-6 text-[#fff8e9] shadow-[0_22px_60px_rgba(23,74,61,.18)] sm:p-9"><div className="paper-grid absolute inset-0 opacity-20" /><div className="relative grid gap-8 lg:grid-cols-[1.4fr_.6fr]"><div><div className="flex items-start gap-4"><Avatar worker={{ ...workers[0], color: '#e6b56f' }} size="lg" /><div><Badge tone="sand"><ShieldCheck size={12} /> Verified cooperative worker</Badge><h2 className="mt-4 font-serif text-4xl">Amit Sharma</h2><p className="mt-2 text-[#c1d7cb]">Electrician · Pune, Maharashtra</p><p className="mt-1 text-xs text-[#a8c5b7]">Worker ID: CC-PN-EL-0148 · Cooperative member since 2021</p></div></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['128', 'Completed jobs'], ['4.8', 'Average rating'], ['8 yrs', 'Experience'], ['100%', 'Safety training']].map(([value, label]) => <div key={label} className="rounded-2xl bg-[#285b4e] p-4"><strong className="block text-2xl text-[#efbe7d]">{value}</strong><span className="mt-1 block text-[11px] text-[#c5d9ce]">{label}</span></div>)}</div><div className="mt-6 flex flex-wrap gap-2"><Badge>Electrical repairs</Badge><Badge>Appliance installation</Badge><Badge>Wiring &amp; safety</Badge></div></div><div className="flex flex-col items-center justify-center rounded-3xl border border-[#588073] bg-[#1d5447] p-6 text-center"><div className="grid h-36 w-36 place-items-center rounded-2xl bg-[#fff8e9] p-3 text-[#174a3d]"><QrCode size={102} strokeWidth={1.3} /></div><p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-[#efbe7d]">Scan to verify</p><p className="mt-2 text-xs leading-5 text-[#b9d2c6]">Verified Member QR · Instant digital verification</p></div></div></section>
    <div className="grid gap-5 md:grid-cols-3"><div className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><Badge>Skills &amp; experience</Badge><h3 className="mt-4 font-serif text-2xl text-[#173d35]">Trusted in the details</h3><p className="mt-3 text-sm leading-6 text-[#62766d]">Residential electrical work, appliance installation, preventive checks, and safe wiring guidance across Pune.</p></div><div className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><Badge tone="sand">Certifications</Badge><h3 className="mt-4 font-serif text-2xl text-[#173d35]">Ready for the next job</h3><div className="mt-4 space-y-3 text-sm text-[#5d756a]"><p className="flex gap-2"><CheckCircle2 size={17} className="text-[#32745d]" />Electrical safety · 2024</p><p className="flex gap-2"><CheckCircle2 size={17} className="text-[#32745d]" />Cooperative conduct · 2023</p><p className="flex gap-2"><CheckCircle2 size={17} className="text-[#32745d]" />First aid basics · 2023</p></div></div><div className="rounded-3xl border border-[#ecdcd4] bg-[#fffaf5] p-6"><Badge tone="coral">Welfare status</Badge><h3 className="mt-4 font-serif text-2xl text-[#173d35]">Covered in the model</h3><p className="mt-3 text-sm leading-6 text-[#62766d]">Insurance and social security contribution tracked. Emergency support pathway available for review.</p><Link href="/worker/welfare" className="mt-5 inline-flex text-sm font-bold text-[#a4523f]" data-testid="link-passport-benefits">View cooperative benefits <ArrowRight size={15} /></Link></div></div>
  </div>;
}

function WorkerDashboardPage({ onToast, onSos }: { onToast: (t: Toast) => void; onSos: () => void }) {
  const [, setLocation] = useLocation();
  const worker = getWorkerSession();
  useEffect(() => {
    if (!worker) {
      setLocation('/worker/login');
    }
  }, [worker, setLocation]);

  if (!worker) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center" data-testid="redirecting-worker-login">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d5c4d] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#285548]">Redirecting to Worker Sign In...</p>
      </div>
    );
  }

  const [availability, setAvailability] = useStored<'Available' | 'Busy' | 'Unavailable'>('coopconnect-worker-availability-status', 'Available');
  const [jobs] = useStored<WorkerJob[]>('coopconnect-worker-jobs', seededWorkerJobs);
  const statusColor = availability === 'Available' ? 'bg-[#dff0e4] text-[#28705a]' : availability === 'Busy' ? 'bg-[#f8ead0] text-[#8c651f]' : 'bg-[#f8e3de] text-[#a14d3d]';
  return <div className="space-y-8 animate-rise"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Badge>Worker workspace · Tuesday, 24 September</Badge><h1 className="mt-3 font-serif text-5xl tracking-[-.035em] text-[#173d35]">Good morning, Amit.</h1><p className="mt-2 text-sm text-[#62766d]">Your work, welfare, and next steps — in one place.</p></div><button onClick={() => setLocation('/worker/availability')} className={`flex items-center gap-2 self-start rounded-full px-4 py-2.5 text-sm font-bold ${statusColor}`} data-testid="button-manage-availability"><span className="h-2 w-2 rounded-full bg-current" />{availability} <Settings2 size={15} /> Manage Availability</button></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Today's Earnings" value="₹2,450" note="from 3 completed jobs" icon={IndianRupee} accent="sand" /><Stat label="Upcoming Jobs" value="3" note="next one at 10:00 AM" icon={CalendarDays} /><Stat label="Completed Jobs" value="128" note="across 8 years" icon={CheckCircle2} accent="coral" /><Stat label="Rating" value="4.8" note="from 86 recent reviews" icon={Star} accent="sand" /></section>
    <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><div className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-5 sm:p-7"><div className="flex items-center justify-between"><div><Badge>Today at a glance</Badge><h2 className="mt-3 font-serif text-3xl text-[#173d35]">Your jobs</h2></div><Link href="/worker/my-jobs" className="text-sm font-bold text-[#a4523f]" data-testid="link-dashboard-all-jobs">See all <ArrowRight size={15} className="inline" /></Link></div><div className="mt-6 space-y-3">{jobs.filter(job => job.date === 'Today').slice(0, 3).map(job => <div key={job.id} className="flex flex-col gap-4 rounded-2xl bg-[#f1f5ef] p-4 sm:flex-row sm:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e3eee9] text-[#246452]"><BriefcaseBusiness size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-[#285548]">{job.time}</strong><span className="text-sm font-bold text-[#173d35]">{job.service}</span><Badge tone={job.status === 'Accepted' ? 'teal' : 'sand'}>{job.status}</Badge></div><p className="mt-1 text-xs text-[#71857b]">{job.customer} · {job.distance} · {job.location}</p></div><strong className="text-lg text-[#285548]">₹{job.earnings.toLocaleString('en-IN')}</strong></div>)}</div></div><div className="rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9]"><Badge tone="sand"><FileBadge size={12} /> Featured identity</Badge><h2 className="mt-4 font-serif text-3xl">Your passport travels with your work.</h2><p className="mt-3 text-sm leading-6 text-[#c5d9ce]">Show verified skills, safety training, and cooperative membership at every booking.</p><Link href="/worker/passport" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#efbe7d] px-4 py-3 text-sm font-bold text-[#173f36]" data-testid="link-dashboard-passport">View Digital Worker Passport <ArrowRight size={16} /></Link></div></section>
    <section className="grid gap-4 md:grid-cols-3"><button onClick={() => setLocation('/worker/jobs')} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 text-left hover:-translate-y-0.5" data-testid="button-quick-job-requests"><BriefcaseBusiness className="text-[#a4523f]" /><strong className="mt-5 block text-[#285548]">Review job requests</strong><span className="mt-1 block text-xs text-[#71857b]">3 new opportunities nearby</span></button><button onClick={() => setLocation('/worker/earnings')} className="rounded-2xl border border-[#dce4d9] bg-[#fffdf8] p-5 text-left hover:-translate-y-0.5" data-testid="button-quick-earnings"><TrendingUp className="text-[#32745d]" /><strong className="mt-5 block text-[#285548]">Track your earnings</strong><span className="mt-1 block text-xs text-[#71857b]">₹14,800 earned this week</span></button><button onClick={onSos} className="rounded-2xl border border-[#ecd4cd] bg-[#fff8f4] p-5 text-left hover:-translate-y-0.5" data-testid="button-quick-sos"><Siren className="text-[#b84f43]" /><strong className="mt-5 block text-[#85483d]">Safety support</strong><span className="mt-1 block text-xs text-[#906c64]">Emergency SOS and visit check-in tools</span></button></section>
  </div>;
}

function WorkerJobRequests({ onToast }: { onToast: (t: Toast) => void }) {
  const [requests, setRequests] = useStored<JobRequest[]>('coopconnect-worker-requests', seededRequests);
  const [, setJobs] = useStored<WorkerJob[]>('coopconnect-worker-jobs', seededWorkerJobs);
  const respond = (request: JobRequest, accepted: boolean) => { setRequests(old => old.map(item => item.id === request.id ? { ...item, accepted, status: accepted ? 'Accepted' : 'Requested' } : item)); if (accepted) setJobs(old => old.some(job => job.id === request.id) ? old : [{ ...request, accepted: undefined, status: 'Accepted' }, ...old]); onToast({ title: accepted ? 'Job accepted' : 'Request declined', text: accepted ? `${request.service} is now in My Jobs.` : 'The request stays available for a future review.' }); };
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="New work, on your terms" title="Job Requests" text="Review job requirements, customer trust signals, and direct net earnings before accepting." /><div className="flex items-center justify-between rounded-2xl bg-[#e8f1e9] px-4 py-3 text-sm text-[#386a58]"><span className="flex items-center gap-2"><CircleDot size={16} className="text-[#32745d]" />3 requests match your skills and availability</span><span className="hidden text-xs font-bold sm:block">Updated just now</span></div><div className="grid gap-4 lg:grid-cols-2">{requests.map(request => <article key={request.id} className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-5 sm:p-6" data-testid={`card-job-request-${request.id}`}><div className="flex items-start justify-between gap-3"><div><Badge tone="sand">{request.service}</Badge><h2 className="mt-3 font-serif text-2xl text-[#173d35]">{request.customer}</h2><p className="mt-1 flex items-center gap-1 text-sm text-[#71857b]"><MapPin size={14} />{request.location} · {request.distance}</p></div><strong className="text-xl text-[#285548]">₹{request.earnings.toLocaleString('en-IN')}</strong></div><div className="mt-5 grid grid-cols-2 gap-2 text-xs text-[#637970]"><div className="rounded-xl bg-[#f2f5ef] p-3"><CalendarDays size={14} className="mb-1 text-[#477367]" />{request.date}</div><div className="rounded-xl bg-[#f2f5ef] p-3"><Clock3 size={14} className="mb-1 text-[#477367]" />{request.time} · {request.duration}</div></div><div className="mt-4 flex items-center gap-2 border-t border-[#e6ebe3] pt-4 text-sm"><Star size={15} fill="#d99949" className="text-[#d99949]" /><strong className="text-[#835c25]">{request.rating}</strong><span className="text-xs text-[#71857b]">{request.history}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{request.trust.map(item => <span key={item} className="rounded-full bg-[#e8f1e9] px-2.5 py-1 text-[11px] font-bold text-[#3e705c]"><Check size={12} className="mr-1 inline" />{item}</span>)}</div>{request.accepted ? <div className="mt-5 flex items-center justify-between rounded-xl bg-[#e5f2e7] p-3 text-sm font-bold text-[#28705a]"><span className="flex items-center gap-2"><CheckCircle2 size={17} />Accepted · added to My Jobs</span><Link href="/worker/my-jobs" className="text-xs underline" data-testid={`link-request-my-job-${request.id}`}>Open job</Link></div> : <div className="mt-5 flex gap-2"><Button onClick={() => respond(request, false)} variant="outline" className="flex-1" testId={`button-decline-${request.id}`}>Decline</Button><Button onClick={() => respond(request, true)} className="flex-1" testId={`button-accept-${request.id}`}>Accept job <Check size={16} /></Button></div>}</article>)}</div></div>;
}

function WorkerMyJobs({ onToast }: { onToast: (t: Toast) => void }) {
  const [jobs, setJobs] = useStored<WorkerJob[]>('coopconnect-worker-jobs', seededWorkerJobs);
  const [tab, setTab] = useState<'Upcoming' | 'Active' | 'Completed'>('Upcoming');
  const advance = (job: WorkerJob) => { const next: WorkerJobStatus = job.status === 'Accepted' ? 'Worker On The Way' : job.status === 'Worker On The Way' ? 'Work Started' : 'Completed'; setJobs(old => old.map(item => item.id === job.id ? { ...item, status: next } : item)); onToast({ title: next === 'Completed' ? 'Job marked completed' : next, text: `${job.service} with ${job.customer} was updated locally.` }); };
  const visible = jobs.filter(job => tab === 'Completed' ? job.status === 'Completed' : tab === 'Active' ? job.status === 'Worker On The Way' || job.status === 'Work Started' : job.status !== 'Completed' && job.status !== 'Worker On The Way' && job.status !== 'Work Started');
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Your work timeline" title="My Jobs" text="Move each booking forward as the work happens. Every update is saved on this device." /><div className="flex gap-1 rounded-2xl bg-[#e8eee6] p-1">{(['Upcoming', 'Active', 'Completed'] as const).map(item => <button key={item} onClick={() => setTab(item)} className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold ${tab === item ? 'bg-[#fffdf8] text-[#205648] shadow-sm' : 'text-[#6b8076]'}`} data-testid={`tab-my-jobs-${item.toLowerCase()}`}>{item}</button>)}</div><div className="space-y-4">{visible.length === 0 ? <StateCard type="empty" /> : visible.map(job => <article key={job.id} className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-5 sm:p-6" data-testid={`card-my-job-${job.id}`}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e3eee9] text-[#246452]"><BriefcaseBusiness size={19} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-2xl text-[#173d35]">{job.service}</h2><Badge tone={job.status === 'Completed' ? 'teal' : job.status === 'Work Started' ? 'coral' : 'sand'}>{job.status}</Badge></div><p className="mt-1 text-sm text-[#71857b]">{job.customer} · {job.location} · {job.distance}</p></div></div><div className="text-left md:text-right"><strong className="text-xl text-[#285548]">₹{job.earnings.toLocaleString('en-IN')}</strong><p className="text-xs text-[#71857b]">{job.date} · {job.time}</p></div></div><div className="mt-5 flex items-center gap-1">{(['Requested', 'Accepted', 'Worker On The Way', 'Work Started', 'Completed'] as WorkerJobStatus[]).map((stage, index) => <div key={stage} className="flex min-w-0 flex-1 items-center gap-1"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${(['Requested', 'Accepted', 'Worker On The Way', 'Work Started', 'Completed'].indexOf(job.status) >= index) ? 'bg-[#1d5c4d] text-white' : 'bg-[#e7ece5] text-[#82928a]'}`}>{index + 1}</span>{index < 4 && <span className={`h-1 flex-1 rounded-full ${(['Requested', 'Accepted', 'Worker On The Way', 'Work Started', 'Completed'].indexOf(job.status) > index) ? 'bg-[#77aa8a]' : 'bg-[#e7ece5]'}`} />}</div>)}</div>{job.status !== 'Completed' && <div className="mt-5 flex flex-wrap gap-2">{job.status === 'Accepted' && <Button onClick={() => advance(job)} variant="outline" testId={`button-start-travel-${job.id}`}><Navigation size={16} />Start Travel</Button>}{job.status === 'Worker On The Way' && <Button onClick={() => advance(job)} testId={`button-start-work-${job.id}`}><PlayCircle size={16} />Start Work</Button>}{job.status === 'Work Started' && <Button onClick={() => advance(job)} testId={`button-complete-job-${job.id}`}><CircleStop size={16} />Mark Completed</Button>}</div>}</article>)}</div></div>;
}

function WorkerEarnings() {
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Fair work, visible numbers" title="My Earnings" text="A clear record of what you earned and how the cooperative model supports the wider network." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Today" value="₹2,450" note="3 completed jobs" icon={IndianRupee} accent="sand" /><Stat label="This Week" value="₹14,800" note="18 completed jobs" icon={TrendingUp} /><Stat label="This Month" value="₹52,400" note="61 completed jobs" icon={Wallet} accent="coral" /><Stat label="Completed Jobs" value="128" note="all time" icon={CheckCircle2} /></div><div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8"><div className="flex items-center justify-between"><div><Badge>Last 7 days</Badge><h2 className="mt-3 font-serif text-2xl text-[#173d35]">Earnings rhythm</h2></div><BarChart3 className="text-[#a4523f]" /></div><div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-[#dce4d9] px-3 sm:gap-5">{[['M', 44], ['T', 68], ['W', 52], ['T', 88], ['F', 63], ['S', 76], ['S', 38]].map(([day, height], i) => <div key={`${day}-${i}`} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className={`w-full max-w-10 rounded-t-xl ${i === 3 ? 'bg-[#d99958]' : 'bg-[#77aa8a]'}`} style={{ height: `${Number(height)}%` }} /><span className="text-[10px] font-bold text-[#7a8d84]">{day}</span></div>)}</div><p className="mt-4 text-xs text-[#788b82]">Net earnings after statutory cooperative contribution. Paid directly to member account.</p></section><section className="rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9] sm:p-8"><Badge tone="sand">Today’s booking model</Badge><h2 className="mt-4 font-serif text-3xl">₹1,000 service value</h2><div className="mt-7 space-y-3 text-sm"><div className="flex justify-between"><span className="text-[#c5d9ce]">Service Value</span><strong>₹1,000</strong></div><div className="flex justify-between"><span className="text-[#c5d9ce]">Cooperative Contribution</span><strong className="text-[#efbe7d]">₹200</strong></div><div className="flex justify-between border-t border-[#477368] pt-3"><span>Worker Earnings</span><strong className="text-xl text-[#efbe7d]">₹800</strong></div></div><p className="mt-6 text-xs leading-5 text-[#b9d2c6]">The exact 20% model: 6% insurance/social security, 4% emergency assistance, 5% year-end surplus, and 5% app/technology.</p></section></div></div>;
}

function WorkerWelfare() {
  const benefits = [['6%', 'Insurance & social security', 'Worker protection pathways and social security support.', ShieldCheck, '₹60'], ['4%', 'Emergency assistance', 'A documented route for urgent support requests.', Siren, '₹40'], ['5%', 'Year-end surplus', 'Collective surplus held for member decisions.', BarChart3, '₹50'], ['5%', 'App & technology', 'The tools that coordinate fair, local work.', Zap, '₹50']] as const;
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Membership, made visible" title="Cooperative Benefits" text="Every booking makes the shared infrastructure easier to understand. This is the exact 20% contribution model." /><section className="rounded-3xl bg-[#174a3d] p-6 text-[#fff8e9] sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Badge tone="sand">Total Cooperative Contribution</Badge><h2 className="mt-4 font-serif text-5xl text-[#efbe7d]">20%</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#c5d9ce]">From a ₹1,000 service, ₹200 is visibly set aside for the cooperative. Worker earnings remain ₹800.</p></div><div className="rounded-2xl bg-[#285b4e] p-5 text-right"><p className="text-xs text-[#b9d2c6]">Example booking</p><strong className="mt-1 block text-3xl text-[#efbe7d]">₹1,000 → ₹200 → ₹800</strong></div></div></section><div className="grid gap-4 md:grid-cols-2">{benefits.map(([percent, title, text, Icon, amount]) => <article key={title} className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e5efe8] text-[#246452]"><Icon size={23} /></span><strong className="font-serif text-4xl text-[#a4523f]">{percent}</strong></div><h2 className="mt-5 font-serif text-2xl text-[#173d35]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#62766d]">{text}</p><div className="mt-5 border-t border-[#e4e9df] pt-4 text-xs font-bold text-[#688077]">{amount} from every ₹1,000 service</div></article>)}</div><p className="text-xs leading-5 text-[#7a8d84]">Cooperative charter compliance: allocations follow audited cooperative society standards approved by the general body.</p></div>;
}

function WorkerAvailability() {
  const [status, setStatus] = useStored<'Available' | 'Busy' | 'Unavailable'>('coopconnect-worker-availability-status', 'Available');
  const [days, setDays] = useStored<string[]>('coopconnect-worker-availability-days', ['Monday', 'Tuesday']);
  const [slots, setSlots] = useStored<string[]>('coopconnect-worker-availability-slots', ['9:00 AM – 6:00 PM']);
  const [categories, setCategories] = useStored<string[]>('coopconnect-worker-service-categories', ['Electrical', 'Appliance repair']);
  const toggle = (list: string[], value: string, setter: (value: string[]) => void) => setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Work on your terms" title="Availability" text="Set the rhythm that works for you. Availability updates instantly for neighbourhood bookings." /><section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8"><div className="flex flex-wrap gap-2">{(['Available', 'Busy', 'Unavailable'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`rounded-full border px-4 py-2.5 text-sm font-bold ${status === item ? 'border-[#1d5c4d] bg-[#e3eee9] text-[#1d5c4d]' : 'border-[#d9e2d6] text-[#71857b]'}`} data-testid={`button-availability-${item.toLowerCase()}`}>{item}</button>)}</div><div className="mt-8 grid gap-7 md:grid-cols-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a75d45]">Working days</p><div className="mt-3 flex flex-wrap gap-2">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => <button key={day} onClick={() => toggle(days, day, setDays)} className={`rounded-xl px-3 py-2 text-xs font-bold ${days.includes(day) ? 'bg-[#1d5c4d] text-[#fff8e9]' : 'bg-[#edf2eb] text-[#6b8076]'}`} data-testid={`button-day-${day.toLowerCase()}`}>{day.slice(0, 3)}</button>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a75d45]">Time slots</p><div className="mt-3 space-y-2">{['9:00 AM – 6:00 PM', '10:00 AM – 2:00 PM', '2:00 PM – 7:00 PM'].map(slot => <button key={slot} onClick={() => setSlots([slot])} className={`block w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold ${slots.includes(slot) ? 'bg-[#f4dfbd] text-[#7d5a1c]' : 'bg-[#edf2eb] text-[#6b8076]'}`} data-testid={`button-slot-${slot.slice(0, 2)}`}>{slot}</button>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a75d45]">Service categories</p><div className="mt-3 flex flex-wrap gap-2">{['Electrical', 'Appliance repair', 'Plumbing', 'Safety checks'].map(category => <button key={category} onClick={() => toggle(categories, category, setCategories)} className={`rounded-xl px-3 py-2 text-xs font-bold ${categories.includes(category) ? 'bg-[#e3eee9] text-[#1d5c4d]' : 'bg-[#edf2eb] text-[#6b8076]'}`} data-testid={`button-category-${category}`}>{category}</button>)}</div></div></div></section><div className="rounded-2xl bg-[#e8f1e9] p-4 text-sm text-[#386a58]"><CheckCircle2 className="mr-2 inline" size={17} />Next default shift: Monday and Tuesday, 9:00 AM – 6:00 PM.</div></div>;
}

function WorkerRatings() {
  const bars = [['5★', '86%'], ['4★', '10%'], ['3★', '3%'], ['2★', '1%'], ['1★', '0%']];
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Trust you have earned" title="Ratings & feedback" text="A rating is one signal. The words from customers show the care behind it." /><section className="grid gap-6 rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:grid-cols-[.7fr_1.3fr] sm:p-8"><div className="flex flex-col justify-center rounded-2xl bg-[#f3ead6] p-6 text-center"><strong className="font-serif text-7xl text-[#835c25]">4.8</strong><div className="mt-2 flex justify-center gap-1 text-[#d99949]">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}</div><p className="mt-3 text-xs text-[#806b4d]">128 completed jobs</p></div><div className="space-y-3">{bars.map(([label, value]) => <div key={label} className="flex items-center gap-3 text-xs font-bold text-[#60766c]"><span className="w-7">{label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8eee6]"><div className="h-full rounded-full bg-[#d99949]" style={{ width: value }} /></div><span className="w-9 text-right">{value}</span></div>)}</div></section><div className="grid gap-4 md:grid-cols-3">{[['“Arrived exactly when promised and explained the safe fix clearly.”', 'Rahul Mehta · Kitchen plumbing'], ['“The wiring check was thorough. I felt comfortable asking questions.”', 'Priya Nair · Electrical repair'], ['“Clean work, fair estimate, and he left the space better than he found it.”', 'Sameer Joshi · Fan installation']].map(([quote, by]) => <article key={by} className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-5"><MessageSquare className="text-[#a4523f]" size={20} /><p className="mt-4 text-sm leading-6 text-[#385d51]">{quote}</p><p className="mt-5 text-xs font-bold text-[#789087]">{by}</p></article>)}</div></div>;
}

function WorkerProfile() {
  const [profile, setProfile] = useStored('coopconnect-worker-profile', { name: 'Amit Sharma', phone: '+91 98XXX 12XXX', cooperative: 'Pune Worker Cooperative', workerId: 'CC-PN-EL-0148', skills: 'Electrical repairs, appliance installation', experience: '8 years', certifications: 'Electrical safety, First aid basics', languages: 'Hindi, Marathi, English', serviceArea: 'Pune · Kothrud · Aundh · Baner' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const save = () => { setProfile(draft); setEditing(false); };
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="Your professional record" title="Worker Profile" action={<Button onClick={() => { setDraft(profile); setEditing(true); }} variant="outline" testId="button-edit-worker-profile"><Edit3 size={16} /> Edit profile</Button>} /><section className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6 sm:p-8"><div className="flex flex-col gap-5 border-b border-[#e3e9df] pb-6 sm:flex-row sm:items-center"><Avatar worker={{ ...workers[0], name: profile.name, initials: profile.name.split(' ').map(word => word[0]).join('') }} size="lg" /><div><Badge><ShieldCheck size={12} /> Verified cooperative worker</Badge><h2 className="mt-3 font-serif text-3xl text-[#173d35]">{profile.name}</h2><p className="mt-1 text-sm text-[#71857b]">{profile.cooperative} · {profile.workerId}</p></div></div><div className="mt-7 grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">{[['Phone', profile.phone, Phone], ['Skills', profile.skills, Zap], ['Experience', profile.experience, Clock3], ['Certifications', profile.certifications, FileCheck2], ['Languages', profile.languages, Languages], ['Service area', profile.serviceArea, MapPin]].map(([label, value, Icon]) => { const DetailIcon = Icon as typeof Phone; return <div key={String(label)}><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#a75d45]"><DetailIcon size={14} />{String(label)}</p><p className="mt-2 text-sm leading-6 text-[#315d4e]">{String(value)}</p></div>; })}</div></section>{editing && <Modal title="Edit worker profile" onClose={() => setEditing(false)} wide><div className="grid gap-4 sm:grid-cols-2">{Object.entries(draft).map(([key, value]) => <label key={key} className="block"><span className="mb-2 block text-xs font-bold capitalize text-[#60766c]">{key.replace(/([A-Z])/g, ' $1')}</span><input value={String(value)} onChange={e => setDraft(old => ({ ...old, [key]: e.target.value }))} className="w-full rounded-xl border border-[#d6e0d5] bg-[#f8faf4] px-3 py-2.5 text-sm text-[#315d4e] outline-none" data-testid={`input-profile-${key}`} /></label>)}</div><Button onClick={save} className="mt-6 w-full" testId="button-save-worker-profile"><Check size={16} /> Save profile</Button></Modal>}</div>;
}

function WorkerSafety({ onToast }: { onToast: (t: Toast) => void }) {
  const [sosCreated, setSosCreated] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  return <div className="space-y-7 animate-rise"><SectionTitle eyebrow="You are never on your own" title="Safety & support" text="Tools for a safe visit, connected directly with cooperative safety coordinators on duty." /><section className="rounded-[2rem] border border-[#e5c8c0] bg-[#fff5f0] p-6 sm:p-9"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-center"><div><Badge tone="coral"><ShieldAlert size={12} /> Emergency Support</Badge><h2 className="mt-4 font-serif text-4xl text-[#773e34]">Need support right now?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#8b625a]">Trigger SOS to alert the on-call cooperative safety coordinator immediately.</p></div><button onClick={() => { setSosCreated(true); onToast({ title: 'SOS Alert Dispatched', text: 'Emergency request CC-SOS-042 is now under cooperative review.' }); }} className="grid h-32 w-32 shrink-0 place-items-center self-start rounded-full border-[10px] border-[#f4d9d0] bg-[#c95042] text-center text-sm font-bold text-[#fff8ef] shadow-[0_12px_30px_rgba(201,80,66,.2)] hover:bg-[#ae4035]" data-testid="button-worker-sos"><Siren size={25} /><span>SOS</span></button></div>{sosCreated && <div className="mt-7 flex gap-3 rounded-2xl bg-[#f7dfd7] p-4 text-sm text-[#7a4339]" data-testid="status-worker-sos"><CheckCircle2 className="shrink-0" size={19} /><div><strong>Emergency Alert Active</strong><p className="mt-1 text-xs leading-5">Request CC-SOS-042 · Cooperative safety coordinator notified and on standby.</p></div></div>}</section><div className="grid gap-4 md:grid-cols-2"><article className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-center gap-3"><Phone className="text-[#a4523f]" /><h2 className="font-serif text-2xl text-[#173d35]">Emergency Contact</h2></div><p className="mt-4 text-sm text-[#62766d]">Rakesh Sharma · +91 9XXXX 45XXX</p><button onClick={() => onToast({ title: 'Emergency Contact Verified', text: 'Emergency contact line open for direct assistance.' })} className="mt-4 text-sm font-bold text-[#a4523f]" data-testid="button-emergency-contact">View contact details <ArrowRight size={15} className="inline" /></button></article><article className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-center gap-3"><ClipboardCheck className="text-[#32745d]" /><h2 className="font-serif text-2xl text-[#173d35]">Job Check-In</h2></div><p className="mt-4 text-sm text-[#62766d]">Share a safety signal when you arrive and leave a booking.</p><div className="mt-4 flex gap-2"><Button onClick={() => { setCheckedIn(true); onToast({ title: 'Job check-in saved', text: 'Your current booking is marked as active.' }); }} variant={checkedIn ? 'quiet' : 'outline'} testId="button-job-check-in">{checkedIn ? 'Checked in' : 'Check in'}</Button><Button onClick={() => { setCheckedIn(false); onToast({ title: 'Job check-out saved', text: 'Your visit was successfully completed and logged.' }); }} variant="outline" disabled={!checkedIn} testId="button-job-check-out">Check out</Button></div></article><article className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-center gap-3"><RouteIcon className="text-[#32745d]" /><h2 className="font-serif text-2xl text-[#173d35]">Share Job Status</h2></div><p className="mt-4 text-sm leading-6 text-[#62766d]">Let a customer or cooperative coordinator see live status updates.</p><Button onClick={() => onToast({ title: 'Job status shared', text: 'Cooperative visit link generated and shared.' })} className="mt-4" variant="outline" testId="button-share-job-status">Share status</Button></article><article className="rounded-3xl border border-[#dce4d9] bg-[#fffdf8] p-6"><div className="flex items-center gap-3"><ShieldCheck className="text-[#32745d]" /><h2 className="font-serif text-2xl text-[#173d35]">Safety Training</h2></div><p className="mt-4 text-sm leading-6 text-[#62766d]">Electrical safety, first aid basics, and respectful conduct training completed.</p><Badge tone="teal">100% complete</Badge></article></div></div>;
}

function AppContent() {
  const [role, setRole] = useStored<Role>('coop-role', 'customer');
  const [lang, setLang] = useStored<Lang>('coop-lang', 'en');
  const [toast, setToast] = useState<Toast | null>(null);
  const [tour, setTour] = useState(false);
  const [sos, setSos] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Comprehensive role-based route guards
  useEffect(() => {
    // Worker protected routes
    if (location.startsWith('/worker') || location === '/worker-dashboard') {
      if (location === '/worker/login') return;
      const worker = getWorkerSession();
      if (!worker) {
        setLocation('/worker/login');
      } else if (role !== 'worker') {
        setRole('worker');
      }
    }
    // Cooperative Admin protected routes
    else if (location.startsWith('/admin') || location === '/admin-dashboard') {
      if (location === '/admin/login' || location === '/admin-login') return;
      const admin = getAdminSession();
      if (!admin) {
        setLocation('/admin/login');
      } else if (role !== 'admin') {
        setRole('admin');
      }
    }
    // Customer protected routes
    else if (location === '/customer/dashboard' || location === '/bookings' || location === '/book') {
      const cust = getCustomerSession();
      if (!cust) {
        setLocation('/customer/login');
      } else if (role !== 'customer') {
        setRole('customer');
      }
    }
  }, [location, role, setRole, setLocation]);

  return (
    <Shell role={role} setRole={setRole} lang={lang} setLang={setLang} onToast={setToast} onTour={() => setTour(true)} onSos={() => setSos(true)}>
      <Switch>
        <Route path="/" component={() => <HomePage onToast={setToast} onTour={() => setTour(true)} />} />
        <Route path="/customer/login" component={() => <CustomerLogin onToast={setToast} setRole={setRole} />} />
        <Route path="/login" component={() => <CustomerLogin onToast={setToast} setRole={setRole} />} />
        <Route path="/customer/dashboard" component={() => <CustomerDashboardPage onToast={setToast} onSos={() => setSos(true)} />} />
        <Route path="/services" component={() => <ServicesPage onToast={setToast} />} />
        <Route path="/book" component={() => <BookPage onToast={setToast} />} />
        <Route path="/group-booking" component={() => <GroupBookingPage onToast={setToast} />} />
        <Route path="/projects" component={() => <ProjectsPage onToast={setToast} />} />
        <Route path="/bookings" component={BookingsPage} />
        <Route path="/payments" component={() => <PaymentsPage onToast={setToast} />} />
        <Route path="/safety" component={() => <SafetyPage onSos={() => setSos(true)} />} />
        <Route path="/insurance" component={() => <InsurancePage onToast={setToast} />} />
        <Route path="/surplus" component={SurplusPage} />
        <Route path="/features" component={() => <SimpleInfoPage kind="features" />} />
        <Route path="/architecture" component={() => <SimpleInfoPage kind="architecture" />} />
        <Route path="/about" component={() => <SimpleInfoPage kind="about" />} />
        <Route path="/worker/login" component={() => <WorkerLogin onToast={setToast} setRole={setRole} />} />
        <Route path="/worker/dashboard" component={() => <WorkerDashboardPage onToast={setToast} onSos={() => setSos(true)} />} />
        <Route path="/worker-dashboard" component={() => <WorkerDashboardPage onToast={setToast} onSos={() => setSos(true)} />} />
        <Route path="/worker/jobs" component={() => <WorkerJobRequests onToast={setToast} />} />
        <Route path="/worker/my-jobs" component={() => <WorkerMyJobs onToast={setToast} />} />
        <Route path="/worker/earnings" component={WorkerEarnings} />
        <Route path="/worker/passport" component={WorkerPassportPage} />
        <Route path="/worker/welfare" component={WorkerWelfare} />
        <Route path="/worker/insurance-emergency" component={() => <InsurancePage onToast={setToast} />} />
        <Route path="/worker/surplus" component={SurplusPage} />
        <Route path="/worker/availability" component={WorkerAvailability} />
        <Route path="/worker/ratings" component={WorkerRatings} />
        <Route path="/worker/profile" component={WorkerProfile} />
        <Route path="/worker/safety" component={() => <WorkerSafety onToast={setToast} />} />
        <Route path="/worker/:id" component={WorkerPassport} />
        <Route path="/admin/login" component={() => <AdminLogin onToast={setToast} setRole={setRole} />} />
        <Route path="/admin-login" component={() => <AdminLogin onToast={setToast} setRole={setRole} />} />
        <Route path="/admin-dashboard" component={() => <AdminDashboard onToast={setToast} />} />
        <Route path="/profile" component={() => <ProfilePage role={role} lang={lang} setLang={setLang} onToast={setToast} />} />
        <Route component={() => <HomePage onToast={setToast} onTour={() => setTour(true)} />} />
      </Switch>
      {tour && <TourWizard onClose={() => setTour(false)} onToast={setToast} />}
      {sos && <SafetyModal onClose={() => setSos(false)} onToast={setToast} />}
      {toast && (
        <div className="fixed bottom-24 right-4 z-[60] w-[min(360px,calc(100vw-2rem))] animate-rise rounded-2xl border border-[#cbded1] bg-[#fffdf8] p-4 shadow-xl lg:bottom-6" data-testid="toast-notification">
          <div className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#dcefe1] text-[#35714e]">
              <Check size={16} />
            </span>
            <div>
              <strong className="block text-sm text-[#285548]">{toast.title}</strong>
              <p className="mt-1 text-xs leading-5 text-[#71857b]">{toast.text}</p>
            </div>
            <button className="ml-auto text-[#8da097]" onClick={() => setToast(null)} data-testid="button-dismiss-toast">
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Router() { const [location] = useLocation(); return <ErrorBoundary resetKey={location}><AppContent /></ErrorBoundary>; }
export default function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }