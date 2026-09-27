# Engineering Notes Platform - UX Design & Workflow Guide

## 1. Understanding Engineering Student Needs

### Pain Points:
- Multiple branches (CSE, ECE, Mechanical, Civil, etc.)
- Semester-wise course load
- Mix of theory and practical (labs, projects)
- Different note types needed
- Collaboration on group projects
- Exam preparation resources

### Opportunities:
- Organize by Year + Semester
- Tag by Subject + Branch
- Categorize by Note Type (Textbook, Handwritten, Lectures, Labs, Projects)
- Quick access to past exam papers
- Study schedule integration

---

## 2. Information Architecture

### 2.1 Main Navigation Structure

```
Dashboard (Personalized)
├── My Courses
├── My Notes & Uploads
├── Saved Collections
└── Study Groups

Browse (Discovery)
├── By Year
│   ├── Year 1
│   ├── Year 2
│   ├── Year 3
│   └── Year 4
├── By Branch
│   ├── CSE
│   ├── ECE
│   ├── Mechanical
│   ├── Civil
│   └── Other
├── By Subject
│   └── (Dynamic based on selection)
└── By Note Type (see Section 3)

My Profile
├── Contributions
├── Saved Collections
├── Study Groups
├── Settings
└── Achievements/Badges
```

---

## 3. Note Categorization System

### 3.1 Two Simple Note Types

#### 📖 Textbook Notes
- **What:** Organized notes and summaries from textbooks
- **Icon:** Book icon
- **Color Tag:** Blue (#3B82F6)
- **Best For:** 
  - Structured learning
  - Complete topic coverage
  - Reference material
  - Foundational concepts
- **Upload Info Required:**
  - Textbook name and edition
  - Chapter/topic number
  - Topics covered
  - Difficulty level (Beginner/Intermediate/Advanced)

#### ✍️ Handwritten Notes
- **What:** Personal handwritten notes, lecture notes, quick summaries, diagrams
- **Icon:** Pen/pencil icon
- **Color Tag:** Orange (#F97316)
- **Best For:**
  - Quick reference
  - Personal study style
  - Visual learning (diagrams, annotations)
  - Classroom notes
  - Rushed preparation
- **Upload Info Required:**
  - When written (date or semester)
  - Professor/instructor name (if from class)
  - Subject/topic
  - Handwriting quality note (legible, organized, detailed)

---

## 4. User Flow: Registration & Onboarding

### Step 1: Initial Sign-Up
```
Sign Up Page
├── College Email (mandatory - for verification)
├── Password
└── Agree to Terms
     ↓
Email Verification
     ↓
```

### Step 2: Profile Setup (Key Step for UX!)
```
Choose Your Details
├── Branch Selection (Radio buttons)
│   ├── Computer Science & Engineering
│   ├── Electronics & Communication
│   ├── Mechanical Engineering
│   ├── Civil Engineering
│   └── Other
│
├── Current Year (Radio buttons)
│   ├── 1st Year
│   ├── 2nd Year
│   ├── 3rd Year
│   └── 4th Year
│
├── Your College (Dropdown/Autocomplete)
│
└── [Optional] Your Subjects of Interest (Multi-select)
    ├── Programming & DSA
    ├── Data Science
    ├── Database Management
    ├── Web Development
    └── etc...
     ↓
Personalized Dashboard
```

---

## 5. Dashboard (Personalized Home Page)

### Layout Structure:

```
┌─────────────────────────────────────────────────────┐
│  Welcome Back, [Student Name]!    [Profile Icon]   │
│  Year: 3 | Branch: CSE | College: [Name]           │
└─────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────┐
│  Quick Actions   │  Your Current Courses            │
│  (Sidebar)       │  ┌────────┬────────┬────────┐   │
│  ├─ Upload Notes │  │Course 1│Course 2│Course 3│   │
│  ├─ New Collect  │  │  DSA   │  OOP   │Database│   │
│  ├─ Join Group   │  └────────┴────────┴────────┘   │
│  └─ Browse       │  [View All Courses]              │
└──────────────────┤                                  │
                   │  Your Recent Activity            │
                   │  • Downloaded DSA Notes (2h ago) │
                   │  • Uploaded Lab Manual (1d ago)  │
                   │  • Joined Study Group (3d ago)   │
                   └──────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Recommended Notes For You                           │
│  Based on Year: 3 | Branch: CSE                     │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │Database │  │Networks │  │Security │             │
│  │Handwritten│ │Textbook │  │Lecture  │             │
│  │⭐4.8    │  │⭐4.5    │  │⭐4.3    │             │
│  │234 views│  │120 views│  │89 views │             │
│  └─────────┘  └─────────┘  └─────────┘             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Upcoming Exams (from calendar sync)                │
│  • End Semester: 15 days away                       │
│  • Lab Exam: 8 days away                            │
└──────────────────────────────────────────────────────┘
```

---

## 6. Browse & Filter Interface

### 6.1 Smart Filtering (Hero Section)

```
┌──────────────────────────────────────────────────────┐
│  Find Notes Quickly                                  │
│                                                      │
│  Filter By:                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ Year        │  │ Branch      │  │ Subject    │  │
│  │ ▼ 3rd Year  │  │ ▼ CSE       │  │ ▼ Database │  │
│  │ - 1st Year  │  │ - ECE       │  │ - DSA      │  │
│  │ - 2nd Year  │  │ - Mech      │  │ - Network  │  │
│  │ - 3rd Year  │  │ - Civil     │  │ - OS       │  │
│  │ - 4th Year  │  │ - Other     │  │ - Web Dev  │  │
│  └─────────────┘  └─────────────┘  └────────────┘  │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ Note Type   │  │ Sort By     │                  │
│  │ ▼ All Types │  │ ▼ Relevance │                  │
│  │ ✓ Textbook  │  │ - Rating    │                  │
│  │ ✓ Handwrite │  │ - Downloads │                  │
│  │             │  │ - Newest    │                  │
│  │             │  │ - Oldest    │                  │
│  │             │  │ - Views     │                  │
│  │             │  └─────────────┘                  │
│  └─────────────┘                                   │
│                                                      │
│  [Search box: Search by subject, course code, etc...] │
│  [Clear Filters]  [Apply] ✓                        │
└──────────────────────────────────────────────────────┘
```

### 6.2 Filter Behavior

**Sticky Sidebar (Left Panel):**
- Remains visible while scrolling
- Shows selected filters clearly
- Quick toggle checkboxes
- "Clear All" button

**Results Section (Main):**
- Grid or list view toggle
- Pagination or infinite scroll
- Card preview showing:
  - Note type icon + color
  - Title
  - Subject/Course
  - Rating (stars)
  - Upload date
  - View/Download count
  - Uploader name (student)

---

## 7. Year & Semester Based Organization

### 7.1 Year-Wise Curriculum View

```
┌─────────────────────────────────────────────────────┐
│  Select Your Academic Year                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1st YEAR                                           │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Semester 1   │  │ Semester 2   │               │
│  │ • Maths 1    │  │ • Maths 2    │               │
│  │ • Physics    │  │ • Chemistry  │               │
│  │ • C Program  │  │ • C++ / Java │               │
│  │ • Chem Lab   │  │ • Physics Lab│               │
│  └──────────────┘  └──────────────┘               │
│                                                      │
│  2nd YEAR                                           │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Semester 3   │  │ Semester 4   │               │
│  │ • DSA        │  │ • Database   │               │
│  │ • OOP        │  │ • Networks   │               │
│  │ • Digital Log│  │ • Microproc  │               │
│  │ • Logic Lab  │  │ • Micro Lab  │               │
│  └──────────────┘  └──────────────┘               │
│                                                      │
│  3rd YEAR (Current: Semester 5)                    │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Semester 5   │  │ Semester 6   │               │
│  │ • DBMS       │  │ • Security   │               │
│  │ • OS         │  │ • Web Tech   │               │
│  │ • CN         │  │ • Big Data   │               │
│  │ • SE         │  │ • AI/ML      │               │
│  └──────────────┘  └──────────────┘               │
│                                                      │
│  4th YEAR                                           │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Semester 7   │  │ Semester 8   │               │
│  │ • Electives  │  │ • Electives  │               │
│  │ • Project    │  │ • Project    │               │
│  │ • Internship │  │ • Capstone   │               │
│  └──────────────┘  └──────────────┘               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Click on a Course/Semester:
```
Subject: DATA STRUCTURES & ALGORITHMS (DSA)
Code: CS201 | Year: 2 | Semester: 3

┌──────────────────────────────────────────────┐
│  Filter by Note Type:                         │
│  □ All (15)  ✓ Textbook (4)  □ Handwritten(6)│
│  □ Lectures (3)  □ Labs (1)  □ PYPs (2)     │
│  □ Solutions (3)  □ Projects (0)             │
└──────────────────────────────────────────────┘

Results:
┌─────────────────────────────────────────────┐
│ 1. Data Structures - Theory & Notes         │
│    📖 Textbook | ⭐4.8 (234 ratings)        │
│    By: John Doe | 2.5MB | 1.2k downloads   │
│    "Complete DSA fundamentals from Cormen"  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 2. DSA Lecture Notes - Sem 3 2024           │
│    ✍️ Handwritten | ⭐4.5 (89 ratings)      │
│    By: Prof. Singh | 3.8MB | 456 downloads │
│    "Clean handwritten notes with examples"  │
└─────────────────────────────────────────────┘

[Load More Notes...]
```

---

## 8. Upload Workflow (Optimized for Engineers)

### Step-by-Step Upload Flow:

```
Step 1: Select Note Type (Simple Choice)
┌──────────────────────────────────────────┐
│                                          │
│  ┌──────────────────┐  ┌──────────────┐ │
│  │  📖 TEXTBOOK     │  │  ✍️ HANDWRIT │ │
│  │     NOTES        │  │   NOTES      │ │
│  │                  │  │              │ │
│  │  From textbooks, │  │ Class notes, │ │
│  │  organized &     │  │ handwritten, │ │
│  │  structured      │  │ & quick jots │ │
│  └──────────────────┘  └──────────────┘ │
│                                          │
└──────────────────────────────────────────┘

Step 2: Choose Upload Method
┌─────────────────────────────────────┐
│ [Drag & Drop Area]                  │
│ Drop files here or click to browse   │
│ Supported: PDF, DOCX, JPEG, PNG, ZIP│
│ Max size: 100MB                     │
└─────────────────────────────────────┘

Step 3: Fill Details (Auto-filled where possible)
┌──────────────────────────────────────┐
│ Note Title *                         │
│ [Enter descriptive title...]         │
│                                      │
│ Select Your Year *                  │
│ ▼ 3rd Year                           │
│                                      │
│ Select Your Branch *                │
│ ▼ Computer Science & Engineering    │
│                                      │
│ Select Semester *                   │
│ ▼ Semester 5 (Current)               │
│                                      │
│ Select Subject/Course *             │
│ ▼ [Search & Select]                  │
│  • Data Structures                  │
│  • Database Systems                 │
│  • Operating Systems                │
│  • Networks                         │
│                                      │
│ Add Tags (Optional)                 │
│ [Enter tags...] + Add               │
│ Suggested: DSA, Algorithm, Trees    │
│                                      │
│ Difficulty Level *                  │
│ ○ Beginner  ○ Intermediate  ○ Advanced│
│                                      │
│ Description (Optional)               │
│ [Detailed description...]           │
│ Include key topics covered, tips    │
│                                      │
│ Additional Info (Based on Type):    │
│                                      │
│ [For Textbook Notes]                │
│ Textbook Name: [Enter]              │
│ Edition: [Enter]                    │
│ Chapters Covered: [Enter]           │
│                                      │
│ [For Handwritten Notes]             │
│ Handwriting Quality: [Select]       │
│ ○ Legible & Organized              │
│ ○ Legible & Scattered              │
│ ○ Difficult to read                │
│ Date/Semester: [Enter]              │
│ Professor (if from class): [Optional]│
│                                      │
│ Visibility *                         │
│ ○ Public (Everyone can see)         │
│ ○ Private (Only you)                │
│ ○ College Only (Your college)       │
│ ○ Branch Only (Your branch)         │
│                                      │
│ [Preview]  [Save as Draft] [Publish]│
└──────────────────────────────────────┘

Step 4: Review & Publish
┌──────────────────────────────────────┐
│ Review your note details before      │
│ publishing. You can edit later.      │
│                                      │
│ [Edit]  [Cancel]  [Publish] ✓      │
└──────────────────────────────────────┘

Success!
┌──────────────────────────────────────┐
│ ✓ Note published successfully!       │
│ Your note is now visible to others.  │
│                                      │
│ 📊 Note Link: [Copy Link]            │
│ 📈 Track Stats: [View Analytics]     │
│ 📝 Edit Details: [Edit]              │
│ 📤 Upload Another: [New Upload]      │
└──────────────────────────────────────┘
```

---

## 9. Search & Smart Discovery

### 9.1 Smart Search Features

```
Search Box (Prominent Placement)
┌─────────────────────────────────────┐
│ 🔍 [Search notes, subjects, code...]│
└─────────────────────────────────────┘

As user types:
- Instant search suggestions:
  • Course codes (CS201, CS301)
  • Subject names (DSA, DBMS)
  • Popular topics (Trees, Algorithms)
  • Popular uploaders

Advanced Search:
[Search Icon] → Opens Advanced Search Panel

─── Filters ───
Course: [Autocomplete]
Subject: [Multi-select]
Year: [Checkboxes]
Semester: [Checkboxes]
Note Type: [Checkboxes]
Rating: [⭐ 4+] [3+] [All]
Date: [Last 7 days] [Month] [Year] [All]
Uploaded By: [Search user]
Has Solutions: Yes / No / Both
Language: English / Hindi / Both

[Search] [Clear Filters] [Save Search]
```

### 9.2 Recommended Notes Algorithm

**Show in Dashboard:**
1. Notes from your selected courses (this semester)
2. Notes from your year + branch (trending)
3. Popular notes in your skill level
4. Notes similar to what you saved before
5. Notes by highly-rated uploaders

---

## 10. Note Card Design (Visual Hierarchy)

### Grid View Card:

```
┌──────────────────────────────────┐
│  [Thumbnail Preview]             │
│                                  │
│  📖 TEXTBOOK                      │
│  Database Systems Fundamentals   │
│                                  │
│  Computer Science | 3rd Year     │
│  Database Systems (CS301)        │
│                                  │
│  ⭐ 4.8 (234 reviews)            │
│  👤 By: Jane Smith | 2 days ago  │
│                                  │
│  📥 4.2k Downloads | 👁️ 12.5k views│
│                                  │
│  [Add to Collection] [Download ↓]│
└──────────────────────────────────┘
```

### List View Card:

```
┌────────────────────────────────────────────────┐
│ 📖 Database Systems Fundamentals              │
│ By: Jane Smith | 2 days ago | 4.8 ⭐         │
│ CSE | Year: 3 | Semester: 5 | CS301          │
│ "Complete database design notes with examples"│
│ 📥 4.2k | 👁️ 12.5k | 2.3MB | Add | Download  │
└────────────────────────────────────────────────┘
```

---

## 11. Study Group & Collaboration Features

### 11.1 Create Study Groups

```
Start a Study Group
┌──────────────────────────────────────┐
│ Group Name: [Enter]                 │
│ Example: "DSA Prep Group - Batch24"  │
│                                      │
│ Subject: [Select]                   │
│ • Database Systems                  │
│ • Data Structures                   │
│                                      │
│ Year: [Select]                      │
│ • 3rd Year                           │
│                                      │
│ Purpose: [Select Multiple]          │
│ ✓ Exam Preparation                  │
│ ✓ Assignment Help                   │
│ □ Project Collaboration             │
│ ✓ Resource Sharing                  │
│                                      │
│ Group Size: [Select]                │
│ • Small (5-15 members)              │
│ • Medium (15-30 members)            │
│ • Large (30+ members)               │
│                                      │
│ Privacy: [Select]                   │
│ ○ Public (Anyone can join)          │
│ ○ Private (Invite only)             │
│                                      │
│ Description: [Optional]              │
│ [Create Group]                      │
└──────────────────────────────────────┘

Group Page Layout:
┌─────────────────────────────────────┐
│ 🎓 DSA Prep Group - Batch24         │
│ 👥 24 members | 👑 You're admin     │
│                                      │
│ 📌 Pinned Resources:                 │
│ • Complete DSA Roadmap (Textbook)   │
│ • All PYPs DSA (2020-2024)          │
│ • Solved Examples - Trees           │
│                                      │
│ 💬 Recent Activity:                  │
│ • Alice shared: "Sorting Algorithms"│
│ • Bob uploaded: "DSA Lab Manual"    │
│ • Carol commented: "Thanks! Helpful"│
│                                      │
│ 📁 Shared Resources (45 items)      │
│ 🗨️ Discussions (128 active)         │
│ 📝 Assignments (12 pending)         │
│ 📅 Study Schedule (5 upcoming)      │
└─────────────────────────────────────┘
```

---

## 12. Study Collections & Favorites

Students can organize notes by creating collections for different subjects or exam prep:

```
┌──────────────────────────────────────┐
│  📚 MY COLLECTIONS                   │
│  Organize notes by subject            │
└──────────────────────────────────────┘

Your Collections:
┌─────────────────────────────────────┐
│ 📖 Database Systems                  │
│ 12 items (8 Textbook, 4 Handwritten) │
│ Last updated: 2 days ago             │
│ [Open]                               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📖 Data Structures & Algorithms      │
│ 18 items (6 Textbook, 12 Handwritten)│
│ Last updated: 5 days ago             │
│ [Open]                               │
└─────────────────────────────────────┘

[Create New Collection]
```

Collections help students:
- Organize notes by subject/semester
- Prepare for exams with curated resources
- Share with study groups
- Track learning progress
- Quick access to frequently used materials

---

## 14. User Profile & Contributions

### 14.1 Student Profile Page

```
┌───────────────────────────────────────┐
│  👤 STUDENT PROFILE                   │
├───────────────────────────────────────┤
│                                       │
│  Name: Raj Kumar                      │
│  Year: 3 | Branch: CSE                │
│  College: IIIT Hyderabad              │
│  Joined: 6 months ago                 │
│                                       │
│  ✨ Badges:                           │
│  • Helpful Contributor (50+ upvotes) │
│  • Top Uploader (25+ notes)           │
│  • Lab Expert (Labs rated 4.5+)       │
│  • Quick Learner (3+ years resources) │
│                                       │
│  📊 Contributions:                    │
│  • 28 notes uploaded                  │
│  • 4,234 total downloads              │
│  • 2,156 total views                  │
│  • Avg rating: 4.7 ⭐                │
│                                       │
│  📌 Recent Uploads:                   │
│  1. Network Security Notes (5 days)   │
│  2. OS Scheduling Algorithms (12 days)│
│  3. Web Dev Basics - HTML/CSS (18 days│
│                                       │
│  🎖️ Rating: 4.7 ⭐ (328 raters)      │
│  Subjects: Networks, Security, Web    │
│                                       │
│  [Follow] [Message] [View All Notes]  │
└───────────────────────────────────────┘
```

---

## 15. Mobile-Friendly Workflow

### 15.1 Mobile Navigation (Bottom Tab Bar)

```
┌─────────────────────────────────────┐
│          Dashboard                  │
│  [Dashboard]   [Browse]  [Upload]  │
│   [Messages]   [Profile]            │
└─────────────────────────────────────┘

Mobile-Specific Features:
- Swipeable note cards
- Collapse/expand filters
- One-click download
- Bottom sheet for quick actions
- Compact card layout
- Hamburger menu for secondary options
```

---

## 16. Notification & Engagement

### What to Notify (Non-Intrusive):

✓ Someone rated your note (only milestone: 100th rating)
✓ Study group member shared important resource
✓ Exam reminder: "End sem in 7 days"
✓ New notes uploaded in your subscribed subjects
✓ Someone follows you (less frequently)

❌ Every single comment/like (overwhelming)

### Notification Preferences in Settings:
- Email: Daily digest / Weekly digest / None
- In-app: Enable / Disable
- Push: Enable / Disable
- Smart timing: Set quiet hours

---

## 17. Workflow Example: A Day in Student's Life

### Morning:
1. Open app → Dashboard shows current semester courses
2. Scrolls to "Database Systems" → 15 textbook notes available
3. Opens a comprehensive textbook summary
4. Downloads PDF for offline studying
5. Adds to personal "Database" collection

### Afternoon:
1. Search → "DBMS Handwritten Notes"
2. Finds well-organized handwritten notes from a top contributor
3. Reads the notes → really clear with diagrams
4. Rates 5 stars and comments "Thanks! This helped!"
5. Adds to personal collection
6. Shares with study group

### Evening:
1. Takes handwritten notes during class
2. Scans/photographs notes using phone
3. Uploads to platform (< 2 minutes)
4. Adds title, marks as "Handwritten"
5. Study group notifies others to check new resource
6. Gets 30+ views and 10 downloads by next morning

### Late Night:
1. Searching for textbook reference on complex topic
2. Finds structured textbook notes with examples
3. Downloads and bookmarks for exam prep
4. Follows the uploader (top contributor)
5. Checks their other textbook notes

---

## 18. Key UX Principles for Your Platform

### ✅ DO THIS:

1. **Auto-Categorize:** Detect if it's handwritten vs printed
2. **Smart Defaults:** Pre-select user's current year/semester
3. **Progressive Disclosure:** Don't show all options at once
4. **Clear Call-to-Action:** One primary action per page
5. **Consistent Icons:** Same icon = same type always
6. **Fast Loading:** Optimize images and lazy load
7. **Mobile First:** Design for phone first, then desktop
8. **Accessibility:** Good contrast, readable fonts
9. **Undo-able Actions:** Can recover deleted items
10. **Empty States:** Friendly message when no results

### ❌ AVOID:

1. ❌ Too many ads or popups
2. ❌ Confusing category names
3. ❌ No search results feedback
4. ❌ Difficult registration process
5. ❌ Slow downloads
6. ❌ Forced login to preview
7. ❌ No way to go back
8. ❌ Information overload
9. ❌ Inconsistent design
10. ❌ No error messages (silent failures)

---

## 19. Success Metrics for UX

| Metric | Target | How to Track |
|--------|--------|--------------|
| First-time upload completion | 85% | Track drop-offs in upload form |
| Search result relevance | 4.5/5 rating | Post-search survey |
| Mobile usability | 90% success | Mobile session analytics |
| Time to find resource | < 2 min | User behavior analytics |
| Note categorization accuracy | 95% | Manual review + ML model |
| Dashboard engagement | 60% daily click | Session tracking |
| Study group participation | 40% of users | Active member tracking |
| Repeat user rate | 50% Week 1, 70% Month 1 | Cohort analysis |

---

## 20. Implementation Priority

### Phase 1: MVP (Weeks 1-4)
- [ ] Customized onboarding (year, branch)
- [ ] Basic year-wise filtering
- [ ] Note type tags (visual, colors)
- [ ] Dashboard with quick access
- [ ] Simple upload with note-type selection

### Phase 2: Smart Features (Weeks 5-8)
- [ ] Advanced filtering (year + semester + type)
- [ ] Curriculum view (organized by year/semester)
- [ ] Collections feature (save and organize notes)
- [ ] Recommendation algorithm
- [ ] Advanced search with full-text

### Phase 3: Engagement (Weeks 9-12)
- [ ] Study groups
- [ ] Full notification system
- [ ] Advanced analytics (per uploader)
- [ ] Exam prep checklist
- [ ] Mobile app

### Phase 3+: Polish
- [ ] AI auto-categorization
- [ ] Collaborative study tools
- [ ] Calendar integration
- [ ] Spaced repetition system

---

## 21. Design Tokens (For Consistent UI)

### Color Coding by Note Type:
```css
--textbook-color: #3B82F6 (Blue)
--handwritten-color: #F97316 (Orange)
```

### Typography:
```css
--heading-font: 'Inter' or 'Poppins' (headings)
--body-font: 'Roboto' (content)
--mono-font: 'Courier New' (code)
```

### Spacing Scale:
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

---

## Final Thoughts

The key to better UX for engineering students is:
1. **Relevance:** Show what they actually need (year-wise, semester-wise)
2. **Clarity:** Clear categorization (2 simple note types with visual cues)
3. **Speed:** Quick upload, quick search, quick access
4. **Community:** Enable sharing and collaboration
5. **Organization:** Collections to organize notes by subject/exam
6. **Personalization:** Learn their preferences and adapt

Test with real engineering students early and often. Small details (icon colors, filter order, default sorting) make huge difference in user satisfaction!

---

**Document Version:** 1.0 | **Updated:** September 2026
