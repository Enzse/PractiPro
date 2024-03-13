-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 13, 2024 at 11:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `betadb`
--

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `CompanyID` int(11) NOT NULL,
  `CompanyName` varchar(100) DEFAULT NULL,
  `Industry` varchar(100) DEFAULT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `ContactPerson` varchar(100) DEFAULT NULL,
  `ContactEmail` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `practicumadvisor`
--

CREATE TABLE `practicumadvisor` (
  `AdvisorID` int(11) NOT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Department` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `practicumsubmission`
--

CREATE TABLE `practicumsubmission` (
  `SubmissionID` int(11) NOT NULL,
  `SubmissionDate` date DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `Comments` text DEFAULT NULL,
  `FileAttachment` blob DEFAULT NULL,
  `StudentID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `code`, `name`) VALUES
(1, 'admin', 'Admin'),
(2, 'student', 'Student');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `StudentID` int(11) NOT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Program` varchar(100) DEFAULT NULL,
  `YearLevel` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `studentId` int(9) DEFAULT NULL,
  `program` varchar(20) DEFAULT NULL,
  `block` varchar(20) DEFAULT NULL,
  `year` int(2) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `firstName`, `lastName`, `studentId`, `program`, `block`, `year`, `email`, `phoneNumber`, `address`, `dateOfBirth`) VALUES
(2, 'Shawn Tyrone', 'Rada', 202211558, 'BSCS', 'D', 2, '202211558@gmail.com', '09255662628', 'Mabayuan', '0000-00-00'),
(3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_requirements`
--

CREATE TABLE `student_requirements` (
  `student_id` int(11) NOT NULL,
  `resume` tinyint(1) DEFAULT 0,
  `application_letter` tinyint(1) DEFAULT 0,
  `acceptance_letter` tinyint(1) DEFAULT 0,
  `endorsement_letter` tinyint(1) DEFAULT 0,
  `guardians_waiver` tinyint(1) DEFAULT 0,
  `vaccination_card` tinyint(1) DEFAULT 0,
  `barangay_clearance` tinyint(1) DEFAULT 0,
  `medical_certificate` tinyint(1) DEFAULT 0,
  `company_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_requirements`
--

INSERT INTO `student_requirements` (`student_id`, `resume`, `application_letter`, `acceptance_letter`, `endorsement_letter`, `guardians_waiver`, `vaccination_card`, `barangay_clearance`, `medical_certificate`, `company_name`) VALUES
(2, 1, 1, 1, 0, 0, 1, 0, 0, NULL),
(3, 0, 0, 0, 1, 1, 0, 0, 0, NULL),
(4, 0, 0, 0, 0, 0, 0, 0, 0, NULL),
(5, 0, 0, 0, 0, 0, 1, 0, 0, NULL),
(6, 0, 0, 0, 0, 0, 0, 0, 0, NULL),
(7, 0, 0, 0, 0, 0, 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `submission_id` int(11) NOT NULL,
  `submission_name` varchar(50) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_data` longblob DEFAULT NULL,
  `submitted` tinyint(1) DEFAULT 0,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`submission_id`, `submission_name`, `file_name`, `file_type`, `file_size`, `file_data`, `submitted`, `user_id`) VALUES
(39, 'Resume', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(40, 'ApplicationLetter', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(41, 'AcceptanceLetter', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(42, 'Parent\'s', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(43, 'VaccinationCard', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(44, 'BaranggayClearance', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(45, 'Resume', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(46, 'AcceptanceLetter', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(47, 'Resume', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(48, 'ApplicationLetter', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(49, 'AcceptanceLetter', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(50, 'EndorsementLetter', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(51, 'Parent\'s', 'ewan ko sayo.txt', 'txt', 0, '', 0, 2),
(52, 'Resume', 'ewan ko sayo.txt', 'txt', 0, '', 0, 3);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `firstName` varchar(30) NOT NULL,
  `lastName` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(30) NOT NULL,
  `role` varchar(10) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `firstName`, `lastName`, `email`, `password`, `role`, `isActive`) VALUES
(1, 'Denzel Manz', 'Perez', 'denztest@gmail.com', '123', 'admin', 1),
(2, 'Shawn Tyrone', 'Rada', 'shawnrada@gmail.com', '123', 'student', 1),
(3, 'RJ', 'Verceles', 'rj@gmail.com', '123', 'student', 1),
(4, 'Dominic', 'Molino', 'dom@gmail.com', '123', 'student', 1),
(5, 'Neon John', 'Quiroz', 'nj@gmail.com', '123', 'student', 1),
(6, 'James Joebel', 'Galang', 'james@gmail.com', '123', 'student', 1),
(7, 'Nicolas', 'Ching', 'nching@gmail.com', '123', 'student', 0);

--
-- Triggers `user`
--
DELIMITER $$
CREATE TRIGGER `delete_student_requirements` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF OLD.role = 'student' AND NEW.role != 'student' THEN
        DELETE FROM student_requirements WHERE student_id = OLD.id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `delete_students` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF OLD.role = 'student' AND NEW.role != 'student' THEN
        DELETE FROM students WHERE id = OLD.id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `insert_student_requirements` AFTER INSERT ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'student' THEN
        INSERT INTO student_requirements (student_id) VALUES (NEW.id);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `insert_students` AFTER INSERT ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'student' THEN
        INSERT INTO students (id) VALUES (NEW.id);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_student_requirements` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'student' AND OLD.role != 'student' THEN
        INSERT INTO student_requirements (student_id) VALUES (NEW.id);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_students` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    IF NEW.role = 'student' AND OLD.role != 'student' THEN
        INSERT INTO students (id) VALUES (NEW.id);
    END IF;
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`CompanyID`);

--
-- Indexes for table `practicumadvisor`
--
ALTER TABLE `practicumadvisor`
  ADD PRIMARY KEY (`AdvisorID`);

--
-- Indexes for table `practicumsubmission`
--
ALTER TABLE `practicumsubmission`
  ADD PRIMARY KEY (`SubmissionID`),
  ADD KEY `StudentID` (`StudentID`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`StudentID`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_requirements`
--
ALTER TABLE `student_requirements`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `practicumsubmission`
--
ALTER TABLE `practicumsubmission`
  ADD CONSTRAINT `practicumsubmission_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`id`) REFERENCES `user` (`id`);

--
-- Constraints for table `student_requirements`
--
ALTER TABLE `student_requirements`
  ADD CONSTRAINT `student_requirements_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
