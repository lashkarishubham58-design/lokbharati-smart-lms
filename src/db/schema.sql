-- ====================================================================
-- Lokbharti University Smart Learning Management System (LMS) + ERP
-- Production MySQL Database Schema
-- Architecture: Normalized 3NF Schema with Foreign Keys & Indexes
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `lokbharti_lms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lokbharti_lms`;

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `hod_name` VARCHAR(100) DEFAULT NULL,
  `student_count` INT UNSIGNED DEFAULT 0,
  `faculty_count` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USERS TABLE (Students, Teachers, HODs, Admins)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'hod', 'admin') NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `semester` TINYINT UNSIGNED DEFAULT NULL,
  `enrollment_no` VARCHAR(50) DEFAULT NULL UNIQUE,
  `employee_id` VARCHAR(50) DEFAULT NULL UNIQUE,
  `designation` VARCHAR(100) DEFAULT NULL,
  `joining_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_users_role` ON `users` (`role`);
CREATE INDEX `idx_users_email` ON `users` (`email`);
CREATE INDEX `idx_users_enrollment` ON `users` (`enrollment_no`);

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `credits` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_subjects_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TIMETABLE TABLE
CREATE TABLE IF NOT EXISTS `timetables` (
  `id` VARCHAR(50) NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `start_time` VARCHAR(20) NOT NULL,
  `end_time` VARCHAR(20) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `teacher_id` VARCHAR(50) NOT NULL,
  `classroom` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tt_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_tt_lookup` ON `timetables` (`department_id`, `semester`, `day_of_week`);

-- 5. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` VARCHAR(50) NOT NULL,
  `timetable_slot_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `teacher_id` VARCHAR(50) NOT NULL,
  `classroom` VARCHAR(100) NOT NULL,
  `lecture_time` VARCHAR(50) NOT NULL,
  `is_submitted` TINYINT(1) DEFAULT 1,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attendance_slot_date` (`timetable_slot_id`, `date`),
  CONSTRAINT `fk_att_slot` FOREIGN KEY (`timetable_slot_id`) REFERENCES `timetables` (`id`),
  CONSTRAINT `fk_att_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ATTENDANCE STUDENT ENTRIES TABLE
CREATE TABLE IF NOT EXISTS `attendance_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attendance_record_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `status` ENUM('present', 'absent', 'late', 'leave') NOT NULL DEFAULT 'present',
  `remarks` VARCHAR(255) DEFAULT NULL,
  CONSTRAINT `fk_entry_record` FOREIGN KEY (`attendance_record_id`) REFERENCES `attendance_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entry_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_entry_student_status` ON `attendance_entries` (`student_id`, `status`);

-- 7. ATTENDANCE EDIT REQUESTS (HOD Approval Flow)
CREATE TABLE IF NOT EXISTS `attendance_edit_requests` (
  `id` VARCHAR(50) NOT NULL,
  `attendance_record_id` VARCHAR(50) NOT NULL,
  `teacher_id` VARCHAR(50) NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `hod_comment` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_edit_record` FOREIGN KEY (`attendance_record_id`) REFERENCES `attendance_records` (`id`),
  CONSTRAINT `fk_edit_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `teacher_id` VARCHAR(50) NOT NULL,
  `due_date` DATETIME NOT NULL,
  `total_marks` INT UNSIGNED DEFAULT 100,
  `attachment_url` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_asg_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_asg_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` VARCHAR(50) NOT NULL,
  `assignment_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `comments` TEXT DEFAULT NULL,
  `is_late` TINYINT(1) DEFAULT 0,
  `marks_obtained` INT UNSIGNED DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `status` ENUM('submitted', 'graded') DEFAULT 'submitted',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_submission` (`assignment_id`, `student_id`),
  CONSTRAINT `fk_sub_asg` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `teacher_id` VARCHAR(50) NOT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL,
  `total_marks` INT UNSIGNED NOT NULL,
  `due_date` DATETIME NOT NULL,
  `is_published` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_quiz_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` VARCHAR(50) NOT NULL,
  `quiz_id` VARCHAR(50) NOT NULL,
  `question` TEXT NOT NULL,
  `options_json` JSON NOT NULL,
  `correct_answer` TINYINT UNSIGNED NOT NULL,
  `explanation` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_q_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. QUIZ RESULTS
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` VARCHAR(50) NOT NULL,
  `quiz_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `score` INT UNSIGNED NOT NULL,
  `total_marks` INT UNSIGNED NOT NULL,
  `percentage` DECIMAL(5,2) NOT NULL,
  `completed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `time_taken_seconds` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_qr_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  CONSTRAINT `fk_qr_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS `study_materials` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` ENUM('pdf', 'ppt', 'video', 'link', 'doc') NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `department_id` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `uploaded_by` VARCHAR(50) NOT NULL,
  `download_count` INT UNSIGNED DEFAULT 0,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_mat_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_mat_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. NOTICES TABLE
CREATE TABLE IF NOT EXISTS `notices` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `category` ENUM('department', 'general', 'urgent', 'exam') NOT NULL,
  `department_id` VARCHAR(50) DEFAULT NULL,
  `posted_by` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `is_pinned` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notice_user` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(50) NOT NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed script notice
-- Full Lokbharti University schema initialized successfully.
