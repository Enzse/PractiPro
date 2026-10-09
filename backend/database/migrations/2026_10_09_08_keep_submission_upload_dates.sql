-- submissions.created_at was declared ON UPDATE CURRENT_TIMESTAMP, so every
-- update to a row (a coordinator approving it, or the move to file storage)
-- overwrote the date the file was uploaded. It now only gets set on insert.
ALTER TABLE `submissions`
  MODIFY `created_at` timestamp NOT NULL DEFAULT current_timestamp();
