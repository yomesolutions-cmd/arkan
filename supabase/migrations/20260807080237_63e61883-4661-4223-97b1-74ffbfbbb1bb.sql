-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- DESTINATIONS
CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  country text NOT NULL,
  region text NOT NULL DEFAULT 'Other',
  description text,
  image_key text NOT NULL DEFAULT 'dest1',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.destinations TO anon;
GRANT SELECT ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are public" ON public.destinations FOR SELECT TO anon, authenticated USING (true);

-- TOUR PACKAGES
CREATE TABLE public.tour_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  place text NOT NULL,
  days integer NOT NULL DEFAULT 5,
  nights integer NOT NULL DEFAULT 4,
  min_people integer NOT NULL DEFAULT 2,
  max_people integer NOT NULL DEFAULT 12,
  price numeric(10,2) NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  category text NOT NULL DEFAULT 'City',
  description text,
  image_key text NOT NULL DEFAULT 'dest1',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tour_packages TO anon;
GRANT SELECT ON public.tour_packages TO authenticated;
GRANT ALL ON public.tour_packages TO service_role;
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tour packages are public" ON public.tour_packages FOR SELECT TO anon, authenticated USING (true);

-- FLIGHTS
CREATE TABLE public.flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline text NOT NULL,
  flight_no text NOT NULL,
  from_city text NOT NULL,
  to_city text NOT NULL,
  depart_at timestamptz NOT NULL,
  arrive_at timestamptz NOT NULL,
  stops integer NOT NULL DEFAULT 0,
  cabin text NOT NULL DEFAULT 'Economy',
  price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flights TO anon;
GRANT SELECT ON public.flights TO authenticated;
GRANT ALL ON public.flights TO service_role;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flights are public" ON public.flights FOR SELECT TO anon, authenticated USING (true);

-- HOTELS
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  stars integer NOT NULL DEFAULT 4,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  amenities text[] NOT NULL DEFAULT '{}',
  price_per_night numeric(10,2) NOT NULL,
  image_key text NOT NULL DEFAULT 'dest2',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hotels TO anon;
GRANT SELECT ON public.hotels TO authenticated;
GRANT ALL ON public.hotels TO service_role;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hotels are public" ON public.hotels FOR SELECT TO anon, authenticated USING (true);

-- BOOKINGS
CREATE TYPE public.booking_item_type AS ENUM ('flight','hotel','tour');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type public.booking_item_type NOT NULL,
  item_id uuid,
  title text NOT NULL,
  subtitle text,
  travel_date date,
  guests integer NOT NULL DEFAULT 1,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED DESTINATIONS
INSERT INTO public.destinations (slug, name, country, region, description, image_key, featured) VALUES
('istanbul','Istanbul','Türkiye','Europe','Where two continents meet — bazaars, palaces and the Bosphorus.','dest1',true),
('dubai','Dubai','UAE','Middle East','Skyline glamour, golden desert and world-class shopping.','dest2',true),
('maldives','Maldives','Indian Ocean','Asia','Overwater villas, coral reefs and impossibly clear water.','dest3',true),
('paris','Paris','France','Europe','Boulevards, museums and the best food streets in Europe.','dest4',true),
('cappadocia','Cappadocia','Türkiye','Europe','Balloons at sunrise over fairy chimneys and cave hotels.','dest1',false),
('antalya','Antalya','Türkiye','Europe','Turquoise coast, old town harbours and family resorts.','dest3',false),
('rome','Rome','Italy','Europe','Ancient ruins, piazzas and unforgettable pasta.','dest4',false),
('bali','Bali','Indonesia','Asia','Rice terraces, temples and surf beaches.','dest3',false);

-- SEED TOUR PACKAGES
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'bosphorus-cappadocia','Bosphorus & Cappadocia Escape', d.id,'Türkiye',6,5,2,12,740,4.9,'Culture','Istanbul highlights plus a balloon sunrise in Cappadocia.','dest1',true FROM public.destinations d WHERE d.slug='istanbul';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'dubai-city-desert','Dubai City Lights & Desert', d.id,'United Arab Emirates',5,4,2,10,890,4.8,'City','Burj Khalifa, marina cruise and an overnight desert camp.','dest2',true FROM public.destinations d WHERE d.slug='dubai';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'maldives-overwater','Maldives Overwater Retreat', d.id,'Maldives',7,6,2,2,1650,5.0,'Beach','Private overwater villa with snorkelling and spa days.','dest3',true FROM public.destinations d WHERE d.slug='maldives';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'paris-weekend','Paris Long Weekend', d.id,'France',4,3,2,8,620,4.7,'City','Louvre, Montmartre and a Seine dinner cruise.','dest4',false FROM public.destinations d WHERE d.slug='paris';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'antalya-family','Antalya Family Sun Week', d.id,'Türkiye',8,7,3,10,980,4.6,'Beach','All-inclusive resort week with boat trips and waterparks.','dest3',false FROM public.destinations d WHERE d.slug='antalya';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'rome-classics','Rome Classics', d.id,'Italy',5,4,2,14,710,4.8,'Culture','Colosseum, Vatican and a Trastevere food walk.','dest4',false FROM public.destinations d WHERE d.slug='rome';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'bali-adventure','Bali Island Adventure', d.id,'Indonesia',9,8,2,12,1180,4.9,'Adventure','Ubud, Nusa Penida and a volcano sunrise hike.','dest3',false FROM public.destinations d WHERE d.slug='bali';
INSERT INTO public.tour_packages (slug, title, destination_id, place, days, nights, min_people, max_people, price, rating, category, description, image_key, featured)
SELECT 'cappadocia-balloon','Cappadocia Balloon Short Break', d.id,'Türkiye',3,2,2,6,430,4.9,'Adventure','Cave hotel stay with a hot-air balloon flight.','dest1',false FROM public.destinations d WHERE d.slug='cappadocia';

-- SEED FLIGHTS
INSERT INTO public.flights (airline, flight_no, from_city, to_city, depart_at, arrive_at, stops, cabin, price) VALUES
('Turkish Airlines','TK1978','Istanbul','Dubai', now() + interval '7 days 6 hours', now() + interval '7 days 10 hours',0,'Economy',245),
('Emirates','EK122','Dubai','Istanbul', now() + interval '9 days 3 hours', now() + interval '9 days 7 hours',0,'Economy',268),
('Turkish Airlines','TK1827','Istanbul','Paris', now() + interval '5 days 8 hours', now() + interval '5 days 12 hours',0,'Economy',198),
('Air France','AF1391','Paris','Istanbul', now() + interval '12 days 9 hours', now() + interval '12 days 13 hours',0,'Business',640),
('Qatar Airways','QR241','Istanbul','Maldives', now() + interval '10 days 2 hours', now() + interval '10 days 13 hours',1,'Economy',520),
('Emirates','EK654','Dubai','Maldives', now() + interval '6 days 5 hours', now() + interval '6 days 9 hours',0,'Economy',310),
('Pegasus','PC1234','Istanbul','Antalya', now() + interval '3 days 7 hours', now() + interval '3 days 8 hours',0,'Economy',65),
('ITA Airways','AZ711','Rome','Istanbul', now() + interval '8 days 11 hours', now() + interval '8 days 14 hours',0,'Economy',175),
('Singapore Airlines','SQ939','Bali','Dubai', now() + interval '14 days 4 hours', now() + interval '14 days 14 hours',1,'Business',1240),
('Turkish Airlines','TK58','Istanbul','Rome', now() + interval '4 days 6 hours', now() + interval '4 days 9 hours',0,'Economy',160);

-- SEED HOTELS
INSERT INTO public.hotels (name, city, country, stars, rating, amenities, price_per_night, image_key) VALUES
('Bosphorus Pearl Hotel','Istanbul','Türkiye',5,4.8,'{Wifi,Pool,Spa,Breakfast}',140,'dest1'),
('Sultanahmet Boutique','Istanbul','Türkiye',4,4.5,'{Wifi,Breakfast}',85,'dest1'),
('Marina Bay Towers','Dubai','UAE',5,4.9,'{Wifi,Pool,Gym,Spa,Breakfast}',210,'dest2'),
('Desert Rose Residence','Dubai','UAE',4,4.4,'{Wifi,Pool,Parking}',120,'dest2'),
('Coral Lagoon Resort','Maldives','Maldives',5,5.0,'{Wifi,Pool,Spa,Breakfast,Beach}',480,'dest3'),
('Blue Atoll Villas','Maldives','Maldives',4,4.7,'{Wifi,Beach,Breakfast}',320,'dest3'),
('Hotel Rive Gauche','Paris','France',4,4.6,'{Wifi,Breakfast}',175,'dest4'),
('Montmartre Suites','Paris','France',3,4.2,'{Wifi}',110,'dest4'),
('Antalya Sun Resort','Antalya','Türkiye',5,4.6,'{Wifi,Pool,Beach,Breakfast,Gym}',150,'dest3'),
('Trastevere Garden','Rome','Italy',4,4.5,'{Wifi,Breakfast,Parking}',130,'dest4');