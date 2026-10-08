-- Development seed data. Fake accounts only; never put real people's data here.
-- Load after schema.sql and migrations:  mysql -u root practipro < database/seed.sql
--
-- Admin login:  admin@practipro.test / password

INSERT INTO `user` (`firstName`, `lastName`, `email`, `password`, `role`, `isActive`, `approved_at`)
VALUES ('Admin', 'User', 'admin@practipro.test', '$2y$10$XRSqK7vDoVf9fr2F.iFCbegbppemPNAmzjrBdt57nqL2LKGVyHvPu', 'admin', 1, NOW());
