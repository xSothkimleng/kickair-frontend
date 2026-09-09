# MUI → Panda migration guide (kickair-frontend)

Goal: remove `@mui/*` and `@emotion/*` from the user-facing site while keeping every page
looking and behaving exactly as it does today. Restyling comes later; this pass is a faithful port.
Read this whole file before touching a page. HANDOFF.md → "Next: remove MUI from the user-facing
site" has the inventory and the running progress log.

## Ground rules

1. **No new MUI, anywhere.** A migrated file imports nothing from `@mui/*` or `@emotion/*`, and
   nothing from `@/theme` (`src/theme.ts` is deleted at the end). Search your file for `@mui`,
   `sx=`, `tokens.` when you think you are done.
2. **Preserve behaviour and business logic.** Only styling and component primitives change.
   Keep every handler, query, state, guard, aria attribute, test id, `data-*` and `id` as-is.
   `OrderRecord` stays the single order history (don't add parallel history UIs).
3. **Preserve the look.** Same spacing, radii, colours, font sizes, breakpoints, hover states.
   Map tokens 1:1 with the tables below. When MUI had a default you never overrode (button
   height 36.5px, `Typography body1` 16px/1.5, `Paper` white + 4px radius…), reproduce that default.
4. **Use the kit before writing CSS.** Order of preference: `@/components/ds` primitive →
   `@/components/ui/inputs` → Panda pattern from `styled-system/jsx` → `css()`/`cva()` from
   `styled-system/css` → Ark UI part styled with `css()`. Never inline `style={{}}` for static styles.
5. **Only touch the files in your assignment.** Shared files (`ds/index.ts`, `ui/inputs/*`,
   `globals.css`, `panda.config.ts`, `src/app/layout.tsx`) are off limits. If you need a new
   shared primitive, add a **new file** under `src/components/ds/` and import it by path
   (`@/components/ds/Thing`); the lead wires it into `ds/index.ts` afterwards.
6. **Don't run `next build`, `git stash`, `git checkout --`, `git commit`, or `npm run panda`.**
   The dev server on :3000 hot-reloads; Panda's PostCSS plugin picks up new `css()` calls with no
   codegen. Don't create or delete routes except a throwaway preview under `src/app/<name>-tmp/`
   (delete it before you finish; a `_`-prefixed folder 404s).
7. **React Compiler lint is on**: no `Date.now()`/`new Date()` in render (use a client-only
   `useSyncExternalStore` or compute in an effect/handler), no `setState` in effect bodies, no
   ref reads/writes during render. `eslint` must be clean for every file you touched.

## Imports

```ts
import { css, cva, cx } from "styled-system/css";
import { Box, Flex, Stack, HStack, VStack, Grid, Container, Center, Wrap, Spacer } from "styled-system/jsx";
import { Button, Text, Heading, Card, Badge, Indicator, Link, Modal, Menu, Tabs, Tooltip,
         IconButton, Spinner, Avatar, Alert, Divider, Skeleton, Progress, Pager, Drawer, Popover,
         toast, EmptyState, Loading, ErrorState, Rating, Accordion } from "@/components/ds";
import { TextInput, TextArea, SelectInput, MultiSelectInput, Checkbox, Switch, DatePicker,
         FileUpload, SearchInput, CurrencyInput, SegmentedControl, FieldShell, FieldLabel } from "@/components/ui/inputs";
import { Search, X, ChevronDown /* … */ } from "lucide-react";
```

Panda JSX patterns take style props with the same tokens as `css()`:
`<Flex align="center" justify="space-between" gap="12px" wrap="wrap">`, `<Stack gap="16px">`,
`<Grid columns={{ base: 1, md: 3 }} gap="16px">`, `<Container maxW="1200px" px="24px">`.
For anything else use `<div className={css({...})}>`. Hoist static `css()` calls to module scope.

## Component mapping

| MUI | Replacement |
|---|---|
| `Box` | `Box` from `styled-system/jsx` or `<div className={css()}>` |
| `Stack direction="row"` / column | `HStack` / `VStack` / `Stack` (`gap` in px) |
| `Grid container/item` | `Grid` / `GridItem` from `styled-system/jsx` or `css({ display:"grid", gridTemplateColumns })` |
| `Container maxWidth="lg"` | `Container maxW="1200px"` (`md`→900px, `sm`→600px, `xl`→1536px) |
| `Typography` | `Text` / `Heading` from ds (see typography table), or `css()` on a `p`/`span`/`h*` |
| `Paper` | `Card` (`elevated` for `elevation>0`, `padding="none"` when you set padding yourself) |
| `Card`/`CardContent` | `Card` |
| `Button variant="contained"` | `Button variant="solid"`; `outlined`→`outline`; `text`→`text`/`ghost`; `color="error"`→`variant="danger"`; sizes `small`→`sm`, default→`md`, `large`→`lg` |
| `Button startIcon/endIcon` | put the lucide icon as a child before/after the label (Button is flex with gap) |
| `LoadingButton` / `disabled + CircularProgress` | `Button disabled` with `<Spinner size={16} />` as first child |
| `IconButton` | `IconButton` (always `aria-label`) |
| `Fab` | `Button` positioned fixed via `css()` |
| `CircularProgress` | `Spinner size={n}`; centred loading blocks → `Loading` |
| `LinearProgress` | `Progress value={n}` |
| `Skeleton` | `Skeleton variant="text|rect|circle" width height` |
| `Avatar` | `Avatar name src size|px` |
| `Chip` | `Badge tone=…` (`outline` for `variant="outlined"`); deletable → `fieldChip` + `fieldChipRemove` from `@/components/ui/inputs` |
| `Badge badgeContent` | `Indicator count={n}` / `Indicator dot` |
| `Alert severity` | `Alert tone="info|success|warning|error"` (`AlertTitle`→`title` prop) |
| `Snackbar` | `toast.success("…")` etc. (`AppToaster` is mounted once in the root layout) |
| `Divider` | `Divider` (`children` for a labelled "or" divider) |
| `Dialog`+`DialogTitle`+`DialogContent`+`DialogActions` | `Modal open onOpenChange title footer size` (body = children) |
| `Drawer` | `Drawer open onOpenChange side size` |
| `Menu`+`MenuItem` | `Menu trigger items` (or `MenuPrimitive` parts) |
| `Popover` | `Popover trigger` (or `PopoverPrimitive`) |
| `Tabs`+`Tab` | `Tabs tabs value onValueChange` (or `TabsPrimitive`) |
| `Tooltip` | `Tooltip content` |
| `Accordion` | `Accordion items` |
| `Pagination` | `Pager count page onChange` |
| `Rating` | `Rating value` |
| `ToggleButtonGroup` | `SegmentedControl` |
| `Collapse` | Ark `Collapsible` from `@ark-ui/react` styled with `css()`; or conditional render when no animation was noticeable |
| `TextField`/`Select`/`Checkbox`/`Switch`/`Autocomplete` (raw MUI) | the matching `@/components/ui/inputs` component |
| `InputBase`/`ButtonBase` | plain `input`/`button` + `css()` (`fieldRoot`/`fieldControl` recipes are exported from `@/components/ui/inputs`) |
| `useMediaQuery(theme.breakpoints.down("md"))` | responsive style props (`display: { base: "none", md: "flex" }`); if JS is truly needed, `window.matchMedia("(max-width: 767px)")` via `useSyncExternalStore` |
| `useTheme`, `SxProps`, `Theme` types | delete; props that accepted `sx` now accept `className?: string` |
| `@mui/icons-material/*` | the nearest `lucide-react` icon, `size={16|18|20|24}` (MUI `fontSize="small"`=20, `inherit`=1em, default=24). Common: `Close`→`X`, `Search`, `ArrowBack`→`ArrowLeft`, `KeyboardArrowDown`/`ExpandMore`→`ChevronDown`, `MoreVert`→`MoreVertical`/`EllipsisVertical`, `CheckCircle`→`CheckCircle2`, `Error`/`ErrorOutline`→`AlertCircle`, `Warning`→`AlertTriangle`, `Info`→`Info`, `Delete`→`Trash2`, `Edit`→`Pencil`, `Add`→`Plus`, `Star`, `Visibility`→`Eye`, `AttachFile`→`Paperclip`, `Notifications`→`Bell`, `ChatBubbleOutline`→`MessageCircle`, `AccountBalanceWallet`→`Wallet`, `Person`→`User`, `Logout`→`LogOut`, `Settings`, `Menu`, `CloudUpload`, `InsertDriveFile`→`FileText`, `CalendarToday`→`Calendar`, `Schedule`/`AccessTime`→`Clock`, `LocationOn`→`MapPin`, `Language`→`Globe`, `Link`, `Work`→`Briefcase`, `School`→`GraduationCap`, `WorkspacePremium`→`Award`, `Verified`→`BadgeCheck`, `Lock`, `Payments`/`Paid`→`BadgeDollarSign`/`CircleDollarSign`, `LocalShipping`→`Truck`, `Inventory2`→`Package`, `Replay`→`RotateCcw`, `Cancel`→`XCircle`, `Block`→`Ban`, `Description`→`FileText`, `Balance`→`Scale`, `Flag`, `Handshake`, `RequestQuote`→`FileSignature`/`Receipt`, `HowToReg`→`UserCheck`, `MoveToInbox`→`Inbox` |

## `sx` → Panda

Panda style props are the same CSS property names (camelCase) plus the shorthands `p px py pt pr pb pl m mx my mt … w h minW maxW minH maxH bg`.
Values: **write px strings** (`p: "16px"`), not MUI spacing numbers — MUI `p: 2` = 16px, but Panda `p: "2"` = 8px. Quick table: MUI `0.5`→4px, `1`→8px, `1.5`→12px, `2`→16px, `2.5`→20px, `3`→24px, `4`→32px, `5`→40px, `6`→48px, `8`→64px.
- `bgcolor` → `bg`; `borderRadius: 2` (MUI = 8px) → `borderRadius: "8px"`; `border: "1px solid X"` → `borderWidth/Style/Color` **or** the `border` shorthand with a full value string; `boxShadow` unchanged; `typography` shorthands → explicit `fontSize/fontWeight/lineHeight`.
- Pseudo/nesting: `"&:hover"` → `_hover`; `"&:focus-visible"` → `_focusVisible`; `"&:disabled"` → `_disabled`; `"&::placeholder"` → `_placeholder`; `"& .child"` works as-is; a selector key must **start or end with `&`** (`"[data-state=open] > &"` ok; nest `"& svg"` inside it rather than `"[x] > & svg"`).
- Responsive: `{ xs: a, sm: b, md: c, lg: d }` → `{ base: a, sm: b, md: c, lg: d }` (Panda breakpoints 640/768/1024/1280 vs MUI 600/900/1200 — accept the nearest).
- `display: { xs: "none", md: "block" }` etc. port directly.
- `theme.palette.*`, `primary.main` → tokens below. `"text.secondary"` → `muted`/`ink2` depending on the page palette (see tokens).
- `component="span"` → just render that element. `noWrap` → `truncate` on `Text` / `whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"`.
- With Panda `preflight` still off: buttons/inputs you hand-roll need `fontFamily: "inherit"`, `border: "none"`/explicit borders, `bg`, `cursor`, `p: 0`; `box-sizing` is global. `globals.css` zeroes margins on `p, h1–h6, ul` and sets `a { color: inherit }` **outside any layer**, so those beat utilities: put padding/margins on a wrapping `div`, and use `!important` for link colours (`color: "var(--colors-accent) !important"`) or the ds `Link`.
- Ark parts that hide via the `hidden` attribute need `"&[hidden]": { display: "none" }` if your class sets `display`.

## Tokens (panda.config.ts) — map 1:1, don't invent colours

Two palettes exist today and both are in Panda. Keep whichever the file used.

**Slate palette** (`@/components/ui/inputs` `tokens`, most dashboards/auth/forms):
`heading #0F172A` · `body #334155` · `muted #64748B` · `placeholder #94A3B8` · `border #E2E8F0` · `borderStrong #CBD5E1` · `field #FFF` · `fill #F1F5F9` · `page #F5F5F7` · `accent #0071e3` · `accentHover` · `accentFill` · `success` `successText` `successTint` · `warning #f59e0b` · `pending` `pendingText` `pendingTint` · `error` `errorText` `errorTint`.

**Ink palette** (`@/theme` `tokens`, payment/orders/custom-orders/messages "Apple-ish" pages):
| `tokens.` (theme.ts) | Panda token |
|---|---|
| `text` | `ink` (#000) |
| `text2` | `ink2` (rgba(0,0,0,.6)) |
| `text3` | `ink3` (rgba(0,0,0,.4)) |
| `border` | `hairline` (rgba(0,0,0,.08)) |
| `borderStrong` | `hairlineStrong` (rgba(0,0,0,.14)) |
| `surface` / `surface2` / `canvas` | `surface` / `surface2` / `canvas` |
| `accent`, `accentHover`, `accentFill` | same names |
| `accentRgb` (used as `rgba(${accentRgb},0.1)`) | write the literal `rgba(0,113,227,0.1)` |
| `success*`, `pending*`, `error*` | same names |
| `brand` | `brand` |
| `abaNavy` `abaNavy2` `abaBlue` `abaBg` | `aba.navy` `aba.navy2` `aba.blue` `aba.bg` |
| `radius.card 16` / `cardSm 12` / `tile 10` / `input 10` / `pill 999` | `borderRadius: "card" / "cardSm" / "tile" / "input" / "pill"` |
| `mono` | `fontFamily: "mono"` |
| `logoRadius` | literal `"50%"` |

Other radii: MUI `borderRadius: 1`=4px, `2`=8px, `3`=12px, `4`=16px → px strings. Shadows: keep literal strings. Fonts: the site font is inherited from `body`; never set `fontFamily` except `mono`/`inherit`.

## Typography

| MUI variant (default) | Text props |
|---|---|
| `h4` 34px/700 | `Heading size="3xl"` (32px) |
| `h5` 24px/700 | `Heading size="2xl"` (26px) or `css({ fontSize: "24px", fontWeight: 700 })` |
| `h6` 20px/600 | `Heading size="xl" weight="semibold"` |
| `subtitle1` 16px/500 | `Text size="md" weight="medium"` |
| `subtitle2` 14px/600 | `Text size="sm" weight="semibold"` (13px) or fontSize 14px |
| `body1` 16px | `Text size="md"` (15px) — use `css({ fontSize: "16px" })` when the 1px matters |
| `body2` 14px | `css({ fontSize: "14px", lineHeight: 1.43 })` |
| `caption` 12px | `Text size="xs"` |
| `overline` | `Text size="xs"` + `textTransform: "uppercase", letterSpacing: ".06em"` |
Most Typography in this codebase sets explicit `fontSize`/`fontWeight`/`color` in `sx` — just port those literally onto `Text` (`className`) or a `p`/`span`.

## Verification (every file, before you report)

```bash
cd /Users/kimleng/Projects/kickair/kickair-frontend
npx tsc --noEmit                       # whole project must stay clean
npx eslint <every file you touched>    # must be clean
grep -n "@mui\|@/theme\|sx=" <files>   # must be empty
curl -s -o /dev/null -w "%{http_code}\n" -L http://localhost:3000/<route>   # 200, and the HTML has no "Failed to compile"
```
Screenshots (headless Chrome, no Playwright needed):
```bash
S=/private/tmp/claude-502/-Users-kimleng-Projects-kickair/547eff48-32f5-484f-9554-2f0e84fc037c/scratchpad
node $S/shot.cjs $S/shots/after/<name>.png "http://localhost:3000/<route>" [--as client|freelancer] --full
```
`--as client` = Bob (user 4, also a freelancer); `--as freelancer` = John (user 2). Baselines for
every route are in `$S/shots/before/<name>.png` (same names: `sign-in`, `explore`, `service-3`,
`checkout-3`, `find-freelancer`, `freelancer-2`, `settings`, `notifications`, `client-dash`,
`client-orders`, `client-service`, `client-profile`, `client-messages`, `order-8`, `order-9`,
`custom-order-6`, `kyc`, `fl-dash`, `fl-orders`, `fl-services`, `fl-finance`, `fl-profile`,
`fl-proposals`, `fl-messages`, `fl-order-9`, `fl-order-8`, `fl-custom-6`, `fl-kyc`, `home`,
`sign-up`, `forgot`, `reset`, `jobs`, `email-verified`). Compare before/after with the Read tool
and fix visible regressions (spacing, colours, missing icons, overflow). `<name>.png.console.log`
lists page errors — new hydration or runtime errors are regressions. For interactions (menus,
modals, popovers, form submits) drive the page over CDP: see `$S/cdp_slice3.cjs` for a working
pattern (`Input.dispatchMouseEvent` / `insertText`, `scrollIntoView({behavior:"instant"})`).

Report: files changed, anything you could not port 1:1 and why, what you verified (routes,
screenshots compared, interactions exercised), and any new ds primitive you added by path.
