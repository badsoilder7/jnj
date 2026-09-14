-- Mana Proddatur: a shop directory. No products, inventory, orders or payments.
create schema if not exists private;

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name varchar(100) not null check (length(btrim(name)) >= 2),
  name_te varchar(100) not null default '',
  category text not null check (category in ('Footwear', 'Clothing', 'Mobiles', 'Groceries', 'Hardware', 'Home essentials', 'Stationery', 'Services')),
  description varchar(600) not null default '',
  description_te varchar(600) not null default '',
  tags varchar(50)[] not null default '{}' check (
    cardinality(tags) <= 30 and array_position(tags, null) is null
    and (cardinality(tags) = 0 or array_ndims(tags) = 1)
  ),
  locality varchar(100) not null check (length(btrim(locality)) >= 2),
  address varchar(300) not null check (length(btrim(address)) >= 5),
  postal_code text not null default '516360' check (postal_code = '516360'),
  landmark varchar(150) not null default '',
  hours varchar(150) not null default '',
  phone text check (phone ~ '^\+[1-9][0-9]{9,14}$'),
  whatsapp text check (whatsapp ~ '^[1-9][0-9]{9,14}$'),
  photo_path text check (photo_path is null or photo_path ~ (
    '^' || owner_id::text || '/' || id::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$'
  )),
  published boolean not null default false,
  status text not null default 'unconfirmed' check (status in ('open', 'closed', 'break', 'unconfirmed')),
  status_duration integer not null default 240 check (status_duration in (30, 60, 120, 240, 480, 720)),
  status_updated_at timestamptz,
  status_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shops_owner_idx on public.shops(owner_id);
create index shops_published_idx on public.shops(id) where published;

-- Timestamps come from Postgres; clients cannot backdate or extend confirmations.
create function private.stamp_shop_status() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.status_updated_at := case when new.status = 'unconfirmed' then null else statement_timestamp() end;
  new.status_expires_at := case when new.status in ('open', 'break')
    then statement_timestamp() + make_interval(mins => new.status_duration) else null end;
  return new;
end;
$$;
revoke all on function private.stamp_shop_status() from public, anon, authenticated;
create trigger stamp_shop_status before insert or update of status, status_duration on public.shops
for each row execute function private.stamp_shop_status();

create function private.touch_shop() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;
revoke all on function private.touch_shop() from public, anon, authenticated;
create trigger touch_shop before update on public.shops for each row execute function private.touch_shop();

alter table public.shops enable row level security;
create policy published_shop_read on public.shops for select to anon, authenticated using (published);
create policy owner_shop_read on public.shops for select to authenticated using (owner_id = (select auth.uid()));
create policy owner_shop_insert on public.shops for insert to authenticated with check (owner_id = (select auth.uid()));
create policy owner_shop_update on public.shops for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- Explicit privileges are required for new Supabase projects. Publication, ownership,
-- IDs, postal code and timestamps are never writable by browser clients.
revoke all on public.shops from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select (id, name, name_te, category, description, description_te, tags, locality, address,
  landmark, hours, phone, whatsapp, photo_path, published, status, status_updated_at, status_expires_at)
  on public.shops to anon;
grant select on public.shops to authenticated;
grant insert (name, name_te, category, description, description_te, tags, locality, address, landmark, hours, phone, whatsapp)
  on public.shops to authenticated;
grant update (name, name_te, category, description, description_te, tags, locality, address, landmark, hours,
  phone, whatsapp, photo_path, status, status_duration) on public.shops to authenticated;
grant all on public.shops to service_role;

create function public.set_shop_status(shop_id uuid, new_status text, duration_minutes integer default 240)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Sign in to update a shop.' using errcode = '42501'; end if;
  if new_status not in ('open', 'closed', 'break') or new_status is null then
    raise exception 'Invalid shop status.' using errcode = '22023';
  end if;
  if duration_minutes not in (30, 60, 120, 240, 480, 720) or duration_minutes is null then
    raise exception 'Confirmation must be between 30 minutes and 12 hours.' using errcode = '22023';
  end if;
  update public.shops set status = $2, status_duration = $3 where id = $1 and owner_id = (select auth.uid());
  if not found then raise exception 'Shop not found for this owner.' using errcode = '42501'; end if;
end;
$$;
revoke all on function public.set_shop_status(uuid, text, integer) from public, anon;
grant execute on function public.set_shop_status(uuid, text, integer) to authenticated;

-- Images are public business photos. Only the owner of the matching shop may
-- upload or delete files under {user UUID}/{shop UUID}/{random UUID}.{extension}.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-photos', 'shop-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy owner_shop_photo_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'shop-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.shops s where s.id::text = (storage.foldername(storage.objects.name))[2] and s.owner_id = (select auth.uid()))
);
create policy owner_shop_photo_select on storage.objects for select to authenticated using (
  bucket_id = 'shop-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.shops s where s.id::text = (storage.foldername(storage.objects.name))[2] and s.owner_id = (select auth.uid()))
);
create policy owner_shop_photo_delete on storage.objects for delete to authenticated using (
  bucket_id = 'shop-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.shops s where s.id::text = (storage.foldername(storage.objects.name))[2] and s.owner_id = (select auth.uid()))
);
