-- Uploaded files move from MEDIUMBLOB columns to files on disk (see
-- FileStorage). Each table gets a column for the file's path in storage.

ALTER TABLE `submissions` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `documentations` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `finalreports` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `war` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `student_war` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `dtr` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `supervisor_student_evaluations` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `student_seminar_certificates` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `file_size`;
ALTER TABLE `user_avatars` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `avatar`;
ALTER TABLE `company_logos` ADD COLUMN `file_path` VARCHAR(255) NULL DEFAULT NULL AFTER `avatar`;
