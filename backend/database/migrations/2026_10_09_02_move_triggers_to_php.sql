-- Business rules move from triggers into the PHP repositories, where they are
-- visible, testable and versioned with the rest of the code:
--   * profile rows for new accounts and role changes -> UserRepository
--   * comment counts on commented records            -> CommentRepository
--   * seminar records marked certified on upload     -> SeminarRepository

DROP TRIGGER IF EXISTS `insert_students`;
DROP TRIGGER IF EXISTS `insert_coordinators`;
DROP TRIGGER IF EXISTS `insert_supervisors`;
DROP TRIGGER IF EXISTS `update_students`;
DROP TRIGGER IF EXISTS `update_coordinators`;
DROP TRIGGER IF EXISTS `delete_coordinators`;
DROP TRIGGER IF EXISTS `update_supervisors`;
DROP TRIGGER IF EXISTS `delete_supervisors`;
DROP TRIGGER IF EXISTS `delete_students`;

DROP TRIGGER IF EXISTS `update_comments_on_insert`;
DROP TRIGGER IF EXISTS `update_comments_on_update`;
DROP TRIGGER IF EXISTS `update_comments_on_delete`;
DROP TRIGGER IF EXISTS `update_comments_on_insertdocs`;
DROP TRIGGER IF EXISTS `update_comments_on_updatedocs`;
DROP TRIGGER IF EXISTS `update_comments_on_deletedocs`;
DROP TRIGGER IF EXISTS `update_comments_on_insertdtr`;
DROP TRIGGER IF EXISTS `update_comments_on_updatedtr`;
DROP TRIGGER IF EXISTS `update_comments_on_deletedtr`;
DROP TRIGGER IF EXISTS `update_comments_on_insertev`;
DROP TRIGGER IF EXISTS `update_comments_on_updateev`;
DROP TRIGGER IF EXISTS `update_comments_on_deleteev`;
DROP TRIGGER IF EXISTS `update_comments_on_insertfr`;
DROP TRIGGER IF EXISTS `update_comments_on_updatefr`;
DROP TRIGGER IF EXISTS `update_comments_on_deletefr`;
DROP TRIGGER IF EXISTS `update_comments_on_insertsr`;
DROP TRIGGER IF EXISTS `update_comments_on_updatesr`;
DROP TRIGGER IF EXISTS `update_comments_on_deletesr`;
DROP TRIGGER IF EXISTS `update_comments_on_insertwar`;
DROP TRIGGER IF EXISTS `update_comments_on_updatewar`;
DROP TRIGGER IF EXISTS `update_comments_on_deletewar`;

DROP TRIGGER IF EXISTS `after_certificate_insert`;
DROP TRIGGER IF EXISTS `after_certificate_delete`;
