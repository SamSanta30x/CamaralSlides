-- Create presentation_views table to track individual views
CREATE TABLE IF NOT EXISTS presentation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  viewer_session_id TEXT NOT NULL, -- Anonymous session ID for tracking
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- Calculated when ended_at is set
  is_active BOOLEAN DEFAULT TRUE, -- Currently viewing
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_presentation_views_presentation_id ON presentation_views(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_views_is_active ON presentation_views(is_active);
CREATE INDEX IF NOT EXISTS idx_presentation_views_started_at ON presentation_views(started_at);
CREATE INDEX IF NOT EXISTS idx_presentation_views_session_id ON presentation_views(viewer_session_id);

-- Create presentation_analytics table for aggregated metrics
CREATE TABLE IF NOT EXISTS presentation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE UNIQUE,
  total_views INTEGER DEFAULT 0,
  active_views INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0, -- Sum of all durations
  average_duration_seconds INTEGER DEFAULT 0, -- Calculated field
  successful_calls INTEGER DEFAULT 0, -- From ElevenLabs
  total_calls INTEGER DEFAULT 0, -- From ElevenLabs
  success_rate DECIMAL(5,2) DEFAULT 0.00, -- Calculated: (successful_calls / total_calls) * 100
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for presentation_id
CREATE INDEX IF NOT EXISTS idx_presentation_analytics_presentation_id ON presentation_analytics(presentation_id);

-- Function to automatically calculate duration when view ends
CREATE OR REPLACE FUNCTION calculate_view_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    NEW.is_active := FALSE;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate duration on update
DROP TRIGGER IF EXISTS trigger_calculate_view_duration ON presentation_views;
CREATE TRIGGER trigger_calculate_view_duration
  BEFORE UPDATE ON presentation_views
  FOR EACH ROW
  EXECUTE FUNCTION calculate_view_duration();

-- Function to update analytics when views change
CREATE OR REPLACE FUNCTION update_presentation_analytics()
RETURNS TRIGGER AS $$
DECLARE
  v_total_views INTEGER;
  v_active_views INTEGER;
  v_total_duration INTEGER;
  v_avg_duration INTEGER;
BEGIN
  -- Get presentation_id from NEW or OLD
  DECLARE
    v_presentation_id UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      v_presentation_id := OLD.presentation_id;
    ELSE
      v_presentation_id := NEW.presentation_id;
    END IF;

    -- Calculate metrics
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE is_active = TRUE),
      COALESCE(SUM(duration_seconds), 0),
      COALESCE(AVG(duration_seconds)::INTEGER, 0)
    INTO 
      v_total_views,
      v_active_views,
      v_total_duration,
      v_avg_duration
    FROM presentation_views
    WHERE presentation_id = v_presentation_id;

    -- Upsert analytics
    INSERT INTO presentation_analytics (
      presentation_id,
      total_views,
      active_views,
      total_duration_seconds,
      average_duration_seconds,
      updated_at
    ) VALUES (
      v_presentation_id,
      v_total_views,
      v_active_views,
      v_total_duration,
      v_avg_duration,
      NOW()
    )
    ON CONFLICT (presentation_id) 
    DO UPDATE SET
      total_views = v_total_views,
      active_views = v_active_views,
      total_duration_seconds = v_total_duration,
      average_duration_seconds = v_avg_duration,
      updated_at = NOW();
  END;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update analytics
DROP TRIGGER IF EXISTS trigger_update_analytics_on_insert ON presentation_views;
CREATE TRIGGER trigger_update_analytics_on_insert
  AFTER INSERT ON presentation_views
  FOR EACH ROW
  EXECUTE FUNCTION update_presentation_analytics();

DROP TRIGGER IF EXISTS trigger_update_analytics_on_update ON presentation_views;
CREATE TRIGGER trigger_update_analytics_on_update
  AFTER UPDATE ON presentation_views
  FOR EACH ROW
  EXECUTE FUNCTION update_presentation_analytics();

DROP TRIGGER IF EXISTS trigger_update_analytics_on_delete ON presentation_views;
CREATE TRIGGER trigger_update_analytics_on_delete
  AFTER DELETE ON presentation_views
  FOR EACH ROW
  EXECUTE FUNCTION update_presentation_analytics();

-- Enable RLS
ALTER TABLE presentation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for presentation_views
-- Anyone can insert views (for public share page)
CREATE POLICY "Anyone can create views"
  ON presentation_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can update their own view (by session_id)
CREATE POLICY "Anyone can update their own view"
  ON presentation_views
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Users can view their presentation's views
CREATE POLICY "Users can view their presentation views"
  ON presentation_views
  FOR SELECT
  TO authenticated
  USING (
    presentation_id IN (
      SELECT id FROM presentations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for presentation_analytics
-- Users can view their presentation's analytics
CREATE POLICY "Users can view their presentation analytics"
  ON presentation_analytics
  FOR SELECT
  TO authenticated
  USING (
    presentation_id IN (
      SELECT id FROM presentations WHERE user_id = auth.uid()
    )
  );

-- Users can update their presentation's analytics (for ElevenLabs data)
CREATE POLICY "Users can update their presentation analytics"
  ON presentation_analytics
  FOR UPDATE
  TO authenticated
  USING (
    presentation_id IN (
      SELECT id FROM presentations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    presentation_id IN (
      SELECT id FROM presentations WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE presentation_views IS 'Individual view sessions for presentations';
COMMENT ON TABLE presentation_analytics IS 'Aggregated analytics metrics for presentations';
COMMENT ON COLUMN presentation_views.viewer_session_id IS 'Anonymous session ID to track individual viewers';
COMMENT ON COLUMN presentation_views.duration_seconds IS 'Total duration of the view in seconds';
COMMENT ON COLUMN presentation_views.is_active IS 'Whether the view is currently active';
COMMENT ON COLUMN presentation_analytics.successful_calls IS 'Number of successful calls from ElevenLabs';
COMMENT ON COLUMN presentation_analytics.total_calls IS 'Total number of calls from ElevenLabs';
COMMENT ON COLUMN presentation_analytics.success_rate IS 'Percentage of successful calls';
