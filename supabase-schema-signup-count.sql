-- Run this in your Supabase SQL editor

-- Simple count for the public landing page counter
create or replace function get_signup_count()
returns bigint
language sql
security definer
as $$
  select count(*) from auth.users;
$$;

-- Detailed stats for the private admin dashboard
create or replace function get_signup_stats()
returns json
language sql
security definer
as $$
  select json_build_object(
    'total', (select count(*) from auth.users),
    'today', (select count(*) from auth.users where created_at >= current_date),
    'this_week', (select count(*) from auth.users where created_at >= date_trunc('week', now())),
    'this_month', (select count(*) from auth.users where created_at >= date_trunc('month', now())),
    'daily', (
      select json_agg(row_to_json(d)) from (
        select
          to_char(day, 'Mon DD') as label,
          count(u.id) as count
        from generate_series(
          current_date - interval '13 days',
          current_date,
          interval '1 day'
        ) as day
        left join auth.users u on u.created_at::date = day::date
        group by day
        order by day
      ) d
    )
  );
$$;
