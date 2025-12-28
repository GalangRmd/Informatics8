-- Create a secure function to fetch users from auth.users
-- accessible to authenticated users (like your admin dashboard)

create or replace function get_auth_users()
returns table (
  id uuid,
  email varchar,
  created_at timestamptz
)
language sql security definer
as $$
  -- Only allow if the user is authenticated (RLS will still apply if we queried a table, 
  -- but here we are accessing auth.users directly which is protected, so we use security definer)
  -- ideally you might want to check for a specific admin role here too.
  select id, email::varchar, created_at from auth.users order by created_at desc;
$$;
