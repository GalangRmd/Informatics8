-- Drop valid functions to ensure clean slate (optional)
drop function if exists get_auth_users();

-- FUNCTION 1: Get All Users
create or replace function get_auth_users()
returns table (
  id uuid,
  email varchar,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql security definer
set search_path = public
as $$
  select id, email::varchar, created_at, last_sign_in_at from auth.users order by created_at desc;
$$;

-- Grant access to authenticated users (Crucial for Client API access)
grant execute on function get_auth_users() to authenticated;
grant execute on function get_auth_users() to service_role;


-- FUNCTION 2: Delete User
create or replace function delete_auth_user(user_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  delete from auth.users where id = user_id;
end;
$$;

-- Grant access for delete
grant execute on function delete_auth_user(uuid) to authenticated;
grant execute on function delete_auth_user(uuid) to service_role;
