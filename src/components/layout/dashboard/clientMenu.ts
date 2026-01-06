import { DrawerMenuItem } from "@/types/drawerMenuItem";
import { Dashboard as DashboardIcon, ContentPaste as ContentIcon, Person as ProfileIcon } from "@mui/icons-material";

export const SELLER_MENU_ITEMS: DrawerMenuItem[] = [
  { text: "Dashboard", icon: DashboardIcon, path: "/dashboard" },
  { text: "messages", icon: ContentIcon, path: "/dashboard/messages" },
  { text: "Service", icon: ContentIcon, path: "/dashboard/service" },
  { text: "Finance", icon: ContentIcon, path: "/dashboard/finance" },
  { text: "Profile", icon: ProfileIcon, path: "/dashboard/profile" },
];
