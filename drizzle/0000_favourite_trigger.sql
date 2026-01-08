CREATE OR REPLACE FUNCTION decrement_favourite_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tm_routes 
  SET route_favourite_count = GREATEST(route_favourite_count - 1, 0)
  WHERE route_id = OLD.route_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER favourite_deleted_trigger
BEFORE DELETE ON tm_favourites
FOR EACH ROW
EXECUTE FUNCTION decrement_favourite_count_on_delete();
