-- create-comments.sql
CREATE TABLE IF NOT EXISTS public.comments (
  comment_id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  account_id INT NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) >= 3 AND char_length(comment_text) <= 2000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_vehicle_id ON public.comments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_comments_account_id ON public.comments(account_id);
