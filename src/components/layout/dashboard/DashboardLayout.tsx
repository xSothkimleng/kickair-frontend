"use client";
import * as React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Image from "next/image";
import {
  Box,
  Drawer as MuiDrawer,
  List,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { Menu as MenuIcon, ExpandLess, ExpandMore } from "@mui/icons-material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { SELLER_MENU_ITEMS } from "./clientMenu";

// Constants
const DRAWER_WIDTH = 360;

interface MiniDrawerProps {
  children?: React.ReactNode;
}

// Styled Components
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
  ...theme.mixins.toolbar,
}));

// Drawer Mixins
const createDrawerMixin = (theme: Theme, isOpen: boolean): CSSObject => ({
  width: isOpen ? DRAWER_WIDTH : `calc(${theme.spacing(7)} + 1px)`,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration[isOpen ? "enteringScreen" : "leavingScreen"],
  }),
  borderRight: "none",
  background: "none",
  overflowX: "hidden",
  boxShadow: isOpen ? "none" : "0 4px 20px 0 rgba(0,0,0,0.12)",
  ...(isOpen
    ? {}
    : {
        [theme.breakpoints.up("sm")]: {
          width: `calc(${theme.spacing(8)} + 1px)`,
        },
      }),
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== "open",
})(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    ...createDrawerMixin(theme, !!open),
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
  },
  ...createDrawerMixin(theme, !!open),
}));

// Main Component
const DashboardDrawer: React.FC<MiniDrawerProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [subMenuOpen, setSubMenuOpen] = useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    // Open submenu if current path is within a submenu
    SELLER_MENU_ITEMS.forEach(item => {
      if (item.subMenu && item.subMenu.some(subItem => pathname.startsWith(subItem.path))) {
        setSubMenuOpen(prev => ({ ...prev, [item.text]: true }));
      }
    });
  }, [pathname]);

  const isActiveRoute = (path: string): boolean => {
    // Special case for dashboard to avoid matching all routes
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    // For other routes, use startsWith to match sub-routes
    return pathname.startsWith(path);
  };

  const handleSubMenuToggle = (text: string) => {
    setSubMenuOpen(prev => ({ ...prev, [text]: !prev[text] }));
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant='permanent' open={open}>
        <DrawerHeader>
          <Box
            sx={{
              display: open ? "flex" : "none",
              margin: "auto",
              alignItems: "center",
              mt: 2,
              transition: "all 0.3s ease",
            }}>
            <Image src='/assets/images/kickair-logo.png' alt='logo' width={200} height={80} style={{ marginRight: "2rem" }} />
          </Box>
          <IconButton
            onClick={() => setOpen(!open)}
            sx={{
              position: open ? "absolute" : "relative",
              right: open ? "8px" : "auto",
              top: open ? "8px" : "auto",
              margin: !open ? "auto" : 0,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}>
            {open ? (
              <MenuIcon
                sx={{
                  background: "rgba(255, 140, 0,1)",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "2rem",
                  p: 0.5,
                  boxShadow: "0 2px 10px rgba(255, 140, 0, 0.4)",
                }}
              />
            ) : (
              <ArrowForwardIosIcon
                sx={{
                  background: "rgba(255, 140, 0,1)",
                  borderRadius: "50%",
                  fontSize: "2rem",
                  p: 1,
                  color: "white",
                  boxShadow: "0 2px 10px rgba(255, 140, 0, 0.4)",
                }}
              />
            )}
          </IconButton>
        </DrawerHeader>

        {/* menu list */}
        <List sx={{ padding: "1rem" }}>
          {SELLER_MENU_ITEMS.map(item => {
            const { text, icon: Icon, path, subMenu } = item;
            const active = isActiveRoute(path);
            const hasSubMenu = subMenu && subMenu.length > 0;
            const isSubMenuOpen = subMenuOpen[text] || false;

            return (
              <React.Fragment key={text}>
                <ListItem disablePadding sx={{ display: "block", mb: hasSubMenu ? 0.5 : 1 }}>
                  <ListItemButton
                    onClick={() => {
                      if (hasSubMenu) {
                        handleSubMenuToggle(text);
                      } else {
                        router.push(path);
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      borderRadius: "24px",
                      overflow: "hidden",
                      letterSpacing: active ? 2 : 0,
                      fontWeight: "bold",
                      transition: "all 0.25s",
                      backgroundColor: active ? "rgba(96, 91, 255, 0.9)" : "transparent",
                      color: active ? "white" : "inherit",
                      boxShadow: active ? "0 4px 12px rgba(96, 91, 255, 0.4)" : "none",
                      "&:hover": {
                        backgroundColor: active ? "rgba(96, 91, 255, 0.9)" : "rgba(96, 91, 255, 0.6)",
                        color: "white",
                        letterSpacing: 1.5,
                        boxShadow: "0 4px 12px rgba(96, 91, 255, 0.4)",
                      },
                    }}>
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 1 : "auto",
                        justifyContent: "center",
                        color: "inherit",
                        transition: "all 0.2s",
                      }}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      sx={{
                        opacity: open ? 1 : 0,
                        ".MuiTypography-root": {
                          fontWeight: 600,
                        },
                      }}
                    />
                    {hasSubMenu && open && (isSubMenuOpen ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>

                {/* SubMenu items */}
                {hasSubMenu && (
                  <Collapse in={open && isSubMenuOpen} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding sx={{ pl: 2 }}>
                      {subMenu.map(subItem => {
                        const subActive = pathname.startsWith(subItem.path);
                        return (
                          <ListItemButton
                            key={subItem.text}
                            onClick={() => router.push(subItem.path)}
                            sx={{
                              pl: 4,
                              borderRadius: "24px",
                              mb: 0.5,
                              transition: "all 0.2s",
                              backgroundColor: subActive ? "rgba(255, 140, 0, 0.8)" : "transparent",
                              color: subActive ? "white" : "inherit",
                              boxShadow: subActive ? "0 2px 8px rgba(255, 140, 0, 0.3)" : "none",
                              "&:hover": {
                                backgroundColor: subActive ? "rgba(255, 140, 0, 0.8)" : "rgba(255, 140, 0, 0.5)",
                                color: "white",
                                boxShadow: "0 2px 8px rgba(255, 140, 0, 0.3)",
                              },
                            }}>
                            <ListItemIcon
                              sx={{
                                minWidth: 30,
                                color: "inherit",
                                fontSize: "0.9rem",
                              }}>
                              <subItem.icon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.text}
                              sx={{
                                ".MuiTypography-root": {
                                  fontSize: "0.95rem",
                                  fontWeight: subActive ? 600 : 500,
                                },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Drawer>
      <div>{children}</div>
    </Box>
  );
};

export default DashboardDrawer;
