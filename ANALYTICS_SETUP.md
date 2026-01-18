# Analytics System Setup

## Database Migration Required

To enable the analytics system, you need to run the SQL migration.

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `add-analytics-tables.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

### What this migration does:

Creates two new tables:

#### 1. `presentation_views` - Individual View Tracking
Tracks each individual view session:
- `id` - Unique view ID
- `presentation_id` - Reference to presentation
- `viewer_session_id` - Anonymous session ID for tracking
- `started_at` - When the view started
- `ended_at` - When the view ended
- `duration_seconds` - Total duration (auto-calculated)
- `is_active` - Whether the view is currently active
- `user_agent` - Browser/device info
- `ip_address` - Viewer's IP (for future use)

#### 2. `presentation_analytics` - Aggregated Metrics
Stores aggregated analytics per presentation:
- `total_views` - Total number of views (auto-calculated)
- `active_views` - Currently active views (auto-calculated)
- `total_duration_seconds` - Sum of all durations (auto-calculated)
- `average_duration_seconds` - Average view duration (auto-calculated)
- `successful_calls` - Successful ElevenLabs calls (manual update)
- `total_calls` - Total ElevenLabs calls (manual update)
- `success_rate` - Percentage of successful calls (auto-calculated)

### Automatic Features:

The migration includes **triggers** that automatically:
1. ✅ Calculate view duration when a view ends
2. ✅ Update `is_active` to `false` when view ends
3. ✅ Update aggregated analytics when views are created/updated/deleted
4. ✅ Calculate average duration from all views
5. ✅ Count active views in real-time
6. ✅ Calculate success rate from call metrics

### How it works:

#### On Public Share Page (`/share/[id]`):
1. When a user opens the share page, a new view is created
2. Every 30 seconds, a "heartbeat" updates the view activity
3. When the user closes the page, the view is ended
4. Duration is automatically calculated

#### On Analytics Page (`/presentation/[id]/analytics`):
1. Displays real-time metrics from `presentation_analytics`
2. Auto-refreshes every 10 seconds
3. Shows:
   - **Active Views** - People currently viewing (with green dot)
   - **Total Views** - All-time view count
   - **Average Duration** - Average time spent viewing
   - **Number of Calls** - Total ElevenLabs calls
   - **Success Rate** - Percentage of successful calls

### ElevenLabs Integration:

To update call metrics from ElevenLabs:

```typescript
import { updateCallMetrics } from '@/lib/supabase/analytics'

// After receiving data from ElevenLabs
await updateCallMetrics(
  presentationId,
  successfulCalls, // Number of successful calls
  totalCalls       // Total number of calls
)
```

### Session Tracking:

- Each viewer gets a unique `viewer_session_id` stored in `localStorage`
- Session persists across page reloads
- Each tab/window gets its own view ID in `sessionStorage`
- Views are properly ended when tabs are closed

### Privacy & Security:

- ✅ Anonymous tracking (no user identification)
- ✅ RLS policies ensure users can only see their own presentation analytics
- ✅ Public can create views (for share page)
- ✅ Session IDs are random and non-identifiable

### Verification:

After running the migration:

1. Open any presentation's share page: `/share/[id]`
2. Go to the Analytics page: `/presentation/[id]/analytics`
3. You should see:
   - Active Views: 1 (with green dot)
   - Total Views: 1
   - Average Duration: 00:00 (will increase as you stay on the page)
4. Close the share page tab
5. Refresh analytics - Active Views should drop to 0

### Files Modified:

- `add-analytics-tables.sql` - Database migration
- `lib/supabase/analytics.ts` - Analytics functions
- `app/share/[id]/page.tsx` - View tracking on share page
- `app/presentation/[id]/analytics/page.tsx` - Real-time analytics display

### Future Enhancements:

- Historical charts (views over time)
- Geographic data (using IP address)
- Device/browser breakdown
- Slide-level analytics (which slides are viewed most)
- Conversion tracking (CTA clicks)
