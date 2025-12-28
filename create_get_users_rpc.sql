-- FUNCTION 1: Get All Users
-- Returns id, email, created_at, last_sign_in_at from auth.users
create or replace function get_auth_users()
returns table (
  id uuid,
  email varchar,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql security definer
as $$
  select id, email::varchar, created_at, last_sign_in_at from auth.users order by created_at desc;
$$;

-- FUNCTION 2: Delete User
-- Deletes a user from auth.users by ID
-- CRITICAL: This bypasses standard safeguards. Ensure only admins can call this (RLS policy on app side or restricted access).
create or replace function delete_auth_user(user_id uuid)
returns void
language plpgsql security definer
as $$
begin
  delete from auth.users where id = user_id;
end;
$$;
