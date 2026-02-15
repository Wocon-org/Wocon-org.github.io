# Wocon Database Schema

## Overview

This document provides a comprehensive overview of the Wocon database schema, including table structures, relationships, Row Level Security (RLS) policies, and migration scripts. It is designed to ensure seamless onboarding for new team members and AI assistants.

## Database Architecture

The Wocon database follows a relational structure with the following hierarchy:

```
auth.users
    ↓
profiles
    ↓
trips
    ↓
trip_members
    ↓
trip_items
    ↓
comments
    ↓
trip_likes
    ↓
friendships
    ↓
cities (GeoNames)
```

## Core Tables

### 1. profiles

Extended user information linked to Supabase auth.users.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

**Key Rules:**
- `username` is immutable
- `nickname` is mutable
- Deleting a user cascades to delete their profile

### 2. cities

Read-only GeoNames data for location information.

```sql
CREATE TABLE IF NOT EXISTS public.cities (
  geonameid BIGINT PRIMARY KEY,
  name TEXT,
  asciiname TEXT,
  alternatenames TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  feature_class TEXT,
  feature_code TEXT,
  country_code TEXT,
  admin1 TEXT,
  population BIGINT,
  timezone TEXT,
  modification_date DATE
);
```

**Essential Indexes:**
```sql
CREATE INDEX IF NOT EXISTS cities_name_idx ON cities(name);
CREATE INDEX IF NOT EXISTS cities_asciiname_idx ON cities(asciiname);
CREATE INDEX IF NOT EXISTS cities_lat_lng_idx ON cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS cities_name_trgm ON cities USING gin (name gin_trgm_ops);
```

### 3. trips

Core trip information.

```sql
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);
```

### 4. trip_members

Trip participation management with roles.

```sql
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','partner')),
  status TEXT CHECK (status IN ('active','left')),
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(trip_id, user_id)
);
```

**Key Rules:**
- `owner` cannot leave a trip
- `partner` can leave a trip
- Deleting a trip cascades to delete all members

### 5. trip_items

Trip locations/items management.

```sql
CREATE TABLE IF NOT EXISTS public.trip_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_id BIGINT REFERENCES cities(geonameid),
  order_index INTEGER,
  note TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### 6. comments

Trip comments and replies.

```sql
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### 7. trip_likes

Trip likes management.

```sql
CREATE TABLE IF NOT EXISTS public.trip_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(trip_id, user_id)
);
```

### 8. friendships

User friendships management.

```sql
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);
```

## Row Level Security (RLS) Policies

### Profiles

```sql
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Trips

```sql
CREATE POLICY "Public trips are viewable by everyone"
  ON public.trips FOR SELECT
  USING (is_public = true OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trips.id
    AND trip_members.user_id = auth.uid()
    AND trip_members.status = 'active'
  ));

CREATE POLICY "Users can create their own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Trip owners and active partners can update trips"
  ON public.trips FOR UPDATE
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trips.id
    AND trip_members.user_id = auth.uid()
    AND trip_members.role IN ('owner', 'partner')
    AND trip_members.status = 'active'
  ));

CREATE POLICY "Only trip owners can delete trips"
  ON public.trips FOR DELETE
  USING (owner_id = auth.uid());
```

### Trip Members

```sql
CREATE POLICY "Trip members are viewable by trip participants"
  ON public.trip_members FOR SELECT
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Trip owners can manage members"
  ON public.trip_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = trip_members.trip_id
    AND owner_id = auth.uid()
  ));

CREATE POLICY "Trip members can update their status"
  ON public.trip_members FOR UPDATE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = trip_members.trip_id
    AND owner_id = auth.uid()
  ));
```

### Trip Items

```sql
CREATE POLICY "Trip items are viewable by trip participants"
  ON public.trip_items FOR SELECT
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE is_public = true OR owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Trip participants can create items"
  ON public.trip_items FOR INSERT
  WITH CHECK (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Trip participants can update items"
  ON public.trip_items FOR UPDATE
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));
```

### Comments

```sql
CREATE POLICY "Comments on public trips are viewable by everyone"
  ON public.comments FOR SELECT
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE is_public = true OR owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Users can create comments on trips they participate in"
  ON public.comments FOR INSERT
  WITH CHECK (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid());
```

### Trip Likes

```sql
CREATE POLICY "Trip likes are viewable by everyone"
  ON public.trip_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.trip_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
  ON public.trip_likes FOR DELETE
  USING (user_id = auth.uid());
```

### Friendships

```sql
CREATE POLICY "Friendships are viewable by involved users"
  ON public.friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own friend requests"
  ON public.friendships FOR UPDATE
  USING (addressee_id = auth.uid());
```

### Cities

```sql
CREATE POLICY "Cities are viewable by everyone"
  ON public.cities FOR SELECT
  USING (true);
```

## RPC Functions

### get_profile_by_username

```sql
DROP FUNCTION IF EXISTS public.get_profile_by_username(TEXT);
CREATE FUNCTION public.get_profile_by_username(username TEXT)
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.profiles WHERE username = get_profile_by_username.username;
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_by_username(TEXT) TO authenticated;
```

### discover_city

```sql
CREATE OR REPLACE FUNCTION public.discover_city()
RETURNS SETOF public.cities
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM cities
  WHERE geonameid >= (
    SELECT floor(random() * (SELECT max(geonameid) FROM cities))
  )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.discover_city() TO authenticated;
GRANT EXECUTE ON FUNCTION public.discover_city() TO anon;
```

## Views

### trips_with_members

```sql
CREATE OR REPLACE VIEW public.trips_with_members AS
SELECT
  t.*,
  COUNT(tm.id) FILTER (WHERE tm.status = 'active') AS member_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'role', tm.role
    )
  ) FILTER (WHERE tm.status = 'active') AS members
FROM public.trips t
LEFT JOIN public.trip_members tm ON t.id = tm.trip_id
LEFT JOIN public.profiles p ON tm.user_id = p.id
GROUP BY t.id
ORDER BY t.created_at DESC;
```

## Migration Script

### Full Schema Migration

```sql
-- ============================================
-- wocon Database Schema Update for Supabase
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm extension for better search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- CLEANUP (MOVE TO FRONT)
-- ============================================

-- Drop old views BEFORE altering tables they depend on
DROP VIEW IF EXISTS public.trips_with_participants;
DROP VIEW IF EXISTS public.user_friends;

-- Drop old tables if they exist
DROP TABLE IF EXISTS public.trip_participants CASCADE;
DROP TABLE IF EXISTS public.map_markers CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;

-- Drop old functions if they exist
DROP FUNCTION IF EXISTS public.search_cities(TEXT);

-- ============================================
-- PROFILES TABLE (UPDATE)
-- ============================================
-- Remove unnecessary columns if they exist
DO $$
BEGIN
  -- Remove score if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'score'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN score CASCADE;
  END IF;
  
  -- Remove bio if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN bio CASCADE;
  END IF;
  
  -- Remove email if exists (email should come from auth.users)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN email CASCADE;
  END IF;
  
  -- Ensure avatar_url exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  -- Remove updated_at if exists (not in new schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN updated_at CASCADE;
  END IF;
END $$;

-- ============================================
-- CITIES TABLE (CREATE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cities (
  geonameid BIGINT PRIMARY KEY,
  name TEXT,
  asciiname TEXT,
  alternatenames TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  feature_class TEXT,
  feature_code TEXT,
  country_code TEXT,
  admin1 TEXT,
  population BIGINT,
  timezone TEXT,
  modification_date DATE
);

-- Create indexes for cities
CREATE INDEX IF NOT EXISTS cities_name_idx ON cities(name);
CREATE INDEX IF NOT EXISTS cities_asciiname_idx ON cities(asciiname);
CREATE INDEX IF NOT EXISTS cities_lat_lng_idx ON cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS cities_name_trgm ON cities USING gin (name gin_trgm_ops);

-- Enable RLS for cities (read-only)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policy for cities
CREATE POLICY "Cities are viewable by everyone"
  ON public.cities FOR SELECT
  USING (true);

-- ============================================
-- TRIPS TABLE (UPDATE)
-- ============================================
-- Rename name to title
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'title'
  ) THEN
    ALTER TABLE public.trips RENAME COLUMN name TO title;
  END IF;
  
  -- Remove unnecessary columns with CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.trips DROP COLUMN description CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.trips DROP COLUMN type CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE public.trips DROP COLUMN max_participants CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE public.trips DROP COLUMN cover_image_url CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.trips DROP COLUMN updated_at CASCADE;
  END IF;
END $$;

-- Drop existing RLS policies for trips (will recreate later)
DROP POLICY IF EXISTS "Public trips are viewable by everyone" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;

-- ============================================
-- TRIP_MEMBERS TABLE (CREATE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','partner')),
  status TEXT CHECK (status IN ('active','left')),
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS trip_members_trip_idx ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS trip_members_user_idx ON trip_members(user_id);

-- ============================================
-- TRIP_ITEMS TABLE (CREATE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_id BIGINT REFERENCES cities(geonameid),
  order_index INTEGER,
  note TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS trip_items_trip_idx ON trip_items(trip_id);

-- ============================================
-- COMMENTS TABLE (CREATE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS comments_trip_idx ON comments(trip_id, created_at);

-- ============================================
-- TRIP_LIKES TABLE (CREATE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- ============================================
-- FRIENDSHIPS TABLE (CREATE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- ============================================
-- RLS POLICIES (AFTER ALL TABLES CREATED)
-- ============================================

-- Enable RLS for all tables
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Trips RLS policies
CREATE POLICY "Public trips are viewable by everyone"
  ON public.trips FOR SELECT
  USING (is_public = true OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trips.id
    AND trip_members.user_id = auth.uid()
    AND trip_members.status = 'active'
  ));

CREATE POLICY "Users can create their own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Trip owners and active partners can update trips"
  ON public.trips FOR UPDATE
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trips.id
    AND trip_members.user_id = auth.uid()
    AND trip_members.role IN ('owner', 'partner')
    AND trip_members.status = 'active'
  ));

CREATE POLICY "Only trip owners can delete trips"
  ON public.trips FOR DELETE
  USING (owner_id = auth.uid());

-- Trip members RLS policies
CREATE POLICY "Trip members are viewable by trip participants"
  ON public.trip_members FOR SELECT
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Trip owners can manage members"
  ON public.trip_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = trip_members.trip_id
    AND owner_id = auth.uid()
  ));

CREATE POLICY "Trip members can update their status"
  ON public.trip_members FOR UPDATE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = trip_members.trip_id
    AND owner_id = auth.uid()
  ));

-- Trip items RLS policies
CREATE POLICY "Trip items are viewable by trip participants"
  ON public.trip_items FOR SELECT
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE is_public = true OR owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Trip participants can create items"
  ON public.trip_items FOR INSERT
  WITH CHECK (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Trip participants can update items"
  ON public.trip_items FOR UPDATE
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

-- Comments RLS policies
CREATE POLICY "Comments on public trips are viewable by everyone"
  ON public.comments FOR SELECT
  USING (trip_id IN (
    SELECT id FROM public.trips
    WHERE is_public = true OR owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Users can create comments on trips they participate in"
  ON public.comments FOR INSERT
  WITH CHECK (trip_id IN (
    SELECT id FROM public.trips
    WHERE owner_id = auth.uid() OR id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  ));

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid());

-- Trip likes RLS policies
CREATE POLICY "Trip likes are viewable by everyone"
  ON public.trip_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.trip_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
  ON public.trip_likes FOR DELETE
  USING (user_id = auth.uid());

-- Friendships RLS policies
CREATE POLICY "Friendships are viewable by involved users"
  ON public.friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own friend requests"
  ON public.friendships FOR UPDATE
  USING (addressee_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Function to get profile by username
DROP FUNCTION IF EXISTS public.get_profile_by_username(TEXT);
CREATE FUNCTION public.get_profile_by_username(username TEXT)
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.profiles WHERE username = get_profile_by_username.username;
$$;

-- Function for discover functionality
CREATE OR REPLACE FUNCTION public.discover_city()
RETURNS SETOF public.cities
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM cities
  WHERE geonameid >= (
    SELECT floor(random() * (SELECT max(geonameid) FROM cities))
  )
  LIMIT 1;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_profile_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.discover_city() TO authenticated;
GRANT EXECUTE ON FUNCTION public.discover_city() TO anon;

-- ============================================
-- VIEWS
-- ============================================

-- View: Get trip with member count
CREATE OR REPLACE VIEW public.trips_with_members AS
SELECT
  t.*,
  COUNT(tm.id) FILTER (WHERE tm.status = 'active') AS member_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'role', tm.role
    )
  ) FILTER (WHERE tm.status = 'active') AS members
FROM public.trips t
LEFT JOIN public.trip_members tm ON t.id = tm.trip_id
LEFT JOIN public.profiles p ON tm.user_id = p.id
GROUP BY t.id
ORDER BY t.created_at DESC;
```

## Performance Strategies

### Essential Indexes

```sql
-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Trips
CREATE INDEX IF NOT EXISTS idx_trips_owner ON public.trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_public ON public.trips(is_public);

-- Trip Members
CREATE INDEX IF NOT EXISTS trip_members_trip_idx ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS trip_members_user_idx ON trip_members(user_id);

-- Trip Items
CREATE INDEX IF NOT EXISTS trip_items_trip_idx ON trip_items(trip_id);

-- Comments
CREATE INDEX IF NOT EXISTS comments_trip_idx ON comments(trip_id, created_at);

-- Cities
CREATE INDEX IF NOT EXISTS cities_name_idx ON cities(name);
CREATE INDEX IF NOT EXISTS cities_asciiname_idx ON cities(asciiname);
CREATE INDEX IF NOT EXISTS cities_lat_lng_idx ON cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS cities_name_trgm ON cities USING gin (name gin_trgm_ops);
```

### Discover Implementation

To optimize the discover functionality and avoid using `ORDER BY random()`, we use the following approach:

```sql
SELECT *
FROM cities
WHERE geonameid >= (
  SELECT floor(random() * (SELECT max(geonameid) FROM cities))
)
LIMIT 1;
```

## Data Consistency Rules

### User Deletion
- If user is an owner: trips are automatically deleted
- Cascading deletion of all related data

### Trip Membership
- Only update status to 'left' (do not delete records)
- Ensure unique constraints: `unique(trip_id, user_id)`

### Like System
- Ensure unique constraints: `unique(trip_id, user_id)`

### Username Uniqueness
- Ensure unique constraints: `unique(username)`

## Future Extensions

The schema is designed to support future extensions without major refactoring, including:

- Trip tags
- Trip images
- Trip statistics
- Ownership transfer
- Subscription-based features

## Migration Management

### Best Practices

1. **Version Control**: Store all migration scripts in the `supabase/migrations` directory
2. **Idempotent Operations**: Use `CREATE IF NOT EXISTS` and `DROP IF EXISTS`
3. **Dependency Management**: Ensure proper execution order (tables before policies)
4. **Testing**: Test migrations in staging environment before production
5. **Documentation**: Update this document whenever schema changes

### Rollback Strategy

For critical changes, maintain rollback scripts that revert to previous schema versions. This ensures the ability to quickly recover from unexpected issues.

## Conclusion

This comprehensive database schema document provides all necessary information for understanding, maintaining, and extending the Wocon database. By following the guidelines and using the provided migration scripts, new team members and AI assistants can seamlessly contribute to the project.

---

*Last updated: February 15, 2026*
