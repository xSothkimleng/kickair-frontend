# Payment method logos

Fixed-size (44×44) placeholder marks for the ABA PayWay payment surfaces.

These are clean **stand-ins** so the payment flow is complete and demoable. Before
the ABA UI-flow review / go-live, replace each file with ABA PayWay's **official**
logo exported from their Figma asset pack (same filename, same square viewBox).

Slots are rendered by `PayLogo` (`src/components/payment/PayLogo.tsx`); the slot
shape (round vs square) is controlled by `tokens.logoRadius` in `src/theme.ts`.

| File           | Method        |
| -------------- | ------------- |
| `khqr.svg`     | ABA KHQR      |
| `visa.svg`     | Visa          |
| `mc.svg`       | Mastercard    |
| `unionpay.svg` | UnionPay      |
| `jcb.svg`      | JCB           |
| `alipay.svg`   | Alipay        |
| `wechat.svg`   | WeChat Pay    |
