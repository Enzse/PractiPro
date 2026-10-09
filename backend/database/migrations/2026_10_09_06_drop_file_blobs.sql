-- The previous migration copied every stored file to disk; the BLOB columns
-- are no longer used. Back up the database before running this on real data.

ALTER TABLE `submissions` DROP COLUMN `file_data`;
ALTER TABLE `documentations` DROP COLUMN `file_data`;
ALTER TABLE `finalreports` DROP COLUMN `file_data`;
ALTER TABLE `war` DROP COLUMN `file_data`;
ALTER TABLE `student_war` DROP COLUMN `file_data`;
ALTER TABLE `dtr` DROP COLUMN `file_data`;
ALTER TABLE `supervisor_student_evaluations` DROP COLUMN `file_data`;
ALTER TABLE `student_seminar_certificates` DROP COLUMN `file_data`;
ALTER TABLE `user_avatars` DROP COLUMN `avatar`, DROP COLUMN `avatar_link`;
ALTER TABLE `company_logos` DROP COLUMN `avatar`, DROP COLUMN `avatar_link`;
