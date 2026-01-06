import { SvgIconComponent } from "@mui/icons-material";

export type DrawerMenuItem = {
  text: string;
  icon: SvgIconComponent;
  path: string;
  subMenu?: DrawerMenuItem[];
};
