-- Seed initial badges for gamification
insert into public.badges (name, description, icon_name, category, requirement_type, requirement_value, experience_points, rarity) values
  -- Routes badges
  ('First Steps', 'Plan your first route', 'route', 'routes', 'routes_count', 1, 10, 'common'),
  ('Route Explorer', 'Plan 10 routes', 'map', 'routes', 'routes_count', 10, 50, 'common'),
  ('Navigation Master', 'Plan 50 routes', 'compass', 'routes', 'routes_count', 50, 200, 'rare'),
  ('City Navigator', 'Plan 100 routes', 'map-pin', 'routes', 'routes_count', 100, 500, 'epic'),
  
  -- Eco badges
  ('Eco Warrior', 'Save 10kg of CO2', 'leaf', 'eco', 'co2_saved', 10, 100, 'common'),
  ('Green Champion', 'Save 50kg of CO2', 'tree', 'eco', 'co2_saved', 50, 300, 'rare'),
  ('Planet Protector', 'Save 100kg of CO2', 'globe', 'eco', 'co2_saved', 100, 600, 'epic'),
  
  -- Time saver badges
  ('Time Saver', 'Save 60 minutes total', 'clock', 'routes', 'time_saved', 60, 50, 'common'),
  ('Efficiency Expert', 'Save 300 minutes total', 'zap', 'routes', 'time_saved', 300, 250, 'rare'),
  ('Time Master', 'Save 1000 minutes total', 'timer', 'routes', 'time_saved', 1000, 700, 'epic'),
  
  -- Distance badges
  ('Local Traveler', 'Travel 50km total', 'footprints', 'explorer', 'distance', 50, 50, 'common'),
  ('City Explorer', 'Travel 200km total', 'bike', 'explorer', 'distance', 200, 200, 'rare'),
  ('Urban Adventurer', 'Travel 500km total', 'train', 'explorer', 'distance', 500, 500, 'epic'),
  
  -- Special badges
  ('Early Adopter', 'Join MovilityAI', 'star', 'special', 'special', 1, 100, 'legendary'),
  ('Metro Lover', 'Use metro in 20 routes', 'train-front', 'special', 'special', 20, 150, 'rare'),
  ('Bus Champion', 'Use bus in 30 routes', 'bus', 'special', 'special', 30, 150, 'rare')
on conflict (name) do nothing;
