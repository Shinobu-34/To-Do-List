# Task-Do

Task-Do is a premium, local-first to-do list web application designed to help you stay organized with style. It features a modern, responsive interface with beautiful custom components, smooth animations, and dark mode support.

## 🚀 Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Utility-first, dark mode, custom animations)
- **Icons:** Lucide React
- **State Management:** React Context / standard hooks (`useState`, `useMemo`, `useCallback`)
- **Data Persistence:** Browser `localStorage` (Local-first, no backend required)

## ✨ Features

- **Task Lifecycle (CRUD):**
  - Quick-add tasks inline or expand for more options (description, date, priority, category).
  - Tasks are smartly grouped into Overdue, Today, and Later.
  - Inline editing support with Save/Cancel.
  - Checkbox toggle with strike-through and opacity transitions.
  - Deleting tasks shows a toast notification with an **Undo** action.
- **Advanced Filtering & Sorting:**
  - **Sidebar Filters:** View All, Today, Upcoming, or Completed tasks. Real-time counts are displayed.
  - **Category Filters:** Dynamically generated from your tasks (e.g., Work, Personal, Fitness).
  - **Search:** Real-time text filtering across task titles and descriptions.
  - **Sorting:** Toggle between sorting by Due Date (ascending) and Priority (High → Low).
- **Custom UI Components (Premium Aesthetic):**
  - **Custom Select Dropdowns:** Replaces native `<select>` for Priorities and Categories with fully accessible, animated, dark-mode-compatible floating panels featuring colored indicators.
  - **Custom Date Picker:** A beautiful, bespoke calendar popover for selecting due dates, highlighting 'Today' and the selected date.
  - **Empty States:** Beautiful vector illustrations and encouraging messages when no tasks match the current view.
  - **Theme Toggle:** Switch between Light and Dark mode seamlessly.
- **Hydration Safe:** Safely loads `localStorage` state on the client side to avoid SSR mismatch issues (if adapted to Next.js).

## 🛠️ How to Run Locally

1. **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. **Open Terminal:** Open your preferred terminal (PowerShell, Command Prompt, etc.).
3. **Navigate to Project:**
   ```bash
   cd "c:\Projects\To-Do list"
   ```
4. **Install Dependencies:**
   ```bash
   npm install
   ```
   *(Note: You can also just double-click the `install.bat` file in the project folder to install dependencies).*
5. **Start Development Server:**
   ```bash
   npm run dev
   ```
6. **Open in Browser:** Navigate to `http://localhost:5173` (or the URL provided in your terminal).

## 📝 Function Updates & Changelog

*(This section tracks significant function changes and refactors as per request)*

- **Initial Setup:** Implemented core CRUD loop (`addTask`, `toggleTask`, `deleteTask`, `updateTask`) in `App.tsx` using `useCallback` and `useState`.
- **Derived State:** Added `useMemo` hooks in `App.tsx` for `visibleTasks`, `groupedTasks`, `categories`, and `filterCounts` for optimized rendering.
- **Component Refactor:** Replaced native HTML `<select>` and `<input type="date">` in `TaskForm` and `TaskItem` with bespoke `CustomSelect` and `CustomDatePicker` components for a premium look.

---
*Stay organized, stay vibing.*
---

&copy; 2026 Shinobu-34. All Rights Reserved
