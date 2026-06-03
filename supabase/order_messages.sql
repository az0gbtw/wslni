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

-- Only client and freelancer of the order can view its messages;
-- no other user (including other freelancers) can read order-scoped threads.
-- UPDATE and DELETE are intentionally absent — order messages are permanent.
create policy "Order parties can view order messages"
  on public.order_messages for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_messages.order_id
        and (orders.client_id = auth.uid() or orders.freelancer_id = auth.uid())
    )
  );

-- sender_id must equal the inserting user AND they must be a party to the order —
-- prevents impersonation and prevents outsiders from messaging into an order.
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
