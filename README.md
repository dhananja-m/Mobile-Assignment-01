# UniFind — Campus Lost & Found + Item Exchange App

**UniFind** is a cross-platform mobile application built with **React Native** and **Expo** to help university students report, search, edit, bookmark, and claim lost, found, or exchangeable items across campus.

---

## 📱 Features Implemented

- **Home Dashboard (`src/app/(feed)/index.tsx`)**:
  - **Dynamic Hero Banner**: Displays a time-based greeting (*Good Morning / Afternoon / Evening*), campus portal badge, live board status indicator, and total reunited items counter.
  - **Live Campus Board Stats**: Real-time summary cards tracking active **Lost**, **Found**, and **Exchange** items.
  - **Quick Action Navigation**: Dedicated entry points to either **+ Report an Item** directly via modal or navigate to **View Campus Reports**.
- **Campus Feed (`FlatList` + Empty States in `feed.tsx`)**: Displays real-time Lost, Found, and Exchange item listings with category badges, location metadata, dates, thumbnail previews, and helpful `ListEmptyComponent` views when no items match or are saved.
- **Full CRUD Item Management (`Modal` + `ImagePicker`)**:
  - **Report Items**: Post new Lost, Found, or Exchange items from either the Home Dashboard or Campus Feed with custom titles, locations, contact details, handover points, descriptions, and device gallery photos (`expo-image-picker`).
  - **Edit Reports**: Update any field, category, or attached photo of an existing report directly from the Item Details screen.
  - **Delete Reports**: Remove accidental or outdated reports with a native confirmation alert dialog (`Alert.alert`).
- **Real-Time Search, Filtering & Sorting**:
  - **Live Keyword Search**: Instant case-insensitive search bar filtering across item titles, locations, and descriptions with a one-tap clear button.
  - **Combined Filter & Sort Modal**: Filter by category (**All**, **Found**, **Lost**, **Exchange**) and sort results by **Time (Newest / Oldest First)** or **Name (A → Z / Z → A)**.
- **Tab + Nested Stack Navigation (`Expo Router`)**:
  - **Home Tab (`(feed)`)**: Contains a nested stack navigator for the Home Dashboard (`index.tsx`), Campus Feed (`feed.tsx`), and full item inspection (`details.tsx`).
  - **My Saved Items Tab (`saved.tsx`)**: Displays bookmarked and claimed items synced across the app with quick unbookmark actions and an actionable empty state.
- **Shared Global State (`React Context` + `useState`)**: Managed via `ItemsContext.tsx` (`addItem`, `updateItem`, `deleteItem`, `toggleSave`, `markAsClaimed`) so updates reflect immediately across the Home, Feed, Details, and Saved screens.
- **App Lifecycle Awareness (`AppState`)**: Monitors background-to-foreground app transitions and updates the board sync timestamp automatically upon resume.
- **Local Push Notifications (`expo-notifications`)**: Triggers immediate local notifications when a student posts a new item, updates a report, or marks an item as claimed.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: React Native (Expo SDK)
- **Routing**: Expo Router (`Tabs` & `Stack`)
- **Language**: TypeScript
- **State Management**: React Context API (`useState`, `useContext`)
- **Native Modules**:
  - `expo-notifications` (Local notifications)
  - `expo-image-picker` (Photo uploads from gallery)
  - `@expo/vector-icons` (`MaterialCommunityIcons` UI & tab icons)

---

## 📂 Project Structure

```text
LostAndFound/
├── assets/
│   └── images/              # Default fallback app icons & assets
├── src/
│   ├── app/
│   │   ├── _layout.tsx      # Root Tab Navigator (Home & Saved) + ItemsProvider
│   │   ├── saved.tsx        # Saved & Claimed items screen with empty state
│   │   └── (feed)/
│   │       ├── _layout.tsx  # Nested Stack Navigator (Home, Feed, Details)
│   │       ├── index.tsx    # Home Dashboard, Live Stats & Quick Report Modal
│   │       ├── feed.tsx     # FlatList feed, Search Bar, Filter/Sort & Report Modals
│   │       └── details.tsx  # Item details, Edit Modal, Delete, Bookmark & Claim actions
│   ├── context/
│   │   └── ItemsContext.tsx # Global shared state & CRUD actions
│   └── data/
│       └── mockItems.ts     # TypeScript interfaces & initial campus dataset
├── package.json
└── README.md