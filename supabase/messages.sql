-- ============================================================
-- Messagerie — Tables, index, RLS, Realtime, Trigger
-- Exécutez ce script dans l'éditeur SQL de Supabase.
-- ============================================================

-- ── Table : conversations ────────────────────────────────────────────────────
-- Chaque conversation relie exactement deux participants.
-- participant1_id est toujours l'UUID lexicographiquement inférieur,
-- ce qui garantit l'unicité de la paire côté client.

CREATE TABLE IF NOT EXISTS public.conversations (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_no_self_chat  CHECK (participant1_id <> participant2_id),
  CONSTRAINT conversations_unique_pair   UNIQUE (participant1_id, participant2_id)
);

-- ── Table : messages ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL CHECK (char_length(content) > 0),
  is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Index ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_conversations_p1         ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2         ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last       ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conv_time       ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread          ON public.messages(conversation_id, is_read) WHERE is_read = FALSE;

-- ── RLS : conversations ──────────────────────────────────────────────────────

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Each user sees only conversations they participate in.
-- UPDATE is intentionally absent: last_message_at is maintained exclusively by
-- the SECURITY DEFINER trigger update_conversation_on_message(), not by app code.
CREATE POLICY "Voir ses conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- A user may only create a conversation where they are one of the two participants;
-- prevents creating phantom conversations between two other users.
CREATE POLICY "Créer une conversation"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ── RLS : messages ───────────────────────────────────────────────────────────

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Only participants of a conversation may read its messages.
CREATE POLICY "Voir les messages de ses conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- sender_id must equal the inserting user AND the user must be a participant —
-- prevents sending a message impersonating the other party.
CREATE POLICY "Envoyer un message"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- USING allows any participant to access the row for update; WITH CHECK (sender_id
-- <> auth.uid()) ensures you can only mark the *other* person's messages as read,
-- not edit your own (the only mutable field is is_read).
CREATE POLICY "Marquer un message comme lu"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  )
  WITH CHECK (sender_id <> auth.uid());

-- ── Realtime ─────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ── Trigger : mise à jour du dernier message ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at      = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conv_on_message ON public.messages;
CREATE TRIGGER trg_update_conv_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();
