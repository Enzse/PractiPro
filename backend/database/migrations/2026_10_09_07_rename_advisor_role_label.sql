-- The app calls this role "Coordinator". Only the display name changes; the
-- code stays 'advisor' because it is stored in user.role.
UPDATE `role` SET `name` = 'Coordinator' WHERE `code` = 'advisor';
