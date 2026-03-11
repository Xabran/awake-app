CREATE TABLE alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puck_id UUID NOT NULL REFERENCES pucks(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  recurring_days SMALLINT[] NOT NULL DEFAULT '{}',
  snooze_enabled BOOLEAN NOT NULL DEFAULT true,
  snooze_duration_min INTEGER NOT NULL DEFAULT 5,
  label VARCHAR(100) NOT NULL DEFAULT '',
  ringtone_id VARCHAR(255),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One alarm per puck, enforced at database level
CREATE UNIQUE INDEX idx_alarms_puck_id ON alarms(puck_id);
