# EMBER UI/UX and Navigation Improvement Plan

**Date:** 2026-07-31  
**Status:** Proposed  
**Scope:** Customer-facing website, pickup ordering flow, and demo staff queue  
**Goal:** Preserve EMBER's editorial coffee-house identity while making every important task obvious, predictable, accessible, and difficult to misuse.

## 1. Executive summary

The site has a distinctive visual identity: warm neutral colors, oversized editorial typography, cinematic imagery, and a restrained premium tone. The main UX problem is not the theme. It is that the experience prioritizes atmosphere over orientation and task completion.

The most serious issues are:

1. **Mobile navigation is effectively missing.** All desktop navigation links are hidden below the mobile breakpoint, and no menu replaces them. Only the wordmark and “Order ahead” remain.
2. **The primary ordering route begins in the wrong place.** “Order ahead” links directly to `/order`, including when the cart is empty, instead of helping the customer choose items first.
3. **The homepage delays practical information and conversion.** The cinematic story is long, while menu, location, opening hours, pickup expectations, and popular items are not surfaced early.
4. **Menu and checkout do not clearly communicate state or progress.** There is no global cart indicator, category navigation, checkout step context, pickup location, or prominent pre-submit order review.
5. **Several labels do not match their destinations.** Footer links such as “Instagram,” “Cafés,” and “Stockists” all open an email composer. “Journal” is an image-gallery anchor. This damages trust.
6. **Mobile touch targets are too small.** Observed controls include 29px-high “Add” buttons and roughly 23px quantity buttons.
7. **The staff demo exposes implementation details.** The demo staff key appears as the password-field placeholder, and the queue lacks enough guidance and operational feedback.

The recommended approach is an incremental redesign, not a rebrand. Keep the color palette, type pairing, imagery, animation character, and editorial composition. Introduce a clear information architecture, a dependable responsive header, stronger action hierarchy, an explicit cart and checkout journey, and consistent interaction rules.

## 2. Audit scope and evidence

The analysis covered:

- Source structure and route behavior
- Desktop and 390 × 844 mobile browser testing
- Homepage, menu, checkout, and staff-order routes
- Navigation, link destinations, form order, touch targets, and responsive behavior
- Current cart and backend integration points

### Measured observations

| Area | Observation | Impact |
|---|---|---|
| Mobile header | Desktop links are `display: none`; no drawer or menu button appears | Customers cannot reach Menu, About, Contact, or homepage sections from the header |
| Mobile “Order ahead” | Approximately 106 × 30px with 8px text | Small target and weak readability |
| Menu “Add” | Approximately 50 × 29px with 10px text | Below the recommended 44px touch height |
| Checkout quantity controls | Approximately 23 × 23px | High mis-tap risk and poor accessibility |
| Checkout layout | Order summary starts below the customer form on mobile | Customers enter details before verifying items and total |
| Staff refresh | Approximately 82 × 29px | Small touch target |
| Footer destinations | Multiple semantically different labels point to the same `mailto:` URL | Unexpected behavior and reduced credibility |
| Page width | No horizontal overflow at 390px in sampled routes | Existing responsive width containment should be retained |

## 3. Experience principles

Every implementation decision should follow these principles:

1. **One obvious next action.** Each screen must have a visually dominant action appropriate to its state.
2. **Never send users into a dead end.** Empty carts, unavailable API states, invalid forms, and missing content need a useful recovery action.
3. **Navigation must be available everywhere.** Mobile and desktop users should have equivalent access to core destinations.
4. **Labels must predict results.** A label must accurately describe the destination or action.
5. **Show state before requesting commitment.** Cart contents, total, pickup terms, and location must be visible before order submission.
6. **Recognition over recall.** Display categories, progress, cart count, status meanings, and pickup details instead of expecting users to remember them.
7. **Brand expression supports the task.** Animation and editorial layouts remain, but never obstruct navigation, reading, or ordering.

## 4. Target information architecture

### Primary customer journey

```text
Home → Menu → Cart review → Pickup details → Confirmation/status
```

### Secondary content journey

```text
Home → Our story / Coffee / Visit / Contact
```

### Staff journey

```text
Staff access → Queue → Order detail → Status update
```

### Recommended global navigation

- Menu
- Our coffee
- Our story
- Visit
- Contact
- Primary action: **Order pickup**
- Cart indicator: item count and subtotal when the cart is non-empty

“Journal” should only remain if an actual journal page or article list exists. Otherwise, rename the gallery link to “Gallery.” “Cafés” and “Stockists” should only appear when those destinations have real content.

## 5. Prioritized findings and remedies

### P0 — Task-blocking

#### 5.1 Restore complete mobile navigation

Current behavior hides all navigation links without providing an alternative.

Implement:

- A 44 × 44px menu button with a visible text or accessible label
- A slide-over or full-screen mobile navigation panel
- Focus trapping, Escape-to-close, outside-click close, and body scroll lock
- Clear close button
- Current-route indicator
- Cart count inside the menu and/or header
- Automatic close after selecting a destination

#### 5.2 Correct the ordering entry point

The global “Order ahead” link should lead to `/menu`, not directly to an empty checkout. When the cart has items, the global cart control may lead to `/order`.

Implement these rules:

- Empty cart: “Order pickup” → `/menu`
- Non-empty cart: cart button → `/order`, showing count and subtotal
- Direct visit to `/order` with an empty cart: show a purposeful empty state with “Browse the menu”
- Prevent order submission when the cart is empty

### P1 — High-impact comprehension and conversion

#### 5.3 Establish a clear homepage decision point

Keep the cinematic opening, but ensure useful actions are visible immediately after or over the hero:

- Primary: “Order pickup”
- Secondary: “View menu”
- Practical utility row: location, today’s hours, estimated pickup time
- A short “How pickup works” sequence
- Popular-items preview with prices and direct menu links

The loader should not delay interaction longer than necessary. Provide reduced-motion behavior and a visible skip path for the long-form story.

#### 5.4 Make the header task-aware

Desktop and mobile headers should:

- Use readable navigation text, not 8px labels
- Show the active destination
- Keep the primary ordering action visually distinct
- Change the action to a cart summary after the first item is added
- Remain accessible on long pages without obscuring content
- Link the wordmark reliably to `/`

#### 5.5 Rebuild menu wayfinding

Replace the long undifferentiated list with:

- Clear title: “Order for pickup”
- Pickup location, open/closed state, and preparation estimate
- Sticky category chips or jump links
- Optional “Popular” section at the top
- Consistent product rows/cards with name, description, price, and a descriptive add action
- 44px minimum Add buttons
- Immediate add confirmation through quantity change and an `aria-live` message
- Persistent mobile cart bar with count and subtotal
- Desktop sticky cart summary or prominent cart control
- Disabled or hidden checkout action until the cart contains an item

If product customization is not supported in the demo, say so through concise item descriptions rather than implying a missing configuration screen.

#### 5.6 Make checkout a guided review

Recommended mobile order:

1. Back to menu
2. “Your pickup order” summary
3. Item editing
4. Pickup location and timing
5. Contact details
6. Payment-at-counter notice
7. Place order

Implement:

- A compact step indicator: **Menu → Details → Confirmed**
- Visible required-field indicators
- `autocomplete="name"` and `autocomplete="tel"`
- `type="tel"` and mobile-appropriate input mode for phone
- Inline validation attached to the affected field
- Clear pickup location/address and preparation expectation
- Explicit “Pay at pickup” callout near the submit button
- 44px quantity controls and an explicit Remove action
- Submit loading state that prevents duplicate orders
- Recovery copy for API/network errors
- Removal of the duplicated arrow in the submit button’s accessible name

#### 5.7 Replace misleading links

Audit every link by label and destination:

- Instagram → real Instagram URL or remove it
- Cafés → real location page/section or rename
- Stockists → real stockist content or remove
- Contact → email is acceptable, but label it clearly
- Wholesale → dedicated inquiry page or “Email wholesale”
- Journal → actual journal or rename to Gallery

No placeholder link should masquerade as a completed feature in a client demo.

### P2 — Operational clarity and refinement

#### 5.8 Improve confirmation and order status

After submission, show:

- Clear success state
- Order number
- Items and total
- Pickup location and selected time
- Payment-at-counter reminder
- Status timeline: Received → Preparing → Ready → Completed
- “Order another” and “Back home” actions
- Status refresh that updates in place rather than feeling like a full-page restart

#### 5.9 Clarify the demo staff queue

The staff interface should feel like an intentional demo tool:

- Replace the exposed key placeholder with neutral text such as “Enter staff access key”
- Add a short demo-access note outside the password field only if the client presentation requires it
- Separate authentication from queue controls
- Show loading, authenticated, unauthorized, empty, and API-offline states distinctly
- Use status tabs with counts
- Show order number, customer, pickup time, elapsed time, item count, and total at a glance
- Make the next valid status action visually dominant
- Confirm destructive/final transitions such as Completed when appropriate
- Use 44px controls and responsive cards
- Keep `/staff/orders` out of public customer navigation

## 6. Visual-system evolution

The existing brand should remain recognizable. The redesign should retain:

- Warm cream, espresso, rust, and charcoal palette
- Display serif plus functional sans-serif pairing
- Editorial photography and generous whitespace
- Subtle line work, grain, and restrained motion
- Premium, direct copy tone

Add a functional UI layer:

### Typography

- Body text: minimum 16px on mobile
- Navigation/actions: minimum 14px, with reduced letter spacing
- Supporting labels: minimum 12px where non-essential
- Preserve oversized display headings, but cap them to prevent awkward wrapping

### Spacing and sizing

- Define 4, 8, 12, 16, 24, 32, 48, and 64px spacing tokens
- Minimum interactive target: 44 × 44px
- Consistent control heights and border radii
- Use page-width and content-width containers consistently

### Components

Create documented variants for:

- Primary, secondary, quiet, and destructive buttons
- Text links and external links
- Inputs, selects, errors, help text, and disabled states
- Cards, pills/category chips, banners, empty states, and status badges
- Header, mobile drawer, cart indicator, sticky cart bar, breadcrumb, and step indicator

### Interaction

- Visible keyboard focus on every interactive element
- Clear hover, pressed, disabled, loading, success, and error states
- Motion should explain state changes, not decorate every transition
- Respect `prefers-reduced-motion`

## 7. Accessibility requirements

Target WCAG 2.2 AA for the demo:

- Keyboard access to all navigation, cart, form, and staff controls
- Logical heading hierarchy and landmark structure
- Working skip link to main content
- Active navigation conveyed visually and semantically
- 4.5:1 text contrast where required
- 44px target size for primary touch interactions
- Form errors announced and associated with fields
- Cart additions announced through `aria-live`
- Mobile drawer focus trap and focus return
- Status changes announced without stealing focus
- Images have purposeful alternative text; decorative images use empty alt text
- No information communicated by color alone
- Reduced-motion version of the cinematic homepage

## 8. Component and file implementation map

| File/area | Planned responsibility |
|---|---|
| `components/Nav.tsx` | Responsive header, active state, correct ordering destination, cart indicator |
| New `components/navigation/MobileNav.tsx` | Accessible drawer and mobile destination list |
| New `components/cart/CartIndicator.tsx` | Shared count/subtotal action |
| New `components/cart/StickyCartBar.tsx` | Mobile persistent checkout affordance |
| `components/Footer.tsx` | Truthful destinations, simplified structure, contact clarity |
| `app/page.tsx` | Early decision point, practical café information, popular menu preview |
| `components/SiteScripts.tsx` | Reduce/remove fragile global DOM scripting; preserve only justified progressive enhancement |
| `app/menu/page.tsx` | Menu metadata and route-level layout |
| `components/menu/MenuClient.tsx` | Category navigation, item feedback, cart state, empty-state prevention |
| `app/order/page.tsx` | Checkout metadata and guided page shell |
| `components/order/CheckoutClient.tsx` | Summary-first mobile flow, validation, accessibility, loading/error handling |
| `components/staff/OrderQueue.tsx` | Access state, queue filters, order hierarchy, clear status actions |
| `lib/cart.ts` | Observable cart state usable by header/menu/checkout; persistence safeguards |
| `app/globals.css` | Tokens, responsive rules, accessible controls; split into feature styles if practical |

The current highly compressed component and stylesheet formatting should be normalized as files are touched. This is not visual work, but it reduces regression risk and makes later client revisions faster.

## 9. Delivery phases

### Phase 0 — Content and route truth

**Size: S**

- Confirm café name, address, hours, pickup timing, phone/email, and real social URLs
- Decide which currently implied pages are real for the demo
- Remove or rename unsupported links
- Define canonical labels used across navigation and CTAs

**Exit condition:** Every visible link and operational claim has a real, accurate destination or value.

### Phase 1 — Navigation and global orientation

**Size: M**

- Implement responsive header and accessible mobile drawer
- Add active-route state
- Correct ordering route logic
- Add global cart indicator
- Improve typography and target sizing
- Add consistent page titles, back links, and route context

**Exit condition:** A user can reach Menu, Home, Visit, and Contact from every public route on desktop and mobile.

### Phase 2 — Menu and cart

**Size: M**

- Add pickup context and category navigation
- Improve product action hierarchy
- Add responsive sticky cart summary
- Add feedback after item changes
- Prevent empty-cart checkout
- Test cart persistence and API menu fallback behavior

**Exit condition:** A first-time mobile user can select an item and understand how to continue without instruction.

### Phase 3 — Checkout, confirmation, and status

**Size: M**

- Reorder checkout for review-first behavior
- Add pickup/payment context
- Improve form semantics and validation
- Add robust loading/error states
- Build a clear confirmation/status presentation

**Exit condition:** The customer sees and can edit the complete order before submitting, and understands exactly what happens next.

### Phase 4 — Staff demo workflow

**Size: S–M**

- Improve access-key handling
- Add queue states, filters/counts, and stronger order-card hierarchy
- Clarify status transitions and refresh behavior
- Verify on tablet and mobile

**Exit condition:** A presenter can authenticate, locate an order, and advance its status without explaining the interface.

### Phase 5 — Accessibility, responsive QA, and polish

**Size: M**

- Keyboard and screen-reader pass
- Contrast and touch-target audit
- Reduced-motion pass
- Responsive testing at 320, 375, 390, 768, 1024, and 1440px
- Browser testing in current Chrome, Safari, Firefox, and Edge
- Performance check for homepage media and loader
- Final copy consistency review

**Exit condition:** All acceptance criteria below pass and no P0/P1 usability defect remains.

## 10. Measurable acceptance criteria

### Navigation

- All primary destinations are reachable from the header at 320px and above.
- Menu is reachable in one action from every public route.
- The current page is identifiable without relying only on color.
- Opening and closing mobile navigation works by touch and keyboard.
- Focus returns to the menu button after the drawer closes.

### Ordering

- An empty-cart “Order pickup” action opens the menu.
- A non-empty cart is visible globally with item count.
- Checkout cannot submit zero items.
- Customers see items, quantities, total, pickup location, timing, and payment method before submission.
- All primary and quantity controls are at least 44 × 44px or have an equivalent target area.
- Duplicate submissions are prevented during network requests.

### Content and trust

- No visible link has a misleading destination.
- Location, hours, pickup estimate, and contact method use one consistent source of truth.
- Unsupported demo features are removed rather than represented by placeholders.

### Accessibility and responsiveness

- No horizontal page overflow at 320px.
- Core flows are keyboard-completable.
- Visible focus indicators are present.
- Text and controls meet WCAG 2.2 AA contrast requirements.
- The homepage remains usable with reduced motion enabled.
- Automated accessibility checks report no critical violations; manual checks cover drawer focus, cart announcements, errors, and status updates.

### Demo reliability

- Menu API failure presents a controlled fallback or retry state.
- Order API failure preserves entered data and cart contents.
- Staff unauthorized and offline states are distinguishable.
- The complete customer-to-staff demo can be performed without refreshing the browser manually.

## 11. Validation plan

### Automated checks

- Existing frontend and backend test suites
- Unit tests for cart state and route-selection rules
- Component tests for mobile navigation and checkout validation
- End-to-end test: menu → add item → checkout → confirmation → staff status update
- Accessibility scan on `/`, `/menu`, `/order`, and `/staff/orders`
- Production build and lint/type checks

### Manual usability tasks

Test with participants who have not seen the project:

1. “Find an iced coffee and add one to a pickup order.”
2. “Change the quantity, verify the total, and place the order.”
3. “Find today’s opening hours and café contact details.”
4. “On a phone, return from checkout to the menu and add another item.”
5. Staff task: “Find the newest order and mark it ready.”

Success target: at least 4 of 5 participants complete each task without coaching, with no wrong-page dead end.

### Regression checklist

- Cart persists across route changes and reloads
- Header/cart state updates immediately
- Anchor links land below the sticky header
- Browser Back behavior remains predictable
- Footer destinations work
- Forms retain data after recoverable API errors
- Homepage media does not block navigation

## 12. Out of scope for this UX pass

- Full e-commerce payment processing
- Customer accounts or loyalty program
- Complex drink customization
- Multi-location inventory
- Production-grade staff identity management
- A content-management system
- Replacing the existing visual brand

These may be future roadmap items, but should not complicate the client demo.

## 13. Definition of done

The improvement is complete when:

- All P0 and P1 findings are resolved
- The primary customer and staff demo journeys pass end-to-end
- Mobile navigation has feature parity with desktop navigation
- The measurable acceptance criteria pass
- Visual changes remain recognizably EMBER
- No misleading placeholder destination remains
- Relevant tests, type checks, build, and accessibility checks pass
- A short demo script and known demo limitations are documented

