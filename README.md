# UniFind — Campus Lost & Found + Item Exchange App

**UniFind** is a cross-platform mobile application built with **React Native** and **Expo** to help university students report, search, edit, bookmark, and claim lost, found, or exchangeable items across campus.

---

## 📱 Features Implemented

- **Campus Feed (`FlatList` + Empty States)**: Displays real-time Lost, Found, and Exchange item listings with category badges, location metadata, dates, thumbnail previews, and helpful `ListEmptyComponent` views when no items match or are saved.
- **Full CRUD Item Management (`Modal` + `ImagePicker`)**:
  - **Report Items**: Post new Lost, Found, or Exchange items with custom titles, locations, contact details, handover points, descriptions, and device gallery photos (`expo-image-picker`).
  - **Edit Reports**: Update any field, category, or attached photo of an existing report directly from the Item Details screen.
  - **Delete Reports**: Remove accidental or outdated reports with a native confirmation alert dialog (`Alert.alert`).
- **Real-Time Search, Filtering & Sorting**:
  - **Live Keyword Search**: Instant case-insensitive search bar filtering across item titles, locations, and descriptions with a one-tap clear button.
  - **Combined Filter & Sort Modal**: Filter by category (**All**, **Found**, **Lost**, **Exchange**) and sort results by **Time (Newest / Oldest First)** or **Name (A → Z / Z → A)**.
- **Tab + Nested Stack Navigation (`Expo Router`)**:
  - **Campus Feed Tab**: Contains a nested stack navigator for the main feed (`index.tsx`) and full item inspection (`details.tsx`).
  - **My Saved Items Tab (`saved.tsx`)**: Displays bookmarked and claimed items synced across the app with quick unbookmark actions.
- **Shared Global State (`React Context` + `useState`)**: Managed via `ItemsContext.tsx` (`addItem`, `updateItem`, `deleteItem`, `toggleSave`, `markAsClaimed`) so updates reflect immediately across the Feed, Details, and Saved screens.
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
│   │   ├── _layout.tsx      # Root Tab Navigator & ItemsProvider wrapper
│   │   ├── saved.tsx        # Saved & Claimed items screen with empty state
│   │   └── (feed)/
│   │       ├── _layout.tsx  # Nested Stack Navigator for Feed
│   │       ├── index.tsx    # FlatList feed, Search Bar, Filter/Sort & Report Modals
│   │       └── details.tsx  # Item details, Edit Modal, Delete, Bookmark & Claim actions
│   ├── context/
│   │   └── ItemsContext.tsx # Global shared state & CRUD actions
│   └── data/
│       └── mockItems.ts     # TypeScript interfaces & initial campus dataset
├── package.json
└── README.md