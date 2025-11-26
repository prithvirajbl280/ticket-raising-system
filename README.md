🎫 Ticket Raising System - Full Stack Application
A modern, feature-rich ticketing system built with Kotlin + Spring Boot backend, Next.js frontend and Supabase Database designed for efficient customer support and issue tracking.

📸 Screenshots
🔐 Authentication Pages
Login Page

 Clean and modern login interface with gradient background





Signup Page
 
User-friendly registration form

👤 User Dashboard
User View
 Users can create and view their own tickets with search and filter capabilities

Create Ticket Form
 Intuitive ticket creation form with priority and category selection

Ticket Cards
 Beautiful ticket cards with color-coded status indicators







🎯 Ticket Detail Page
Ticket Overview
 Comprehensive ticket view with status badges, owner/assignee info, and description
Comments Section
 Real-time comment thread for collaboration

👨‍💼 Agent Dashboard
Agent View
 Agents see only tickets assigned to them with status update capabilities
Update Ticket Status And Comments
 Quick status updates for efficient ticket management


👑 Admin Dashboard
Admin View - All Tickets
 Complete overview of all tickets in the system
Assign Ticket to Agent
 Smart agent assignment based on workload




User Management
 Comprehensive user administration interface
Edit User Roles
 Flexible role management system

✨ Key Features
🎨 Beautiful UI/UX
Gradient backgrounds with animated floating blobs
Color-coded status indicators (Green: Open, Blue: In Progress, Yellow: Resolved, Gray: Closed)
Responsive design that works on all devices
Smooth animations and hover effects
Modern glassmorphism design elements
🔐 Authentication & Authorization
JWT-based authentication for secure sessions
Role-based access control (User, Agent, Admin)
Password encryption using BCrypt
Forgot password functionality (email disabled in current version)
🎫 Ticket Management
Create tickets with subject, description, priority, and category
Search tickets by subject or description
Filter tickets by status (Open, In Progress, Resolved, Closed)
Real-time status updates
Priority levels: Low, Medium, High, Urgent
Categories: Hardware, Software, Network, Other
💬 Communication
Comment system for ticket discussions
Real-time updates when comments are added
Author tracking for accountability
👥 User Management (Admin Only)
View all users in the system
Edit user roles dynamically
Delete users with confirmation
Role assignment: USER, AGENT, ADMIN
User statistics dashboard
🎯 Smart Agent Assignment (Admin Only)
Workload-based assignment - see active tickets per agent
Visual indicators for agent availability
One-click assignment to agents
📊 Dashboard Features
Role-specific views:
Users: See only their own tickets
Agents: See only assigned tickets
Admins: See all tickets in the system
Ticket count badges
Quick action buttons

🛠️ Technology Stack
Backend
Kotlin - Modern JVM language
Spring Boot 3.1.4 - Enterprise Java framework
Spring Security - Authentication & Authorization
Spring Data JPA - Database ORM
PostgreSQL - Relational database
JWT - JSON Web Tokens for authentication
Gradle - Build automation
Frontend
Next.js 13 - React framework
React 18 - UI library
Tailwind CSS - Utility-first CSS framework
Axios - HTTP client
JWT Decode - Token handling
DevOps & Deployment
Docker - Containerization
Railway - Backend hosting
Vercel - Frontend hosting (alternative)
Supabase - PostgreSQL database hosting

🚀 Quick Setup
Prerequisites
Java 17+
Node.js 16+
PostgreSQL database
Gradle (or use included wrapper)
Backend Setup
Clone the repository
git clone <repository-url>
cd ticketing-system/backend

Configure database Create a PostgreSQL database and update application.yml:
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ticketing_db
    username: your_username
    password: your_password

Run the backend
./gradlew bootRun

Backend will start on http://localhost:8080
Frontend Setup
Navigate to frontend directory
cd ../frontend

Install dependencies
npm install

Update API base URL Edit lib/api.js:
const API = axios.create({
  baseURL: "http://localhost:8080/api"  // Update this
});

Run the frontend
npm run dev

Frontend will start on http://localhost:3000

📁 Project Structure
ticketing-system/
├── backend/
│   ├── src/main/kotlin/com/ticketing/
│   │   ├── config/           # Security & JWT configuration
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # Database entities
│   │   ├── repository/       # Data access layer
│   │   ├── service/          # Business logic
│   │   └── exception/        # Error handling
│   ├── Dockerfile
│   └── build.gradle.kts
│
├── frontend/
│   ├── pages/
│   │   ├── index.js          # Login page
│   │   ├── signup.js         # Registration page
│   │   ├── dashboard.js      # Main dashboard
│   │   ├── ticket/[id].js    # Ticket detail page
│   │   └── admin/users.js    # User management
│   ├── lib/
│   │   └── api.js            # API client
│   ├── styles/
│   │   └── globals.css       # Global styles
│   └── Dockerfile
│
└── README.md


🔑 Default Credentials
For testing purposes, you can create users with different roles:
Admin User:
Email: admin@gmail.com
Password: admin
Agent User:
Email: agent1@gmail.com
Password: agent1
Regular User:
Email: user@gmail.com
Password: user

🎯 User Roles & Permissions
👤 USER (Default)
✅ Create tickets
✅ View own tickets
✅ Add comments to own tickets
❌ Cannot assign tickets
❌ Cannot change ticket status
❌ Cannot access admin features
👨‍💼 AGENT
✅ View assigned tickets only
✅ Update ticket status
✅ Add comments to assigned tickets
❌ Cannot see all tickets
❌ Cannot assign tickets
❌ Cannot manage users
👑 ADMIN
✅ View all tickets in system
✅ Assign tickets to agents
✅ Update any ticket status
✅ Manage users (create, edit, delete)
✅ Change user roles
✅ Full system access

🎨 Color Scheme
The application uses a modern, vibrant color palette:
Primary: Indigo/Purple gradient (#4F46E5 → #7C3AED)
Status Colors:
🟢 Open: Green (#10B981)
🔵 In Progress: Blue (#3B82F6)
🟡 Resolved: Yellow/Orange (#F59E0B)
⚫ Closed: Gray (#6B7280)
Priority Colors:
🔴 Urgent: Red (#EF4444)
🟠 High: Orange (#F97316)
🟡 Medium: Yellow (#EAB308)
⚪ Low: Gray (#9CA3AF)

🔄 Ticket Lifecycle
1. USER creates ticket → Status: OPEN
2. ADMIN assigns to AGENT
3. AGENT changes status → IN_PROGRESS
4. AGENT/USER adds comments (collaboration)
5. AGENT marks as → RESOLVED
6. AGENT/ADMIN closes → CLOSED




📊 Database Schema
Users Table
id - Primary Key
email - Unique, Required
password - Hashed (BCrypt)
name - Optional
roles - Set<Role> (USER, AGENT, ADMIN)
Tickets Table
id - Primary Key
subject - Required
description - Text, Required
priority - Enum (LOW, MEDIUM, HIGH, URGENT)
category - Enum (HARDWARE, SOFTWARE, NETWORK, OTHER)
status - Enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
owner_id - Foreign Key → Users
assignee_id - Foreign Key → Users (nullable)
created_at - Timestamp
Comments Table
id - Primary Key
text - Text, Required
author_id - Foreign Key → Users
ticket_id - Foreign Key → Tickets
created_at - Timestamp




🚀 Deployment
Backend (Railway)
Create new project on Railway
Add PostgreSQL database
Connect GitHub repository
Set environment variables
Deploy automatically
Frontend (Vercel/Railway)
Create new project
Connect GitHub repository
Set build command: npm run build
Set start command: npm start
Deploy

🐛 Known Issues & Limitations
Email notifications disabled - SMTP configuration required
No file attachments - Feature can be added

🔮 Future Enhancements
[ ] Email notifications for ticket updates
[ ] File attachment support
[ ] Export tickets to CSV/PDF
[ ] Mobile app (React Native)
[ ] Real-time notifications 


👨‍💻 Author
Your Name
GitHub:@prithvirajbl280
LinkedIn:prithvirajbl
Email:prithvirajbl280@gmail.com

⭐ If you find this project useful, please give it a star!

