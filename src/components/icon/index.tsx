import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ArrowLeftRight from 'lucide-react-native/icons/arrow-left-right';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Banknote from 'lucide-react-native/icons/banknote';
import BatteryLow from 'lucide-react-native/icons/battery-low';
import Bell from 'lucide-react-native/icons/bell';
import BellOff from 'lucide-react-native/icons/bell-off';
import Calendar from 'lucide-react-native/icons/calendar';
import Camera from 'lucide-react-native/icons/camera';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleQuestionMark from 'lucide-react-native/icons/circle-question-mark';
import Clock from 'lucide-react-native/icons/clock';
import Ellipsis from 'lucide-react-native/icons/ellipsis';
import Eye from 'lucide-react-native/icons/eye';
import FileText from 'lucide-react-native/icons/file-text';
import Flame from 'lucide-react-native/icons/flame';
import Globe from 'lucide-react-native/icons/globe';
import House from 'lucide-react-native/icons/house';
import Image from 'lucide-react-native/icons/image';
import Info from 'lucide-react-native/icons/info';
import Key from 'lucide-react-native/icons/key';
import LocateOff from 'lucide-react-native/icons/locate-off';
import Lock from 'lucide-react-native/icons/lock';
import MapPin from 'lucide-react-native/icons/map-pin';
import Maximize2 from 'lucide-react-native/icons/maximize-2';
import Minus from 'lucide-react-native/icons/minus';
import Navigation from 'lucide-react-native/icons/navigation';
import Package from 'lucide-react-native/icons/package';
import Pause from 'lucide-react-native/icons/pause';
import Pencil from 'lucide-react-native/icons/pencil';
import Phone from 'lucide-react-native/icons/phone';
import Pill from 'lucide-react-native/icons/pill';
import Plus from 'lucide-react-native/icons/plus';
import Power from 'lucide-react-native/icons/power';
import QrCode from 'lucide-react-native/icons/qr-code';
import ReceiptText from 'lucide-react-native/icons/receipt-text';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import ScanBarcode from 'lucide-react-native/icons/scan-barcode';
import Scooter from 'lucide-react-native/icons/scooter';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Snowflake from 'lucide-react-native/icons/snowflake';
import Sparkles from 'lucide-react-native/icons/sparkles';
import Store from 'lucide-react-native/icons/store';
import Trash from 'lucide-react-native/icons/trash';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import User from 'lucide-react-native/icons/user';
import Volume2 from 'lucide-react-native/icons/volume-2';
import Wallet from 'lucide-react-native/icons/wallet';
import WifiOff from 'lucide-react-native/icons/wifi-off';
import X from 'lucide-react-native/icons/x';
import Zap from 'lucide-react-native/icons/zap';

import { IconSize, Palette, type ThemeColor } from '@app-experience/theme';
import { useTheme } from '@app-hooks/use-theme';

import type { IconName, IconProps } from './interface';

/**
 * The design's icon set, drawn by Lucide.
 *
 * Lucide's drawing contract is the spec's, verbatim — 24 grid, 2 stroke, round
 * caps and joins, currentColor — so these are the drawings the design asks for
 * rather than an approximation of them.
 *
 * Imported one file at a time, never from the package barrel. Metro does not
 * tree-shake, so `import { Camera } from 'lucide-react-native'` would pull all
 * 1,500-odd icons into the bundle for the handful a screen actually uses.
 */
export const Glyphs: Record<IconName, typeof Check> = {
  alert: TriangleAlert,
  'arrow-right': ArrowRight,
  back: ChevronLeft,
  'barcode-scan': ScanBarcode,
  'battery-low': BatteryLow,
  bell: Bell,
  'bell-off': BellOff,
  box: Package,
  calendar: Calendar,
  camera: Camera,
  cash: Banknote,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  clock: Clock,
  close: X,
  document: FileText,
  edit: Pencil,
  expand: Maximize2,
  eye: Eye,
  flame: Flame,
  flash: Zap,
  globe: Globe,
  'gps-off': LocateOff,
  help: CircleQuestionMark,
  home: House,
  image: Image,
  info: Info,
  key: Key,
  lock: Lock,
  minus: Minus,
  more: Ellipsis,
  navigate: Navigation,
  orders: ReceiptText,
  pause: Pause,
  phone: Phone,
  pill: Pill,
  pin: MapPin,
  plus: Plus,
  power: Power,
  qr: QrCode,
  refresh: RefreshCw,
  scooter: Scooter,
  search: Search,
  settings: Settings,
  'shield-check': ShieldCheck,
  snowflake: Snowflake,
  sparkle: Sparkles,
  store: Store,
  swap: ArrowLeftRight,
  trash: Trash,
  user: User,
  volume: Volume2,
  wallet: Wallet,
  'wifi-off': WifiOff,
};

export function Icon({ name, size = IconSize.base, color = 'ink' }: IconProps) {
  const theme = useTheme();
  const Glyph = Glyphs[name];

  // Stroke stays 2 within the 24 grid, so it scales with the icon as intended.
  const stroke =
    color in Palette ? Palette[color as keyof typeof Palette] : theme[color as ThemeColor];

  return <Glyph size={size} color={stroke} strokeWidth={2} />;
}
