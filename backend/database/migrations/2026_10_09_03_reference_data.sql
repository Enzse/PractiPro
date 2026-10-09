-- Reference data the application needs to work. schema.sql is structure only,
-- so a fresh install had empty role and department lists (and admins could not
-- change anyone's role). INSERT IGNORE leaves existing rows alone.

-- Roles: the codes are used by the code (backend Role, frontend Role type).
INSERT IGNORE INTO `role` (`id`, `code`, `name`) VALUES
    (1, 'admin', 'Admin'),
    (2, 'student', 'Student'),
    (3, 'advisor', 'Advisor'),
    (4, 'superadmin', 'Super Admin'),
    (5, 'supervisor', 'Practicum Supervisor');

-- The college's departments. Admins can add more later.
INSERT IGNORE INTO `departments` (`id`, `code`, `name`) VALUES
    (1, 'CCS', 'CCS'),
    (2, 'CEAS', 'CEAS'),
    (3, 'CHTM', 'CHTM'),
    (4, 'CAHS', 'CAHS'),
    (5, 'CBA', 'CBA');
