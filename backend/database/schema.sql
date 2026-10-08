-- PractiPro database schema (structure only, no data).
-- Load into an empty database:
--   mysql -u root -e "CREATE DATABASE practipro CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
--   mysql -u root practipro < database/schema.sql


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `class_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_blocks` (
  `block_name` varchar(50) NOT NULL,
  `department` varchar(50) NOT NULL DEFAULT 'CCS',
  `course` varchar(50) NOT NULL,
  `year_level` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`block_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `class_join_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_join_invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `advisor_id` int(11) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `advisor_id` (`advisor_id`),
  KEY `class` (`class`),
  CONSTRAINT `class_join_invitations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `class_join_invitations_ibfk_2` FOREIGN KEY (`advisor_id`) REFERENCES `coordinators` (`id`),
  CONSTRAINT `class_join_invitations_ibfk_3` FOREIGN KEY (`class`) REFERENCES `class_blocks` (`block_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `class_join_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_join_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class` varchar(50) DEFAULT NULL,
  `join_token_hash` varchar(64) DEFAULT NULL,
  `join_token_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `join_token_hash` (`join_token_hash`),
  KEY `class` (`class`),
  CONSTRAINT `class_join_links_ibfk_1` FOREIGN KEY (`class`) REFERENCES `class_blocks` (`block_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `class_join_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_join_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_id` (`student_id`),
  KEY `class` (`class`),
  CONSTRAINT `class_join_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `class_join_requests_ibfk_2` FOREIGN KEY (`class`) REFERENCES `class_blocks` (`block_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `comments_documentation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_documentation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `comments_documentation_ibfk_1` (`file_id`),
  CONSTRAINT `comments_documentation_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `documentations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insertdocs` AFTER INSERT ON `comments_documentation` FOR EACH ROW BEGIN
    UPDATE documentations
    SET comments = (SELECT COUNT(*) FROM comments_documentation WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_updatedocs` AFTER UPDATE ON `comments_documentation` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE documentations
        SET comments = (SELECT COUNT(*) FROM comments_documentation WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE documentations
        SET comments = (SELECT COUNT(*) FROM comments_documentation WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE documentations
        SET comments = (SELECT COUNT(*) FROM comments_documentation WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_deletedocs` AFTER DELETE ON `comments_documentation` FOR EACH ROW BEGIN
    UPDATE documentations
    SET comments = (SELECT COUNT(*) FROM comments_documentation WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `comments_dtr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_dtr` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `comments_dtr_ibfk_1` (`file_id`),
  CONSTRAINT `comments_dtr_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `dtr` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insertdtr` AFTER INSERT ON `comments_dtr` FOR EACH ROW BEGIN
    UPDATE dtr
    SET comments = (SELECT COUNT(*) FROM comments_dtr WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_updatedtr` AFTER UPDATE ON `comments_dtr` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE dtr
        SET comments = (SELECT COUNT(*) FROM comments_dtr WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE dtr
        SET comments = (SELECT COUNT(*) FROM comments_dtr WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE dtr
        SET comments = (SELECT COUNT(*) FROM comments_dtr WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_deletedtr` AFTER DELETE ON `comments_dtr` FOR EACH ROW BEGIN
    UPDATE dtr
    SET comments = (SELECT COUNT(*) FROM comments_dtr WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `comments_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ibfk_evaluations_file_id` (`file_id`),
  CONSTRAINT `ibfk_evaluations_file_id` FOREIGN KEY (`file_id`) REFERENCES `supervisor_student_evaluations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insertev` AFTER INSERT ON `comments_evaluations` FOR EACH ROW BEGIN
    UPDATE supervisor_student_evaluations
    SET comments = (SELECT COUNT(*) FROM comments_evaluations WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_updateev` AFTER UPDATE ON `comments_evaluations` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE supervisor_student_evaluations
        SET comments = (SELECT COUNT(*) FROM comments_evaluations WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE supervisor_student_evaluations
        SET comments = (SELECT COUNT(*) FROM comments_evaluations WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE supervisor_student_evaluations
        SET comments = (SELECT COUNT(*) FROM comments_evaluations WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_deleteev` AFTER DELETE ON `comments_evaluations` FOR EACH ROW BEGIN
    UPDATE supervisor_student_evaluations
    SET comments = (SELECT COUNT(*) FROM comments_evaluations WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `comments_finalreports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_finalreports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `comments_finalreports_ibfk_1` (`file_id`),
  CONSTRAINT `comments_finalreports_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `finalreports` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insertfr` AFTER INSERT ON `comments_finalreports` FOR EACH ROW BEGIN
    UPDATE finalreports
    SET comments = (SELECT COUNT(*) FROM comments_finalreports WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_updatefr` AFTER UPDATE ON `comments_finalreports` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE finalreports
        SET comments = (SELECT COUNT(*) FROM comments_finalreports WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE finalreports
        SET comments = (SELECT COUNT(*) FROM comments_finalreports WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE finalreports
        SET comments = (SELECT COUNT(*) FROM comments_finalreports WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_deletefr` AFTER DELETE ON `comments_finalreports` FOR EACH ROW BEGIN
    UPDATE finalreports
    SET comments = (SELECT COUNT(*) FROM comments_finalreports WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `comments_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `comments_requirements_ibfk_1` (`file_id`),
  CONSTRAINT `comments_requirements_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insert` AFTER INSERT ON `comments_requirements` FOR EACH ROW BEGIN
    UPDATE submissions
    SET comments = (SELECT COUNT(*) FROM comments_requirements WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_update` AFTER UPDATE ON `comments_requirements` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE submissions
        SET comments = (SELECT COUNT(*) FROM comments_requirements WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE submissions
        SET comments = (SELECT COUNT(*) FROM comments_requirements WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE submissions
        SET comments = (SELECT COUNT(*) FROM comments_requirements WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_delete` AFTER DELETE ON `comments_requirements` FOR EACH ROW BEGIN
    UPDATE submissions
    SET comments = (SELECT COUNT(*) FROM comments_requirements WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `comments_seminar_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_seminar_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `file_id` (`file_id`),
  CONSTRAINT `comments_seminar_records_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `student_seminar_records` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insertsr` AFTER INSERT ON `comments_seminar_records` FOR EACH ROW BEGIN
    UPDATE student_seminar_records
    SET comments = (SELECT COUNT(*) FROM comments_seminar_records WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_updatesr` AFTER UPDATE ON `comments_seminar_records` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE student_seminar_records
        SET comments = (SELECT COUNT(*) FROM comments_seminar_records WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE student_seminar_records
        SET comments = (SELECT COUNT(*) FROM comments_seminar_records WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE student_seminar_records
        SET comments = (SELECT COUNT(*) FROM comments_seminar_records WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_deletesr` AFTER DELETE ON `comments_seminar_records` FOR EACH ROW BEGIN
    UPDATE student_seminar_records
    SET comments = (SELECT COUNT(*) FROM comments_seminar_records WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `comments_war`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments_war` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `commenter` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `comments_war_ibfk_1` (`file_id`),
  CONSTRAINT `comments_war_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `student_war_records` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_insertwar` AFTER INSERT ON `comments_war` FOR EACH ROW BEGIN
    UPDATE student_war_records
    SET comments = (SELECT COUNT(*) FROM comments_war WHERE file_id = NEW.file_id)
    WHERE id = NEW.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_updatewar` AFTER UPDATE ON `comments_war` FOR EACH ROW BEGIN
    IF NEW.file_id != OLD.file_id THEN
        -- Update old file_id
        UPDATE student_war_records
        SET comments = (SELECT COUNT(*) FROM comments_war WHERE file_id = OLD.file_id)
        WHERE id = OLD.file_id;
        -- Update new file_id
        UPDATE student_war_records
        SET comments = (SELECT COUNT(*) FROM comments_war WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    ELSE
        -- Update only new file_id
        UPDATE student_war_records
        SET comments = (SELECT COUNT(*) FROM comments_war WHERE file_id = NEW.file_id)
        WHERE id = NEW.file_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_comments_on_deletewar` AFTER DELETE ON `comments_war` FOR EACH ROW BEGIN
    UPDATE student_war_records
    SET comments = (SELECT COUNT(*) FROM comments_war WHERE file_id = OLD.file_id)
    WHERE id = OLD.file_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `company_hiring_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company_hiring_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `created_at` date DEFAULT curdate(),
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `student_id` (`student_id`),
  KEY `supervisor_id` (`supervisor_id`),
  CONSTRAINT `company_hiring_requests_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `industry_partners` (`id`),
  CONSTRAINT `company_hiring_requests_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `company_hiring_requests_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `company_logos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company_logos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `avatar` mediumblob DEFAULT NULL,
  `avatar_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `company_logos_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `industry_partners` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `coordinators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coordinators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_coordinator_id` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `documentations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remarks` tinyint(1) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `documentations_ibfk_1` (`user_id`),
  CONSTRAINT `documentations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dtr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dtr` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remarks` tinyint(1) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `dtr_ibfk_1` (`user_id`),
  CONSTRAINT `dtr_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `finalreports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `finalreports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remarks` tinyint(1) DEFAULT 0,
  `comments` tinyint(11) DEFAULT 0,
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `finalreports_ibfk_1` (`user_id`),
  CONSTRAINT `finalreports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `industry_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `industry_partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `company_ceo` varchar(50) DEFAULT NULL,
  `company_size` int(11) DEFAULT NULL,
  `industry` varchar(50) DEFAULT NULL,
  `scope_of_business` varchar(50) DEFAULT NULL,
  `it_equipment` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rl_class_coordinators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rl_class_coordinators` (
  `coordinator_id` int(11) NOT NULL,
  `block_name` varchar(50) NOT NULL,
  PRIMARY KEY (`coordinator_id`,`block_name`),
  KEY `rl_class_coordinators_ibfk_2` (`block_name`),
  CONSTRAINT `rl_class_coordinators_ibfk_1` FOREIGN KEY (`coordinator_id`) REFERENCES `coordinators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rl_class_coordinators_ibfk_2` FOREIGN KEY (`block_name`) REFERENCES `class_blocks` (`block_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rl_company_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rl_company_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `hired_by` int(11) DEFAULT NULL,
  `hire_date` date DEFAULT curdate(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student` (`student_id`),
  KEY `rl_company_students_ibfk_1` (`company_id`),
  KEY `rl_company_students_ibfk_3` (`hired_by`),
  CONSTRAINT `rl_company_students_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `industry_partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rl_company_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rl_company_students_ibfk_3` FOREIGN KEY (`hired_by`) REFERENCES `supervisors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rl_supervisor_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rl_supervisor_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supervisor_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_spv_std_student_id` (`student_id`),
  KEY `fk_spv_std_supervisor_id` (`supervisor_id`),
  CONSTRAINT `fk_spv_std_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_spv_std_supervisor_id` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`),
  CONSTRAINT `fk_supervisor_students_supervisor_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `rl_supervisor_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_dailytimerecords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_dailytimerecords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `totalHours` decimal(5,2) GENERATED ALWAYS AS (timestampdiff(MINUTE,`startTime`,`endTime`) / 60) VIRTUAL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_dailytimerecords_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_final_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_final_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `advisor_approval` varchar(50) DEFAULT 'Pending',
  `p1q1` enum('yes','no') DEFAULT NULL,
  `p1q2` enum('yes','no') DEFAULT NULL,
  `p1q3` enum('yes','no') DEFAULT NULL,
  `p1q4` enum('yes','no') DEFAULT NULL,
  `p1q5` enum('yes','no') DEFAULT NULL,
  `p1q6` enum('yes','no') DEFAULT NULL,
  `p1q7` enum('yes','no') DEFAULT NULL,
  `p1q7x1` enum('meal','cash') DEFAULT NULL,
  `p1q7x2` varchar(20) DEFAULT NULL,
  `p2q1` varchar(255) DEFAULT NULL,
  `p2q1x1` enum('0','25','50','75','100') DEFAULT NULL,
  `p2q2` varchar(255) DEFAULT NULL,
  `p2q2x1` enum('0','25','50','75','100') DEFAULT NULL,
  `p2q3` varchar(255) DEFAULT NULL,
  `p2q3x1` enum('0','25','50','75','100') DEFAULT NULL,
  `p2q4` varchar(255) DEFAULT NULL,
  `p2q4x1` enum('0','25','50','75','100') DEFAULT NULL,
  `p2q5` varchar(255) DEFAULT NULL,
  `p2q5x1` enum('0','25','50','75','100') DEFAULT NULL,
  `p3q1` enum('Excellent','Very Good','Good','Fair','Poor') DEFAULT NULL,
  `p4q1` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `student_final_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `job_title` varchar(64) DEFAULT NULL,
  `job_description` varchar(1000) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `student_jobs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `student_jobs_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `supervisors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_ojt_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_ojt_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `has_work` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_ojt_schedules_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_seminar_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_seminar_certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `record_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_seminar_certificates_ibfk_1` (`record_id`),
  CONSTRAINT `student_seminar_certificates_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `student_seminar_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER after_certificate_insert
AFTER INSERT ON student_seminar_certificates
FOR EACH ROW
BEGIN
    UPDATE student_seminar_records
    SET certified = 1
    WHERE id = NEW.record_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER after_certificate_delete
AFTER DELETE ON student_seminar_certificates
FOR EACH ROW
BEGIN
    DECLARE cert_count INT;
    -- Check if there are any remaining certificates for the seminar record
    SELECT COUNT(*) INTO cert_count
    FROM student_seminar_certificates
    WHERE record_id = OLD.record_id;

    -- If no remaining certificates, set certified to 0
    IF cert_count = 0 THEN
        UPDATE student_seminar_records
        SET certified = 0
        WHERE id = OLD.record_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `student_seminar_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_seminar_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `event_type` enum('Seminar','Webinar') NOT NULL,
  `duration` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `advisor_approval` enum('Pending','Approved','Unapproved') DEFAULT 'Pending',
  `comments` int(11) DEFAULT 0,
  `certified` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_seminar_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_supervisor_evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_supervisor_evaluation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supervisor_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `created_at` date DEFAULT curdate(),
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  `p1q1` enum('1','2','3','4','5') DEFAULT NULL,
  `p1q2` enum('1','2','3','4','5') DEFAULT NULL,
  `p1q3` enum('1','2','3','4','5') DEFAULT NULL,
  `p1q4` enum('1','2','3','4','5') DEFAULT NULL,
  `p1q5` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q1` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q2` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q3` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q4` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q5` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q6` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q7` enum('1','2','3','4','5') DEFAULT NULL,
  `p2q8` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q1` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q2` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q3` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q4` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q5` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q6` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q7` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q8` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q9` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q10` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q11` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q12` enum('1','2','3','4','5') DEFAULT NULL,
  `p3q13` enum('1','2','3','4','5') DEFAULT NULL,
  `p4q1` enum('Excellent','Very Good','Good','Fair','Poor') DEFAULT NULL,
  `p5q1` varchar(1000) DEFAULT NULL,
  `p5q2` varchar(1000) DEFAULT NULL,
  `p5q3` varchar(1000) DEFAULT NULL,
  `p5q4` varchar(1000) DEFAULT NULL,
  `p5q5` varchar(1000) DEFAULT NULL,
  `p5q6x1` enum('yes','no') DEFAULT NULL,
  `p5q6` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_supervisor_evaluation_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`),
  CONSTRAINT `student_supervisor_evaluation_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_war`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_war` (
  `id` int(11) NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remarks` tinyint(1) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `supervisor_approval` varchar(20) DEFAULT 'Pending',
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  KEY `student_war_fk` (`user_id`),
  CONSTRAINT `student_war_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_war_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_war_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `war_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `TotalHours` decimal(5,2) GENERATED ALWAYS AS (timestampdiff(MINUTE,`startTime`,`endTime`) / 60) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `student_war_activities_ibfk_1` (`war_id`),
  CONSTRAINT `student_war_activities_ibfk_1` FOREIGN KEY (`war_id`) REFERENCES `student_war_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `student_war_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_war_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `supervisor_approval` varchar(20) DEFAULT NULL,
  `advisor_approval` varchar(20) DEFAULT NULL,
  `dateSubmitted` datetime DEFAULT NULL,
  `isSubmitted` tinyint(4) DEFAULT 0,
  `comments` int(3) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `student_war_records_ibfk_1` (`user_id`),
  CONSTRAINT `student_war_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `studentId` int(9) DEFAULT NULL,
  `program` varchar(20) DEFAULT NULL,
  `year` int(2) DEFAULT NULL,
  `block` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_id` (`studentId`),
  KEY `fk_block` (`block`),
  CONSTRAINT `fk_block` FOREIGN KEY (`block`) REFERENCES `class_blocks` (`block_name`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_name` varchar(50) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `remarks` tinyint(1) DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comments` varchar(255) DEFAULT '0',
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `submissions_ibfk_1` (`user_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supervisor_student_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supervisor_student_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  `comments` tinyint(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sse_supervisor_ibfk` (`user_id`),
  KEY `sse_student_ibfk` (`student_id`),
  CONSTRAINT `sse_student_ibfk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `sse_supervisor_ibfk` FOREIGN KEY (`user_id`) REFERENCES `supervisors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supervisors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supervisors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_company_id` (`company_id`),
  CONSTRAINT `fk_company_id` FOREIGN KEY (`company_id`) REFERENCES `industry_partners` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(30) NOT NULL,
  `lastName` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'student',
  `isActive` tinyint(1) DEFAULT 0,
  `account_activation_hash` varchar(64) DEFAULT NULL,
  `reset_token_hash` varchar(64) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `reset_token_hash` (`reset_token_hash`),
  UNIQUE KEY `account_activation_hash` (`account_activation_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `insert_students` AFTER INSERT ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'student' THEN
        INSERT INTO students (id, firstName, lastName, email) VALUES (NEW.id, NEW.firstName, NEW.lastName, NEW.email);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `insert_coordinators` AFTER INSERT ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'advisor' THEN
        INSERT INTO coordinators (id, first_name, last_name, email) VALUES (NEW.id, NEW.firstName, NEW.lastName, NEW.email);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `insert_supervisors` AFTER INSERT ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'supervisor' THEN
        INSERT INTO supervisors (id, firstName, lastName, email) VALUES (NEW.id, NEW.firstName, NEW.lastName, NEW.email);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER delete_students AFTER UPDATE ON user
FOR EACH ROW
BEGIN
    IF OLD.role = 'student' AND NEW.role != 'student' THEN
        DELETE FROM students WHERE id = OLD.id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_students` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'student' AND OLD.role != 'student' THEN
        INSERT INTO students (id, firstName, lastName, email) VALUES (NEW.id, NEW.firstName, NEW.lastName, NEW.email);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_coordinators` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'advisor' AND OLD.role != 'advisor' THEN
        INSERT INTO coordinators (id, first_name, last_name, email) VALUES (NEW.id, NEW.firstName, NEW.lastName, NEW.email);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `delete_coordinators` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF OLD.role = 'advisor' AND NEW.role != 'advisor' THEN
        DELETE FROM coordinators WHERE id = OLD.id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `update_supervisors` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'supervisor' AND OLD.role != 'supervisor' THEN
        INSERT INTO supervisors (id, firstName, lastName, email) VALUES (NEW.id, NEW.firstName, NEW.lastName, NEW.email);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017*/ /*!50003 TRIGGER `delete_supervisors` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF OLD.role = 'supervisor' AND NEW.role != 'supervisor' THEN
        DELETE FROM supervisors WHERE id = OLD.id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `user_avatars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_avatars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `avatar` mediumblob DEFAULT NULL,
  `avatar_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_avatars_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `vw_block_pending_submissions`;
/*!50001 DROP VIEW IF EXISTS `vw_block_pending_submissions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_block_pending_submissions` AS SELECT
 1 AS `block_name`,
  1 AS `pending_req_count`,
  1 AS `pending_doc_count`,
  1 AS `pending_sem_count`,
  1 AS `pending_war_count_supervisor`,
  1 AS `pending_war_count_advisor`,
  1 AS `pending_frp_count`,
  1 AS `pending_sse_count` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `vw_class_profile`;
/*!50001 DROP VIEW IF EXISTS `vw_class_profile`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_class_profile` AS SELECT
 1 AS `block_name`,
  1 AS `department`,
  1 AS `course`,
  1 AS `year_level`,
  1 AS `students_handled`,
  1 AS `registered_students`,
  1 AS `hired_students`,
  1 AS `ojt_cleared_students`,
  1 AS `seminar_cleared_students`,
  1 AS `evaluation_cleared_students`,
  1 AS `exitpoll_cleared_students`,
  1 AS `practicum_completed_students`,
  1 AS `c_first_name`,
  1 AS `c_last_name` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `vw_company_profile`;
/*!50001 DROP VIEW IF EXISTS `vw_company_profile`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_company_profile` AS SELECT
 1 AS `id`,
  1 AS `company_name`,
  1 AS `address`,
  1 AS `company_ceo`,
  1 AS `company_size`,
  1 AS `industry`,
  1 AS `scope_of_business`,
  1 AS `it_equipment`,
  1 AS `students_handled`,
  1 AS `supervisors` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `vw_student_ojt_status`;
/*!50001 DROP VIEW IF EXISTS `vw_student_ojt_status`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_student_ojt_status` AS SELECT
 1 AS `id`,
  1 AS `firstName`,
  1 AS `lastName`,
  1 AS `studentId`,
  1 AS `program`,
  1 AS `year`,
  1 AS `block`,
  1 AS `email`,
  1 AS `phoneNumber`,
  1 AS `address`,
  1 AS `dateOfBirth`,
  1 AS `company_id`,
  1 AS `hire_date`,
  1 AS `company_name`,
  1 AS `job_title`,
  1 AS `TotalHoursWorked`,
  1 AS `TotalSeminarHours`,
  1 AS `clock_status`,
  1 AS `evaluation_status`,
  1 AS `exitpoll_status`,
  1 AS `registration_status` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `vw_student_pending_submissions`;
/*!50001 DROP VIEW IF EXISTS `vw_student_pending_submissions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_student_pending_submissions` AS SELECT
 1 AS `student_id`,
  1 AS `student_name`,
  1 AS `block`,
  1 AS `pending_req_count`,
  1 AS `pending_doc_count`,
  1 AS `pending_sem_count`,
  1 AS `pending_dtr_count`,
  1 AS `pending_war_count_supervisor`,
  1 AS `pending_war_count_advisor`,
  1 AS `pending_frp_count`,
  1 AS `pending_sse_count` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `vw_student_requirements`;
/*!50001 DROP VIEW IF EXISTS `vw_student_requirements`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_student_requirements` AS SELECT
 1 AS `student_id`,
  1 AS `firstName`,
  1 AS `lastName`,
  1 AS `resume`,
  1 AS `application_letter`,
  1 AS `acceptance_letter`,
  1 AS `endorsement_letter`,
  1 AS `guardians_waiver`,
  1 AS `vaccination_card`,
  1 AS `barangay_clearance`,
  1 AS `medical_certificate` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `war`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `war` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(100) DEFAULT NULL,
  `file_data` mediumblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remarks` tinyint(1) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `advisor_approval` varchar(20) DEFAULT 'Pending',
  `supervisor_approval` varchar(20) DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `war_ibfk_1` (`user_id`),
  CONSTRAINT `war_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50001 DROP VIEW IF EXISTS `vw_block_pending_submissions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `vw_block_pending_submissions` AS select `cb`.`block_name` AS `block_name`,count(distinct `req`.`id`) AS `pending_req_count`,count(distinct `doc`.`id`) AS `pending_doc_count`,count(distinct `sem`.`id`) AS `pending_sem_count`,count(distinct case when `war`.`supervisor_approval` = 'Pending' then `war`.`id` end) AS `pending_war_count_supervisor`,count(distinct case when `war`.`supervisor_approval` = 'Approved' and `war`.`advisor_approval` = 'Pending' then `war`.`id` end) AS `pending_war_count_advisor`,count(distinct `frp`.`id`) AS `pending_frp_count`,count(distinct `sse`.`id`) AS `pending_sse_count` from (((((((`students` `s` join `class_blocks` `cb` on(`s`.`block` = `cb`.`block_name`)) left join `submissions` `req` on(`s`.`id` = `req`.`user_id` and `req`.`advisor_approval` = 'Pending')) left join `student_war_records` `war` on(`s`.`id` = `war`.`user_id`)) left join `documentations` `doc` on(`s`.`id` = `doc`.`user_id` and `doc`.`advisor_approval` = 'Pending')) left join `student_seminar_records` `sem` on(`s`.`id` = `sem`.`student_id` and `sem`.`advisor_approval` = 'Pending')) left join `student_final_reports` `frp` on(`s`.`id` = `frp`.`user_id` and `frp`.`advisor_approval` = 'Pending')) left join `student_supervisor_evaluation` `sse` on(`s`.`id` = `sse`.`student_id` and `sse`.`advisor_approval` = 'Pending')) group by `cb`.`block_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `vw_class_profile`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `vw_class_profile` AS select `cb`.`block_name` AS `block_name`,`cb`.`department` AS `department`,`cb`.`course` AS `course`,`cb`.`year_level` AS `year_level`,count(distinct `st`.`id`) AS `students_handled`,count(distinct case when `sos`.`registration_status` = 1 then `sos`.`id` end) AS `registered_students`,count(distinct case when `sos`.`company_id` is not null then `sos`.`id` end) AS `hired_students`,count(distinct case when `sos`.`TotalHoursWorked` >= 200 then `sos`.`id` end) AS `ojt_cleared_students`,count(distinct case when `sos`.`TotalSeminarHours` >= 50 then `sos`.`id` end) AS `seminar_cleared_students`,count(distinct case when `sos`.`evaluation_status` = 'Completed!' then `sos`.`id` end) AS `evaluation_cleared_students`,count(distinct case when `sos`.`exitpoll_status` = 'Completed!' then `sos`.`id` end) AS `exitpoll_cleared_students`,count(distinct case when `sos`.`exitpoll_status` = 'Completed!' and `sos`.`evaluation_status` = 'Completed!' and `sos`.`TotalHoursWorked` >= 200 and `sos`.`TotalSeminarHours` >= 50 then `sos`.`id` end) AS `practicum_completed_students`,`c`.`first_name` AS `c_first_name`,`c`.`last_name` AS `c_last_name` from ((((`class_blocks` `cb` join `rl_class_coordinators` `cc` on(`cb`.`block_name` = `cc`.`block_name`)) join `coordinators` `c` on(`cc`.`coordinator_id` = `c`.`id`)) left join `students` `st` on(`cb`.`block_name` = `st`.`block`)) left join `vw_student_ojt_status` `sos` on(`sos`.`block` = `cb`.`block_name`)) group by `cb`.`block_name`,`c`.`first_name`,`c`.`last_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `vw_company_profile`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `vw_company_profile` AS select `ip`.`id` AS `id`,`ip`.`company_name` AS `company_name`,`ip`.`address` AS `address`,`ip`.`company_ceo` AS `company_ceo`,`ip`.`company_size` AS `company_size`,`ip`.`industry` AS `industry`,`ip`.`scope_of_business` AS `scope_of_business`,`ip`.`it_equipment` AS `it_equipment`,(select count(`cs`.`student_id`) from `rl_company_students` `cs` where `ip`.`id` = `cs`.`company_id`) AS `students_handled`,(select count(`s`.`id`) from `supervisors` `s` where `ip`.`id` = `s`.`company_id`) AS `supervisors` from `industry_partners` `ip` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `vw_student_ojt_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `vw_student_ojt_status` AS select `s`.`id` AS `id`,`s`.`firstName` AS `firstName`,`s`.`lastName` AS `lastName`,`s`.`studentId` AS `studentId`,`s`.`program` AS `program`,`s`.`year` AS `year`,`s`.`block` AS `block`,`s`.`email` AS `email`,`s`.`phoneNumber` AS `phoneNumber`,`s`.`address` AS `address`,`s`.`dateOfBirth` AS `dateOfBirth`,`cs`.`company_id` AS `company_id`,`cs`.`hire_date` AS `hire_date`,`ip`.`company_name` AS `company_name`,`sj`.`job_title` AS `job_title`,(select sum(`sd`.`totalHours`) from `student_dailytimerecords` `sd` where `s`.`id` = `sd`.`student_id` and `sd`.`status` = 'Approved') AS `TotalHoursWorked`,(select sum(`ssr`.`duration`) from `student_seminar_records` `ssr` where `s`.`id` = `ssr`.`student_id` and `ssr`.`advisor_approval` = 'Approved') AS `TotalSeminarHours`,case when exists(select 1 from `student_dailytimerecords` `sd` where `s`.`id` = `sd`.`student_id` and `sd`.`endTime` is null and `sd`.`date` = curdate() limit 1) then 'Clocked In' else 'Clocked Out' end AS `clock_status`,case when exists(select 1 from `student_supervisor_evaluation` `sse` where `s`.`id` = `sse`.`student_id` and `sse`.`advisor_approval` = 'Approved' limit 1) then 'Completed!' else 'Incomplete' end AS `evaluation_status`,case when exists(select 1 from `student_final_reports` `fr` where `s`.`id` = `fr`.`user_id` and `fr`.`advisor_approval` = 'Approved' limit 1) then 'Completed!' else 'Incomplete' end AS `exitpoll_status`,case when `sr`.`resume` = 1 and `sr`.`application_letter` = 1 and `sr`.`acceptance_letter` = 1 and `sr`.`endorsement_letter` = 1 and `sr`.`guardians_waiver` = 1 and `sr`.`vaccination_card` = 1 and `sr`.`barangay_clearance` = 1 and `sr`.`medical_certificate` = 1 then 1 else 0 end AS `registration_status` from ((((`students` `s` left join `rl_company_students` `cs` on(`s`.`id` = `cs`.`student_id`)) left join `industry_partners` `ip` on(`cs`.`company_id` = `ip`.`id`)) left join `student_jobs` `sj` on(`s`.`id` = `sj`.`student_id`)) left join `vw_student_requirements` `sr` on(`s`.`id` = `sr`.`student_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `vw_student_pending_submissions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `vw_student_pending_submissions` AS select `s`.`id` AS `student_id`,concat(`s`.`firstName`,' ',`s`.`lastName`) AS `student_name`,`s`.`block` AS `block`,count(distinct `req`.`id`) AS `pending_req_count`,count(distinct `doc`.`id`) AS `pending_doc_count`,count(distinct `sem`.`id`) AS `pending_sem_count`,count(distinct `dtr`.`id`) AS `pending_dtr_count`,count(distinct case when `war`.`supervisor_approval` = 'Pending' then `war`.`id` end) AS `pending_war_count_supervisor`,count(distinct case when `war`.`supervisor_approval` = 'Approved' and `war`.`advisor_approval` = 'Pending' then `war`.`id` end) AS `pending_war_count_advisor`,count(distinct `frp`.`id`) AS `pending_frp_count`,count(distinct `sse`.`id`) AS `pending_sse_count` from (((((((`students` `s` left join `submissions` `req` on(`s`.`id` = `req`.`user_id` and `req`.`advisor_approval` = 'Pending')) left join `student_war_records` `war` on(`s`.`id` = `war`.`user_id`)) left join `student_dailytimerecords` `dtr` on(`s`.`id` = `dtr`.`student_id` and `dtr`.`status` = 'Pending')) left join `documentations` `doc` on(`s`.`id` = `doc`.`user_id` and `doc`.`advisor_approval` = 'Pending')) left join `student_seminar_records` `sem` on(`s`.`id` = `sem`.`student_id` and `sem`.`advisor_approval` = 'Pending')) left join `student_final_reports` `frp` on(`s`.`id` = `frp`.`user_id` and `frp`.`advisor_approval` = 'Pending')) left join `student_supervisor_evaluation` `sse` on(`s`.`id` = `sse`.`student_id` and `sse`.`advisor_approval` = 'Pending')) group by `s`.`id`,`s`.`firstName`,`s`.`lastName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `vw_student_requirements`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `vw_student_requirements` AS select `s`.`id` AS `student_id`,`s`.`firstName` AS `firstName`,`s`.`lastName` AS `lastName`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'Resume' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `resume`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'ApplicationLetter' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `application_letter`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'AcceptanceLetter' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `acceptance_letter`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'EndorsementLetter' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `endorsement_letter`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'Parent\'s' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `guardians_waiver`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'VaccinationCard' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `vaccination_card`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'BarangayClearance' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `barangay_clearance`,case when exists(select 1 from `submissions` `rq` where `rq`.`user_id` = `s`.`id` and `rq`.`submission_name` = 'MedicalCertificate' and `rq`.`advisor_approval` = 'Approved' limit 1) then 1 else 0 end AS `medical_certificate` from `students` `s` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

