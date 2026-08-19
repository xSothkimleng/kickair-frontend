// KickAir design-system primitives (Panda CSS + Ark UI).
// The Panda-native replacement for the MUI component layer. Import branded
// primitives from here; import layout patterns (Box, Flex, Stack, Container,
// Grid, etc.) directly from "styled-system/jsx".
export { Button, button, type ButtonVariants } from "./Button";
export { Text, Heading, text, type TextVariants } from "./Text";
export { Card, card, type CardVariants } from "./Card";
export { Badge, badge, type BadgeVariants } from "./Badge";
export { Link, link, type LinkVariants } from "./Link";

// Interactive primitives (Ark UI + Panda) — client components. Convenience
// wrappers cover the common cases; the raw Ark namespaces (`*Primitive`) are
// exported for bespoke compositions.
export { Modal, Dialog, Portal, type ModalProps } from "./Dialog";
export { Menu, MenuPrimitive, type MenuItemDef, type MenuProps } from "./Menu";
export { Tabs, TabsPrimitive, type TabDef, type TabsProps } from "./Tabs";
export { Tooltip, TooltipPrimitive, type TooltipProps } from "./Tooltip";
