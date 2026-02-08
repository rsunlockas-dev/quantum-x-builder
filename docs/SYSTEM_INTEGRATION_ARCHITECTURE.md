# System Integration Architecture

## Overview
This document outlines the architecture for integrating a comprehensive TODO/Task management system with Google Calendar, Google Tasks, evolving documentation, and a live admin dashboard.

## System Components

### 1. Core TODO System
**Location**: `_OPS/TODO/`
**Purpose**: Central task management with recursive connections

```yaml
# Enhanced todo.yaml structure
system:
  version: "2.0"
  evolves_with_system: true
  sync_enabled: true
  
tasks:
  - id: string (UUID)
    title: string
    description: string
    status: pending|in-progress|completed|blocked
    priority: low|medium|high|critical
    due_date: ISO8601
    created_at: ISO8601
    updated_at: ISO8601
    assigned_to: string
    tags: array<string>
    folder_path: string  # Links to EVOLVING_TREE
    index_refs: array<string>  # Links to EVOLVING_INDEX
    taxonomy_tags: array<string>  # Links to EVOLVING_TAXONOMY
    parent_task: string (UUID)  # For recursive structure
    subtasks: array<UUID>
    calendar_event_id: string  # Google Calendar sync
    google_task_id: string  # Google Tasks sync
    
metadata:
  folder_tree_version: string
  index_version: string
  taxonomy_version: string
  last_sync: ISO8601
  reflection_date: ISO8601
```

### 2. Google Calendar Integration
**Module**: `backend/src/integrations/google-calendar.js`
**APIs**: Google Calendar API v3

**Features**:
- OAuth2 authentication for multiple accounts
- Bidirectional sync (TODO ↔ Calendar)
- Event creation from tasks
- Task updates from calendar changes
- Log entries as calendar events
- Conflict resolution

**Calendar Accounts**:
- ai@infinityxonesystems.com (Primary AI operations)
- info@infinityxonesystems.com (General info/support)

### 3. Google Tasks Integration
**Module**: `backend/src/integrations/google-tasks.js`
**APIs**: Google Tasks API v1

**Features**:
- Task list creation/management
- Bidirectional sync (TODO ↔ Tasks)
- Roadmap synchronization
- Subtask hierarchy mapping
- Due date synchronization

### 4. Evolving Systems Integration

#### 4.1 Folder Tree (_OPS/EVOLVING_TREE/)
```json
{
  "version": "1.0",
  "tree": {
    "root": "/",
    "nodes": [
      {
        "path": "/services",
        "type": "directory",
        "children": [],
        "tasks": ["task-uuid-1", "task-uuid-2"],
        "last_modified": "ISO8601"
      }
    ]
  },
  "watch_patterns": ["**/*.js", "**/*.json"],
  "auto_update": true
}
```

#### 4.2 Indexing System (_OPS/EVOLVING_INDEX/)
```json
{
  "version": "1.0",
  "indices": {
    "files": {
      "path/to/file.js": {
        "hash": "sha256",
        "exports": [],
        "imports": [],
        "tasks": ["task-uuid"],
        "last_indexed": "ISO8601"
      }
    },
    "symbols": {},
    "dependencies": {}
  }
}
```

#### 4.3 Taxonomy System (_OPS/EVOLVING_TAXONOMY/)
```json
{
  "version": "1.0",
  "taxonomy": {
    "categories": {
      "backend": ["api", "services", "database"],
      "frontend": ["components", "pages", "hooks"],
      "infrastructure": ["docker", "ci-cd", "deployment"]
    },
    "tags": ["feature", "bug", "enhancement", "documentation"],
    "task_mapping": {
      "tag-name": ["task-uuid-1", "task-uuid-2"]
    }
  }
}
```

### 5. Reflection System (_OPS/REFLECTION/)
**Purpose**: Daily system analysis and metrics

**Components**:
- **Scheduler**: Daily reflection at configured time
- **Metrics Collector**: Gathers task completion rates, system changes
- **Observation Logger**: Records system state changes
- **Calendar Integration**: Creates daily reflection events

**Daily Reflection Output**:
```json
{
  "date": "2026-02-08",
  "tasks_completed": 15,
  "tasks_created": 8,
  "files_changed": 42,
  "index_updates": 127,
  "taxonomy_changes": 5,
  "calendar_events_synced": 23,
  "recommendations": [
    "High task creation rate - consider sprint planning",
    "Low completion rate in backend category"
  ],
  "visualization_data": {
    "completion_rate": 0.73,
    "category_distribution": {},
    "velocity_trend": []
  }
}
```

### 6. Evolving Documents System
**Module**: `backend/src/services/document-evolution.js`

**Features**:
- Auto-generate documentation from code structure
- Update docs when repo structure changes
- Link documentation to tasks
- Version tracking
- Template-based generation

**Document Types**:
- README files for new directories
- API documentation
- Architecture diagrams (Mermaid)
- Change logs
- System reports

### 7. Admin Control Panel
**Location**: `admin-dashboard/` (new React app)

**Features**:
- **Live Dashboard**: Real-time system overview
- **Task Management**: CRUD operations on tasks
- **Calendar View**: Integrated calendar display
- **Sync Status**: Monitor sync operations
- **Settings Panel**: Configure all features
- **Visualization**: Charts and graphs
- **Modular Toggles**: Enable/disable features
- **Log Viewer**: Real-time log streaming

**Visualization Components**:
```javascript
// Task completion over time (line chart)
// Tasks by category (pie chart)
// Task priority distribution (bar chart)
// Sync status timeline
// System health metrics
// File change heatmap
```

### 8. Auto-Sync Engine
**Module**: `backend/src/services/sync-engine.js`

**Sync Flows**:
1. **TODO → Calendar**: Task created/updated → Calendar event
2. **Calendar → TODO**: Event created/updated → Task
3. **TODO → Google Tasks**: Task changes → Tasks API
4. **Google Tasks → TODO**: Task API changes → Local tasks
5. **File System → Index**: File changes → Index updates
6. **Index → TODO**: New files → Auto-create setup tasks
7. **TODO → Documents**: Task completion → Update docs
8. **Reflection → Calendar**: Daily reflection → Calendar event

**Conflict Resolution**:
- Last-write-wins with manual override
- Merge conflicts flagged for review
- Audit trail of all changes

### 9. Auto-Ingest System
**Module**: `backend/src/services/auto-ingest.js`

**Features**:
- File system watching (chokidar)
- New directory detection → Create README task
- New service detection → Create documentation task
- Dependency changes → Update task list
- Schema changes → Create migration task

## Data Flow

```
┌─────────────────┐
│  File System    │
│  Changes        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Auto-Ingest    │────▶│  TODO System │
│  Service        │     └──────┬───────┘
└─────────────────┘            │
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │                          │                          │
    ▼                          ▼                          ▼
┌─────────┐            ┌──────────────┐         ┌──────────────┐
│ Folder  │            │   Indexing   │         │  Taxonomy    │
│  Tree   │            │   System     │         │   System     │
└────┬────┘            └──────┬───────┘         └──────┬───────┘
     │                        │                        │
     └────────────────────────┼────────────────────────┘
                              │
                              ▼
                     ┌──────────────┐
                     │  Sync Engine │
                     └───────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌───────────┐  ┌────────────┐  ┌─────────────┐
       │  Google   │  │   Google   │  │  Documents  │
       │  Calendar │  │   Tasks    │  │   System    │
       └─────┬─────┘  └─────┬──────┘  └──────┬──────┘
             │              │                │
             └──────────────┼────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Admin Dashboard │
                   │  (Live View)    │
                   └─────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Reflection     │
                   │  System         │
                   │  (Daily)        │
                   └─────────────────┘
```

## API Endpoints

### Tasks API
```
POST   /api/tasks              - Create task
GET    /api/tasks              - List tasks
GET    /api/tasks/:id          - Get task
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
POST   /api/tasks/:id/sync     - Force sync to calendar/tasks
GET    /api/tasks/tree         - Get task tree (recursive)
```

### Sync API
```
POST   /api/sync/calendar      - Trigger calendar sync
POST   /api/sync/google-tasks  - Trigger Google Tasks sync
POST   /api/sync/all           - Full system sync
GET    /api/sync/status        - Get sync status
```

### Reflection API
```
GET    /api/reflection/daily/:date  - Get daily reflection
POST   /api/reflection/trigger      - Trigger reflection
GET    /api/reflection/metrics      - Get metrics for visualization
```

### Evolution API
```
GET    /api/evolution/tree      - Get folder tree
GET    /api/evolution/index     - Get index state
GET    /api/evolution/taxonomy  - Get taxonomy
POST   /api/evolution/ingest    - Trigger auto-ingest
```

### Admin API
```
GET    /api/admin/dashboard     - Dashboard data
GET    /api/admin/settings      - Get settings
PUT    /api/admin/settings      - Update settings
GET    /api/admin/logs/stream   - WebSocket for live logs
POST   /api/admin/feature-toggle - Enable/disable features
```

## Security & Authentication

### OAuth2 Flow
1. User initiates Google auth from admin panel
2. Backend redirects to Google OAuth consent
3. User authorizes calendar and tasks access
4. Backend receives auth code
5. Exchange for access/refresh tokens
6. Store tokens securely (encrypted)
7. Auto-refresh when expired

### Permissions Required
- **Google Calendar**: `https://www.googleapis.com/auth/calendar`
- **Google Tasks**: `https://www.googleapis.com/auth/tasks`

### API Security
- JWT authentication for admin panel
- API key for internal services
- Rate limiting on all endpoints
- Audit logging for all changes

## Database Schema

### tables
```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50),
  priority VARCHAR(50),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  assigned_to VARCHAR(255),
  folder_path TEXT,
  parent_task_id UUID REFERENCES tasks(id),
  calendar_event_id TEXT,
  google_task_id TEXT,
  metadata JSONB
);

-- Sync state table
CREATE TABLE sync_state (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id TEXT,
  sync_target VARCHAR(50),
  last_sync TIMESTAMP,
  sync_status VARCHAR(50),
  error_message TEXT
);

-- Reflections table
CREATE TABLE reflections (
  id SERIAL PRIMARY KEY,
  reflection_date DATE UNIQUE,
  metrics JSONB,
  observations JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System settings table
CREATE TABLE settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_folder_path ON tasks(folder_path);
CREATE INDEX idx_sync_state_entity ON sync_state(entity_type, entity_id);
```

## Configuration

### Environment Variables
```bash
# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=
GOOGLE_CALENDAR_AI_EMAIL=ai@infinityxonesystems.com
GOOGLE_CALENDAR_INFO_EMAIL=info@infinityxonesystems.com

# Google Tasks
GOOGLE_TASKS_CLIENT_ID=
GOOGLE_TASKS_CLIENT_SECRET=

# Sync Settings
SYNC_INTERVAL_MINUTES=15
AUTO_INGEST_ENABLED=true
DAILY_REFLECTION_TIME=23:00

# Admin Panel
ADMIN_PANEL_PORT=3001
ENABLE_LIVE_LOGS=true

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/qxb
```

## Deployment

### Services to Deploy
1. **Backend API** - Express server with all integrations
2. **Sync Service** - Scheduled sync jobs
3. **Auto-Ingest Service** - File system watcher
4. **Reflection Service** - Daily reflection scheduler
5. **Admin Dashboard** - React frontend
6. **WebSocket Server** - Live updates

### Monitoring
- Health checks on all services
- Sync failure alerts
- Calendar API quota monitoring
- Task API quota monitoring
- Database connection pool monitoring

## Development Phases

See main implementation plan in progress report for detailed phase breakdown.

## Notes

This is a comprehensive enterprise system integration. Full implementation requires:
- 8-12 weeks development time
- Multiple developers for parallel work
- Thorough testing of sync mechanisms
- Google Cloud project setup with API access
- Database migration planning
- Security audit
- Performance testing with large datasets

The system is designed to be modular, allowing incremental implementation and feature toggles for gradual rollout.
