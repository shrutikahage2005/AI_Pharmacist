
-- Medicines/Products table
CREATE TABLE public.medicines (
  id SERIAL PRIMARY KEY,
  product_id INTEGER UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  pzn TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  package_size TEXT,
  description TEXT,
  stock_level INTEGER NOT NULL DEFAULT 100,
  prescription_required BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read medicines" ON public.medicines FOR SELECT USING (true);

-- Consumer order history
CREATE TABLE public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  purchase_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2),
  dosage_frequency TEXT,
  prescription_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read order history" ON public.order_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.order_history FOR INSERT WITH CHECK (true);

-- Chat messages for the AI pharmacist
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Refill alerts
CREATE TABLE public.refill_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  last_purchase_date DATE,
  estimated_runout_date DATE,
  dosage_frequency TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.refill_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read refill alerts" ON public.refill_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can manage refill alerts" ON public.refill_alerts FOR ALL USING (true);

-- Orders table for new orders placed through the system
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  prescription_verified BOOLEAN DEFAULT false,
  webhook_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);
