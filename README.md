# PGI SmartCampus (Prasad Group of Institutions, Jaunpur)

A modern, responsive React + TypeScript institutional management application for **Prasad Group of Institutions (PGI), Jaunpur, Uttar Pradesh**. Featuring unified management workspaces, student grievance portal, role-based scoping, and an authentic college photography background system.

---

## 📸 Authentic College Photographs Background

The website displays authentic campus photographs of Prasad Group of Institutions, Jaunpur as a full-screen responsive background (`background-size: cover; background-position: center;`).

- **30% Photo Visibility / 70% White Overlay**: A separate overlay layer (`.campus-overlay-layer`) applies a 70% white filter (`--background-overlay-opacity: 0.70;`), keeping the campus photograph visible at ~30% for depth while ensuring all cards, text, tables, and buttons remain ultra-sharp, readable, and opaque.
- **Dedicated Independent Layers**: Background and overlay layers use `position: fixed; inset: 0; pointer-events: none;` with negative `z-index` so they never interfere with forms, clicks, or scrolling.
- **Campus View Selector**: Switch between 5 campus photography views anytime from the **Campus Photo** dropdown in the top bar.

### Where to Place Your College Photographs:
Place your authentic photos in either folder:
- **`assets/college-photos/`** (Root assets)
- **`public/assets/college-photos/`** (Vite public static folder)

### Supported Filenames:
| Filename | Description |
| :--- | :--- |
| **`pgi_main_campus_building.jpg`** | Authentic photograph of Main Academic Entrance & Facade (Primary background) |
| **`pgi_academic_block.jpg`** | PIT Engineering & Technology Academic Block / Classrooms |
| **`pgi_library_hall.jpg`** | PGI Central Library & Knowledge Resource Centre |
| **`pgi_laboratories.jpg`** | Computer Science & Engineering Laboratories |
| **`pgi_green_campus.jpg`** | Lush Green Campus Grounds & Sports Ground |

*Note: Clean architectural SVG placeholders are included out of the box so the site never shows a broken image. When you drop in any of the `.jpg` files above, the application will automatically detect and display your actual photograph!*

---

## 🏛 Portals & Features

1. **Management Workspace (9 Permitted Scopes)**:
   - Central Authority: Chairman, Registrar, CMO (group-wide view across PIT, PIT Pharmacy, PPJ, PPJ Pharmacy).
   - Institution Leadership: Director (PIT), Principal (PIT).
   - Examination Cell: Schedules, results, and marks.
   - Department: HOD (PIT · CSE).
   - Class: Coordinator (PIT · CSE-A · 3rd Year).
   - Hostel: Warden (PIT Hostel).

2. **Complete Student Portal**:
   - Personalized Student Dashboard (Institute, Department, Class, Student ID).
   - "Raise a Complaint" Form (10 categories, location, priority, description, photo attachment).
   - "My Complaints" Page with live 4-stage status stepper (`Submitted` → `Assigned` → `In Progress` → `Resolved`).
   - Management Remarks display and post-resolution 5-star student satisfaction feedback.
   - Demo student profile switcher (Aarav Singh, Ananya Verma, Rohan Yadav, Simran Gupta, Vivek Kumar).

3. **Grievance Administration (`Manage ↗`)**:
   - Management staff can review student complaints, assign teams (*Facilities, IT Support, Plumbing, Electrical, etc.*), and publish official remarks.

---

## 🚀 How to Run the Website

### Method 1: Using Vite Development Server (Recommended)
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start dev server
npm run dev
# The website will be live on http://localhost:3000
```

### Method 2: In VS Code using Live Server
1. In VS Code, run `npm run build` in the terminal to generate the production build in `/dist`.
2. Right-click on `index.html` (or `dist/index.html` after build) and select **"Open with Live Server"**.
3. Or for instant preview without building:
   ```bash
   npm run preview
   ```
