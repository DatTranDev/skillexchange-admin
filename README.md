# Skill Exchange Admin Panel

An admin moderation dashboard for the Skill Exchange platform built with Next.js 14, TypeScript, and TailwindCSS.

## Features

- 🔐 **Secure Authentication** - Admin login with session management
- 📊 **Dashboard** - KPIs, top reported users, and recent reports overview
- 🚩 **Reports Management** - Review, resolve, and reject user reports with filtering
- 👥 **User Moderation** - View user details, report history, and take moderation actions
- 🎨 **Modern UI** - Clean, responsive interface built with TailwindCSS
- 🔄 **Real-time Updates** - Zustand state management for instant UI updates
- 🎯 **Type-safe** - Full TypeScript coverage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Icons**: lucide-react
- **HTTP Client**: Fetch API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Access to the Skill Exchange backend API

### Installation

1. Clone the repository and navigate to the admin folder:

```bash
cd SkillExchangeAdmin
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The admin panel will be available at [http://localhost:3001](http://localhost:3001)

### Admin Login

The app connects to your existing backend API. Use the admin credentials from your backend:

Or use the admin account created via the `migrate-isAdmin.js` script in the backend.

## Project Structure

```
SkillExchangeAdmin/
├── app/                      # Next.js App Router pages
│   ├── admin/
│   │   ├── layout.tsx       # Admin layout with sidebar
│   │   ├── page.tsx         # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   ├── reports/
│   │   │   └── page.tsx     # Reports management
│   │   └── users/
│   │       └── [userId]/
│   │           └── page.tsx # User moderation page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root redirect
│   └── globals.css          # Global styles
├── components/
│   ├── common/              # Shared components
│   ├── layout/              # Layout components (Sidebar, Topbar)
│   ├── reports/             # Report-specific components
│   ├── table/               # Table components
│   └── ui/                  # UI primitives
├── lib/
│   ├── apiClient.ts         # API service layer
│   ├── config.ts            # API configuration
│   └── utils.ts             # Utility functions
├── stores/
│   ├── moderationStore.ts   # Moderation data store
│   └── sessionStore.ts      # Authentication store
├── types/
│   └── index.ts             # TypeScript type definitions
└── middleware.ts            # Route protection middleware
```

## Key Features

### Dashboard

- **KPI Cards**: Open reports, auto-hidden messages, top reported users
- **Top Reported Users**: Table showing users with the most reports
- **Recent Open Reports**: Latest unresolved reports

### Reports Management

- **Advanced Filtering**: Filter by status, target type, reason, and search
- **URL Query Persistence**: Filters are saved in URL for easy sharing
- **Review Drawer**: Side panel for reviewing report details
- **Actions**: Resolve or reject reports with admin notes

### User Moderation

- **User Profile**: View user details and moderation statistics
- **Report History**: All reports filed against the user
- **Flagged Messages**: Messages flagged by toxicity detection
- **Moderation Actions**: Suspend, ban, or delete users with confirmation

### Authentication

- **Protected Routes**: Middleware ensures only authenticated admins can access
- **Session Persistence**: Cookie + localStorage for session management
- **Remember Me**: Optional 7-day session persistence
- **Auto-logout**: Clear session on logout or token expiration

## API Integration

The admin panel integrates with your existing backend API at:

```
https://se405-skillexchangebe.onrender.com/api/v1
```

### API Endpoints Used

- `POST /user/login` - Admin authentication
- `GET /user/find` - Get all users
- `GET /user/findbyid/:id` - Get user by ID
- `GET /report/all` - Get all reports
- `PUT /report/resolve/:id` - Resolve report
- `DELETE /report/:id` - Delete report
- `PATCH /user/update/:id` - Update user
- `DELETE /user/delete/:id` - Soft delete user

## Environment Variables

No environment variables are required. The API URL is configured in `lib/config.ts`.

To change the API URL, edit:

```typescript
// lib/config.ts
const API_CONFIG = {
  BASE_URL: "https://your-api-url.com",
  API_VERSION: "/api/v1",
};
```

## Building for Production

```bash
npm run build
npm run start
```

## Development Notes

- The app uses **client-side rendering** for all admin pages due to authentication requirements
- **Zustand** stores handle all state management and API calls
- **Middleware** protects routes and redirects unauthenticated users to login
- **TypeScript** provides full type safety across the application
- All dates are formatted using `formatDate` and `formatRelativeTime` utilities

## Future Enhancements

- [ ] Message moderation with toxicity scores
- [ ] Audit log viewer
- [ ] User analytics and trends
- [ ] Bulk actions for reports
- [ ] Export reports to CSV/PDF
- [ ] Real-time notifications via WebSocket
- [ ] Advanced search with filters
- [ ] User activity timeline

## License

This project is part of the Skill Exchange platform.

## Support

For issues or questions, please refer to the main Skill Exchange repository or contact the development team.
