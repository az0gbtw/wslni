-- order_messages: dedicated discussion thread per order
-- Run in Supabase SQL Editor after orders.sql

create table if not exists public.order_messages (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid references public.orders(id) on delete cascade not null,
  sender_id  uuid references public.profiles(id) not null,
  content    text not null,
  created_at timestamptz default now()
);

alter table public.order_messages enable row level security;

-- Only client and freelancer of the order can view its messages
create policy "Order parties can view order messages"
  on public.order_messages for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_messages.order_id
        and (orders.client_id = auth.uid() or orders.freelancer_id = auth.uid())
    )
  );

-- Only client and freelancer can insert, and only as themselves
create policy "Order parties can insert order messages"
  on public.order_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.orders
      where orders.id = order_messages.order_id
        and (orders.client_id = auth.uid() or orders.freelancer_id = auth.uid())
    )
  );

-- Enable Realtime
alter publication supabase_realtime add table public.order_messages;
