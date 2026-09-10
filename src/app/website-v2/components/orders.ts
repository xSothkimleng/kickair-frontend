import type { RecordEvent } from "./OrderRecord";
import type { OrderStatus } from "../ui";

/**
 * One source of order data for both spaces.
 *
 * The list view and the detail page read the same records, so they cannot drift
 * into disagreeing about what happened on an order — which is the same reason
 * the history itself is a single component (see OrderRecord).
 */
export interface Order {
  id: string;
  title: string;
  /** The other side of the deal, whoever is looking. */
  counterparty: string;
  amount: number;
  status: OrderStatus;
  /** Short human line for the list row. */
  note: string;
  placed: string;
  due: string;
  delivery: number;
  revisionsUsed: number;
  revisionsIncluded: number;
  requirements: string;
  events: RecordEvent[];
}

export const CLIENT_ORDERS: Order[] = [
  {
    id: "KA-2841",
    title: "Brand identity & logo system",
    counterparty: "Sokha Chan",
    amount: 240,
    status: "delivered",
    note: "Delivered 2 hours ago",
    placed: "28 Apr 2026",
    due: "1 May 2026",
    delivery: 3,
    revisionsUsed: 1,
    revisionsIncluded: 2,
    requirements:
      "Modern wordmark for a coffee roastery. Needs to work small on packaging. Avoid literal coffee-bean imagery.",
    events: [
      { type: "created", title: "Order placed", when: "28 Apr", by: "You", note: "Brand identity & logo system · 3-day delivery" },
      { type: "accepted", title: "Accepted", when: "28 Apr", by: "Sokha Chan" },
      { type: "delivered", title: "Delivery", index: 1, when: "1 May", by: "Sokha Chan", note: "First concepts — three directions to choose from.", files: ["concepts-v1.pdf"] },
      { type: "revision_requested", title: "Revision requested", index: 1, when: "1 May", by: "You", note: "Direction 2, but try a heavier wordmark." },
      { type: "delivered", title: "Delivery", index: 2, when: "2 hours ago", by: "Sokha Chan", note: "Final logo files, all formats. Revisions from your notes are in.", files: ["logo-final.zip", "brand-guide.pdf"] },
    ],
  },
  {
    id: "KA-2836",
    title: "Product photography, 20 items",
    counterparty: "Vuthy Meas",
    amount: 200,
    status: "delivered",
    note: "Delivered yesterday",
    placed: "24 Apr 2026",
    due: "29 Apr 2026",
    delivery: 5,
    revisionsUsed: 0,
    revisionsIncluded: 1,
    requirements: "Twenty products on white. Two angles each, web-ready.",
    events: [
      { type: "created", title: "Order placed", when: "24 Apr", by: "You" },
      { type: "accepted", title: "Accepted", when: "24 Apr", by: "Vuthy Meas" },
      { type: "delivered", title: "Delivery", index: 1, when: "yesterday", by: "Vuthy Meas", note: "All 20 shot and retouched.", files: ["products-web.zip"] },
    ],
  },
  {
    id: "KA-2830",
    title: "Next.js marketing site",
    counterparty: "Dara Pich",
    amount: 340,
    status: "active",
    note: "Due in 4 days",
    placed: "1 May 2026",
    due: "8 May 2026",
    delivery: 7,
    revisionsUsed: 0,
    revisionsIncluded: 2,
    requirements: "Five pages, CMS-editable, deployed to our domain.",
    events: [
      { type: "created", title: "Order placed", when: "1 May", by: "You" },
      { type: "accepted", title: "Accepted", when: "1 May", by: "Dara Pich" },
    ],
  },
  {
    id: "KA-2822",
    title: "Khmer translation, 12 pages",
    counterparty: "Chantrea Ly",
    amount: 45,
    status: "revision_requested",
    note: "Revision sent Tuesday",
    placed: "20 Apr 2026",
    due: "22 Apr 2026",
    delivery: 2,
    revisionsUsed: 1,
    revisionsIncluded: 2,
    requirements: "Legal contract, Khmer to English. Formal register.",
    events: [
      { type: "created", title: "Order placed", when: "20 Apr", by: "You" },
      { type: "accepted", title: "Accepted", when: "20 Apr", by: "Chantrea Ly" },
      { type: "delivered", title: "Delivery", index: 1, when: "22 Apr", by: "Chantrea Ly", files: ["contract-en.docx"] },
      { type: "revision_requested", title: "Revision requested", index: 1, when: "Tuesday", by: "You", note: "Clause 4 reads oddly — can you check the original?" },
    ],
  },
  {
    id: "KA-2811",
    title: "Instagram ads, one month",
    counterparty: "Bopha Sok",
    amount: 80,
    status: "completed",
    note: "Completed 3 May",
    placed: "1 Apr 2026",
    due: "1 May 2026",
    delivery: 30,
    revisionsUsed: 0,
    revisionsIncluded: 1,
    requirements: "Manage and optimise a month of paid social.",
    events: [
      { type: "created", title: "Order placed", when: "1 Apr", by: "You" },
      { type: "accepted", title: "Accepted", when: "1 Apr", by: "Bopha Sok" },
      { type: "delivered", title: "Delivery", index: 1, when: "1 May", by: "Bopha Sok", files: ["report-april.pdf"] },
      { type: "released", title: "Payment released", when: "3 May", by: "You", note: "$80.00 released from escrow to Bopha Sok." },
      { type: "completed", title: "Order completed", when: "3 May" },
    ],
  },
];

export const FREELANCER_ORDERS: Order[] = [
  {
    id: "KA-2847",
    title: "Café menu design, 3 pages",
    counterparty: "Nita Sar",
    amount: 95,
    status: "pending",
    note: "Accept before Friday",
    placed: "9 May 2026",
    due: "14 May 2026",
    delivery: 5,
    revisionsUsed: 0,
    revisionsIncluded: 2,
    requirements: "Three-page menu, print-ready. Khmer and English side by side.",
    events: [{ type: "created", title: "Order placed", when: "9 May", by: "Nita Sar", note: "Café menu design · 5-day delivery" }],
  },
  {
    id: "KA-2843",
    title: "Logo refresh for a clinic",
    counterparty: "Panha Tep",
    amount: 180,
    status: "revision_requested",
    note: "Revision requested 2 May",
    placed: "28 Apr 2026",
    due: "3 May 2026",
    delivery: 5,
    revisionsUsed: 1,
    revisionsIncluded: 2,
    requirements: "Keep the cross, modernise the type. Must stay readable on signage.",
    events: [
      { type: "created", title: "Order placed", when: "28 Apr", by: "Panha Tep", note: "Logo refresh for a clinic · 5-day delivery" },
      { type: "accepted", title: "You accepted", when: "28 Apr", by: "You" },
      { type: "delivered", title: "Delivery", index: 1, when: "1 May", by: "You", note: "First pass — cleaner mark, two colourways.", files: ["clinic-v1.pdf"] },
      { type: "revision_requested", title: "Revision requested", index: 1, when: "2 May", by: "Panha Tep", note: "Closer to the original blue, please." },
    ],
  },
  {
    id: "KA-2815",
    title: "Packaging illustration set",
    counterparty: "Sreyna Kim",
    amount: 320,
    status: "delivered",
    note: "Waiting on client review",
    placed: "18 Apr 2026",
    due: "28 Apr 2026",
    delivery: 10,
    revisionsUsed: 0,
    revisionsIncluded: 2,
    requirements: "Six illustrations for a tea range, flat colour.",
    events: [
      { type: "created", title: "Order placed", when: "18 Apr", by: "Sreyna Kim" },
      { type: "accepted", title: "You accepted", when: "18 Apr", by: "You" },
      { type: "delivered", title: "Delivery", index: 1, when: "28 Apr", by: "You", note: "All six, plus source files.", files: ["tea-set.zip"] },
    ],
  },
  {
    id: "KA-2809",
    title: "Event poster, A2",
    counterparty: "Rithy Nou",
    amount: 60,
    status: "disputed",
    note: "Dispute #1 open",
    placed: "10 Apr 2026",
    due: "13 Apr 2026",
    delivery: 3,
    revisionsUsed: 2,
    revisionsIncluded: 2,
    requirements: "A2 poster for a music night. Supplied photography.",
    events: [
      { type: "created", title: "Order placed", when: "10 Apr", by: "Rithy Nou" },
      { type: "accepted", title: "You accepted", when: "10 Apr", by: "You" },
      { type: "delivered", title: "Delivery", index: 1, when: "13 Apr", by: "You", files: ["poster-a2.pdf"] },
      { type: "revision_requested", title: "Revision requested", index: 1, when: "14 Apr", by: "Rithy Nou" },
      { type: "delivered", title: "Delivery", index: 2, when: "15 Apr", by: "You", files: ["poster-a2-v2.pdf"] },
      { type: "dispute_opened", title: "Dispute opened", index: 1, when: "17 Apr", by: "Rithy Nou", note: "Says the supplied photo was not used as briefed." },
      { type: "evidence", title: "Evidence submitted", when: "17 Apr", by: "You", note: "Brief thread and the original file, showing the photo in place.", files: ["brief-thread.pdf"] },
    ],
  },
  {
    id: "KA-2802",
    title: "Brand identity & logo system",
    counterparty: "Nita Sar",
    amount: 240,
    status: "completed",
    note: "Paid 3 May",
    placed: "20 Mar 2026",
    due: "23 Mar 2026",
    delivery: 3,
    revisionsUsed: 1,
    revisionsIncluded: 2,
    requirements: "Wordmark for a coffee roastery.",
    events: [
      { type: "created", title: "Order placed", when: "20 Mar", by: "Nita Sar" },
      { type: "accepted", title: "You accepted", when: "20 Mar", by: "You" },
      { type: "delivered", title: "Delivery", index: 1, when: "23 Mar", by: "You", files: ["logo-final.zip"] },
      { type: "released", title: "Payment released", when: "3 May", by: "Nita Sar", note: "$240.00 released from escrow to you." },
      { type: "completed", title: "Order completed", when: "3 May" },
    ],
  },
];

export const findOrder = (role: "client" | "freelancer", id: string) =>
  (role === "client" ? CLIENT_ORDERS : FREELANCER_ORDERS).find((o) => o.id === id);
