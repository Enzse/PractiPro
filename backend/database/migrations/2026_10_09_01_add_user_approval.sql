-- Coordinator and supervisor accounts must be approved by an admin before
-- they can log in. NULL approved_at means "waiting for approval".

ALTER TABLE `user`
    ADD COLUMN `approved_at` DATETIME NULL DEFAULT NULL AFTER `isActive`,
    ADD COLUMN `approved_by` INT(11) NULL DEFAULT NULL AFTER `approved_at`,
    ADD CONSTRAINT `fk_user_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL;

-- Accounts that existed before approval was introduced are treated as approved.
UPDATE `user` SET `approved_at` = NOW();
