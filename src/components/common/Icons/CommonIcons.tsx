import {
  Edit,
  Trash2,
  FileText,
  Eye,
  EyeOff,
  Phone,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,
  LogOut,
  User,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  Upload,
  MoreVertical,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

// Export all commonly used icons
export {
  Edit as EditIcon,
  Trash2 as TrashIcon,
  FileText as DocumentIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
  X as CloseIcon,
  Check as CheckIcon,
  AlertCircle as AlertIcon,
  Info as InfoIcon,
  Loader2 as LoaderIcon,
  LogOut as LogoutIcon,
  User as UserIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarIcon,
  BarChart3 as ChartIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Upload as UploadIcon,
  MoreVertical as MoreVerticalIcon,
  RefreshCw as RotateCwIcon,
  type LucideIcon,
};

// Icon component with consistent sizing and styling
interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const Icon = ({ icon: IconComponent, size = 20, className = "", onClick }: IconProps) => {
  return (
    <IconComponent
      size={size}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    />
  );
};

// Commonly used icon buttons
export const IconButton = ({
  icon: IconComponent,
  onClick,
  className = "",
  size = 18,
  ariaLabel,
}: {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  size?: number;
  ariaLabel?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      <IconComponent size={size} />
    </button>
  );
};
