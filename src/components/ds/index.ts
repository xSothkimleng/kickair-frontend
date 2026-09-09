// KickAir design-system primitives (Panda CSS + Ark UI).
// The Panda-native replacement for the MUI component layer. Import branded
// primitives from here; import layout patterns (Box, Flex, Stack, Container,
// Grid, etc.) directly from "styled-system/jsx".
export { Button, button, type ButtonVariants } from "./Button";
export { Text, Heading, text, type TextVariants } from "./Text";
export { Card, card, type CardVariants } from "./Card";
export { Badge, badge, Indicator, type BadgeVariants } from "./Badge";
export { Link, link, type LinkVariants } from "./Link";

// Interactive primitives (Ark UI + Panda) — client components. Convenience
// wrappers cover the common cases; the raw Ark namespaces (`*Primitive`) are
// exported for bespoke compositions.
export { Modal, Dialog, Portal, type ModalProps } from "./Dialog";
export { Menu, MenuPrimitive, type MenuItemDef, type MenuProps } from "./Menu";
export { Tabs, TabsPrimitive, type TabDef, type TabsProps } from "./Tabs";
export { Tooltip, TooltipPrimitive, type TooltipProps } from "./Tooltip";

// Added for the MUI removal (2026-09-08). One-to-one replacements for the MUI
// components the site used; see MIGRATION-PANDA.md for the mapping table.
export { IconButton, iconButton, type IconButtonVariants } from "./IconButton";
export { Spinner } from "./Spinner";
export { Avatar, avatar, type AvatarProps } from "./Avatar";
export { Alert, alert, type AlertProps } from "./Alert";
export { Divider, divider } from "./Divider";
export { Skeleton, skeleton } from "./Skeleton";
export { Progress } from "./Progress";
export { Pager } from "./Pager";
export { Drawer, type DrawerProps } from "./Drawer";
export { Popover, PopoverPrimitive, popoverContent, type PopoverProps } from "./Popover";
export { AppToaster, toast, toaster, type ToastInput } from "./Toast";
export { EmptyState, Loading, ErrorState } from "./States";
export { Rating } from "./Rating";
export { Accordion, AccordionPrimitive, type AccordionItemDef } from "./Accordion";
