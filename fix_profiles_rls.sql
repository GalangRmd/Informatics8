-- Allow Admins to Delete Profiles
-- Ensure RLS is enabled
alter table profiles enable row level security;

-- Create policy for deletion if it doesn't exist
create policy "Admins can delete profiles data" on profiles
for delete using (auth.role() = 'authenticated');
