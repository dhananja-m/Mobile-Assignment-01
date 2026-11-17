# UniFind — Campus Lost & Found + Item Exchange App

**UniFind** is a cross-platform mobile application built with **React Native** and **Expo** to help university students report, track, bookmark, and claim lost, found, or exchangeable items across campus.

---

## 📱 Features Implemented

- **Campus Feed (`FlatList`)**: Displays real-time Lost, Found, and Exchange item listings with category badges, location metadata, dates, and thumbnail previews.
- **Report New Items (`Modal` + `ImagePicker`)**: Allows students to post new Lost, Found, or Exchange items with custom titles, locations, contact details, handover points, descriptions, and device gallery photos (`expo-image-picker`).
- **Category Filtering (`Modal`)**: Interactive filter modal to sort items by **All**, **Found**, **Lost**, or **Exchange**.
- **Tab + Nested Stack Navigation (`Expo Router`)**:
  - **Campus Feed Tab**: Contains a nested stack navigator for the main feed (`index.tsx`) and full item inspection (`details.tsx`).
  - **My Saved Items Tab (`saved.tsx`)**: Displays bookmarked and claimed items synced across the app.
- **Shared Global State (`React Context` + `useState`)**: Managed via `ItemsContext.tsx` so reporting, bookmarking, or marking an item as claimed updates the Feed, Details, and Saved screens simultaneously.
- **App Lifecycle Awareness (`AppState`)**: Monitors background-to-foreground app transitions and updates the board sync timestamp automatically upon resume.
- **Local Push Notifications (`expo-notifications`)**: Triggers immediate local notifications when a student posts a new campus item or marks an item as claimed.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: React Native (Expo SDK)
- **Routing**: Expo Router (`Tabs` & `Stack`)
- **Language**: TypeScript
- **State Management**: React Context API (`useState`, `useContext`)
- **Native Modules**:
  - `expo-notifications` (Local notifications)
  - `expo-image-picker` (Photo uploads from gallery)
  - `@expo/vector-icons` (`MaterialCommunityIcons` tab icons)

---

## 📂 Project Structure

```text
LostAndFound/
├── assets/
│   └── images/              # Default fallback app icons & assets
├── src/
│   ├── app/
│   │   ├── _layout.tsx      # Root Tab Navigator & ItemsProvider wrapper
│   │   ├── saved.tsx        # Saved & Claimed items screen
│   │   └── (feed)/
│   │       ├── _layout.tsx  # Nested Stack Navigator for Feed
│   │       ├── index.tsx    # Main FlatList feed, Filter Modal & Report Modal
│   │       └── details.tsx  # Full item details, bookmark & claim actions
│   ├── context/
│   │   └── ItemsContext.tsx # Global shared state & reducer actions
│   └── data/
│       └── mockItems.ts     # TypeScript interfaces & initial campus dataset
├── package.json
└── README.md