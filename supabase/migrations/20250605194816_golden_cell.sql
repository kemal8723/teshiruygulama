-- Enable realtime for required tables
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table reviews;
alter publication supabase_realtime add table equipment;

-- Enable row level security
alter table submissions enable row level security;
alter table reviews enable row level security;
alter table equipment enable row level security;

-- Create policies for realtime
create policy "Enable read access for all users" on submissions for select using (true);
create policy "Enable read access for all users" on reviews for select using (true);
create policy "Enable read access for all users" on equipment for select using (true);