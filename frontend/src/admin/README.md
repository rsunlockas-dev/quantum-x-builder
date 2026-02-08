# Admin UI Components - STUB

## Overview

This directory contains **stub implementations** of the Admin Control Plane UI components for the Quantum X Builder autonomous system.

**Status**: 🚧 STUB - Awaiting full implementation

## Components

### AdminControlPanel.tsx

Main admin control panel component with the following features:

#### Implemented (Stub)
- ✅ Tab-based navigation
- ✅ Autonomy status display with toggle (UI only)
- ✅ Quick stats cards (static data)
- ✅ Audit ledger table (sample data)
- ✅ Rollback token search (UI only)
- ✅ Rehydration trigger (UI only)
- ✅ Agent allowlist display (static)

#### TODO - Connect to Real API
- ⬜ Fetch autonomy status from backend API
- ⬜ Real-time audit ledger updates
- ⬜ Functional rollback search with git integration
- ⬜ Actual rehydration workflow trigger
- ⬜ Agent allowlist management (add/remove)
- ⬜ Authentication and authorization
- ⬜ Error handling and loading states
- ⬜ Pagination for audit entries
- ⬜ Export audit log functionality

## Usage

To use the admin components in your app:

\`\`\`tsx
import { AdminControlPanel } from './admin';

function App() {
  return <AdminControlPanel />;
}
\`\`\`

Or import as default:

\`\`\`tsx
import AdminControlPanel from './admin/AdminControlPanel';

function App() {
  return <AdminControlPanel />;
}
\`\`\`

## Integration Steps

### 1. API Backend

Create a backend API service that implements the endpoints documented in `docs/admin-control-plane.md`:

- `GET /autonomy/status`
- `POST /autonomy/toggle`
- `GET /audit/ledger`
- `GET /rollback/search`
- `POST /rehydrate/trigger`
- `GET /agents/allowlist`

### 2. State Management

Replace stub state with real API calls using:

- **React Query** for data fetching and caching
- **Axios** or **fetch** for HTTP requests
- **Zustand** or **Context API** for global state

### 3. Authentication

Add authentication layer:

- GitHub OAuth integration
- JWT token management
- Protected routes
- Role-based access control

### 4. Real-time Updates

Add WebSocket or polling for real-time audit updates:

\`\`\`tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchAuditEntries();
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}, []);
\`\`\`

### 5. Error Handling

Add proper error boundaries and user feedback:

\`\`\`tsx
try {
  await toggleAutonomy();
  toast.success('Autonomy status updated');
} catch (error) {
  toast.error('Failed to update autonomy status');
  console.error(error);
}
\`\`\`

## Styling

The component uses **Tailwind CSS** utility classes for styling. Ensure Tailwind is configured in your project:

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
\`\`\`

## Dependencies

Add these dependencies for full functionality:

\`\`\`bash
npm install @tanstack/react-query axios date-fns
npm install react-hot-toast recharts
\`\`\`

## Testing

Create tests for the admin components:

\`\`\`tsx
// AdminControlPanel.test.tsx
import { render, screen } from '@testing-library/react';
import AdminControlPanel from './AdminControlPanel';

test('renders admin control panel', () => {
  render(<AdminControlPanel />);
  expect(screen.getByText(/QXB Admin Control Plane/i)).toBeInTheDocument();
});
\`\`\`

## Security Considerations

- ⚠️ Ensure all admin endpoints require authentication
- ⚠️ Implement rate limiting on sensitive operations
- ⚠️ Validate user permissions before showing admin UI
- ⚠️ Audit all admin actions
- ⚠️ Use HTTPS only in production

## Next Steps for Developers

1. **Set up backend API** following `docs/admin-control-plane.md`
2. **Replace stub data** with real API calls
3. **Add authentication** layer
4. **Implement WebSocket** for real-time updates
5. **Add comprehensive tests**
6. **Deploy to staging** for testing
7. **Security audit** before production

## Contact

For questions or to contribute to the admin UI implementation:

- Create an issue in the repository
- Refer to `docs/admin-control-plane.md` for API design
- Check `docs/auto-ops/README.md` for operational context

---

**Created**: 2026-02-08  
**Status**: Stub Implementation  
**Priority**: Medium
