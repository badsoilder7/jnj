-- Run through the project's privileged SQL connection. All fixtures roll back.
-- No Auth emails are sent and no test accounts or shops are retained.
begin;
select set_config('mana_test.owner', gen_random_uuid()::text, true);
select set_config('mana_test.other', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('mana_test.owner')::uuid), (current_setting('mana_test.other')::uuid);
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('mana_test.owner'), true);
with added as (
  insert into public.shops(name, category, locality, address)
  values ('Temporary authorization check', 'Footwear', 'Test locality', 'Temporary test address') returning id
) select set_config('mana_test.shop', id::text, true) from added;
select public.set_shop_status(current_setting('mana_test.shop')::uuid, 'open', 60);
do $$
begin
  if not exists (select 1 from public.shops where id=current_setting('mana_test.shop')::uuid
      and owner_id=(select auth.uid()) and not published and status='open'
      and status_expires_at-status_updated_at=interval '1 hour') then
    raise exception 'Owner create/status check failed';
  end if;
  begin
    update public.shops set published=true where id=current_setting('mana_test.shop')::uuid;
    raise exception 'Unsafe owner publication privilege';
  exception when insufficient_privilege then null; end;
  begin
    update public.shops set status_expires_at=now()+interval '2 days' where id=current_setting('mana_test.shop')::uuid;
    raise exception 'Unsafe timestamp privilege';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', current_setting('mana_test.other'), true);
do $$
begin
  if exists (select 1 from public.shops where id=current_setting('mana_test.shop')::uuid) then
    raise exception 'Private shop leaked to another owner';
  end if;
  update public.shops set name='Unauthorized edit' where id=current_setting('mana_test.shop')::uuid;
  if found then raise exception 'Cross-owner editing allowed'; end if;
  begin
    perform public.set_shop_status(current_setting('mana_test.shop')::uuid, 'closed', 60);
    raise exception 'Cross-owner status update allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.shops set published=true where id=current_setting('mana_test.shop')::uuid;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  if not exists(select 1 from public.shops where id=current_setting('mana_test.shop')::uuid) then
    raise exception 'Published shop not readable anonymously';
  end if;
  begin
    perform owner_id from public.shops where id=current_setting('mana_test.shop')::uuid;
    raise exception 'Owner ID exposed anonymously';
  exception when insufficient_privilege then null; end;
  begin
    perform public.set_shop_status(current_setting('mana_test.shop')::uuid, 'closed', 60);
    raise exception 'Anonymous status update allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'passed; all temporary records rolled back' as hosted_authorization_checks;
