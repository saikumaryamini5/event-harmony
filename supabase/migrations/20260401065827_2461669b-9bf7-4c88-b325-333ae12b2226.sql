
-- Create severity enum
CREATE TYPE public.log_severity AS ENUM ('critical', 'error', 'warning', 'info', 'debug');

-- Create source type enum
CREATE TYPE public.source_type AS ENUM ('syslog', 'application', 'cloudwatch', 'gcp', 'kubernetes', 'http', 'file');

-- Create source status enum
CREATE TYPE public.source_status AS ENUM ('active', 'inactive', 'error');

-- Create alert condition enum
CREATE TYPE public.alert_condition AS ENUM ('error_spike', 'pattern_match', 'anomaly', 'threshold');

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Log sources table
CREATE TABLE public.log_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type source_type NOT NULL,
  status source_status NOT NULL DEFAULT 'active',
  last_seen TIMESTAMPTZ DEFAULT now(),
  log_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.log_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sources" ON public.log_sources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own sources" ON public.log_sources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sources" ON public.log_sources FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sources" ON public.log_sources FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_log_sources_updated_at BEFORE UPDATE ON public.log_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Logs table
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES public.log_sources(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_name TEXT NOT NULL,
  source_type source_type NOT NULL,
  host TEXT NOT NULL,
  severity log_severity NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  request_id TEXT,
  user_id_field TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own logs" ON public.logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own logs" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_logs_user_timestamp ON public.logs (user_id, timestamp DESC);
CREATE INDEX idx_logs_severity ON public.logs (severity);
CREATE INDEX idx_logs_source ON public.logs (source_name);
CREATE INDEX idx_logs_request_id ON public.logs (request_id) WHERE request_id IS NOT NULL;

-- Correlation rules table
CREATE TABLE public.correlation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.correlation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rules" ON public.correlation_rules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own rules" ON public.correlation_rules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rules" ON public.correlation_rules FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rules" ON public.correlation_rules FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_correlation_rules_updated_at BEFORE UPDATE ON public.correlation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Correlated events table
CREATE TABLE public.correlated_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.correlation_rules(id) ON DELETE CASCADE NOT NULL,
  rule_name TEXT NOT NULL,
  log_ids UUID[] NOT NULL DEFAULT '{}',
  shared_values JSONB NOT NULL DEFAULT '{}',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  severity log_severity NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.correlated_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own events" ON public.correlated_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own events" ON public.correlated_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_correlated_events_user ON public.correlated_events (user_id, end_time DESC);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  condition alert_condition NOT NULL,
  threshold NUMERIC,
  enabled BOOLEAN NOT NULL DEFAULT true,
  triggered BOOLEAN NOT NULL DEFAULT false,
  last_triggered TIMESTAMPTZ,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own alerts" ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON public.alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
