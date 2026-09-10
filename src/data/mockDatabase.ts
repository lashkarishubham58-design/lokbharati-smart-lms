import {
  User,
  UserRole,
  Department,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  AttendanceEditRequest,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizResult,
  StudentResult,
  StudyMaterial,
  Notice,
  AcademicEvent,
  NotificationItem,
  MessageThread,
  AuditLog,
  DeletedStudentRecord,
  StudentRequest
} from '../types/index';
import {
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  pruneStorageIfFull
} from '../utils/storage';
import { generateAlphabetAvatar } from '../utils/avatarUtils';

import {
  AVATAR_RAJENDRA_KHIMANI,
  AVATAR_BHAUTIK_LIMBANI,
  AVATAR_VISHAL_BHADANI,
  AVATAR_MITULGIRI_GAUSWAMI,
  AVATAR_SACHIN_DHOKIYA,
  AVATAR_RAMDEVSINH_GOHIL,
  AVATAR_MAYUR_SOLANKI,
  AVATAR_GHANSHYAM_HIRANI,
  AVATAR_CHIRAG_KANTARIYA,
  AVATAR_VIJAY_PADHARIYA,
  AVATAR_RISHU_RAJ,
  AVATAR_MAHAVIRSINH_PARMAR,
  AVATAR_KALARIA_RAJVEE,
  AVATAR_HIMANSHI_PARMAR,
  AVATAR_VALA_FEMI,
  AVATAR_SHRADDHA_VEGDA,
  AVATAR_MUKUND_KALSARIYA,
  AVATAR_PARESH_ZINZALA,
} from '../assets/avatars';

export const DEPARTMENTS: Department[] = [
  // --- BRS: Bachelor of Rural Studies ---
  {
    id: 'dept_brs_agronomy',
    code: 'BRS-AGRO',
    name: 'Agronomy',
    degreeCode: 'BRS',
    degreeFullName: 'Bachelor of Rural Studies',
    subDepartmentName: 'Agronomy',
    hodName: 'Prof. Ramesh Bhai Patel',
    studentCount: 73,
    facultyCount: 6,
    description: 'Crop science, seed technology, soil management, and sustainable organic farming techniques.',
  },
  {
    id: 'dept_brs_ahds',
    code: 'BRS-AHDS',
    name: 'Animal Husbandry & Dairy Science',
    degreeCode: 'BRS',
    degreeFullName: 'Bachelor of Rural Studies',
    subDepartmentName: 'Animal Husbandry & Dairy Science',
    hodName: 'Dr. Kirit Kumar Joshi',
    studentCount: 17,
    facultyCount: 2,
    description: 'Livestock management, organic milk processing, animal nutrition, and rural cattle welfare.',
  },
  {
    id: 'dept_brs_horti',
    code: 'BRS-HORT',
    name: 'Horticulture',
    degreeCode: 'BRS',
    degreeFullName: 'Bachelor of Rural Studies',
    subDepartmentName: 'Horticulture',
    hodName: 'Dr. Bhavna Chaudhari',
    studentCount: 7,
    facultyCount: 1,
    description: 'Fruit & vegetable production, floriculture, greenhouse cultivation, and nursery management.',
  },

  // --- B.Voc: Bachelor of Vocation (Bachelor of Vocational Studies) ---
  {
    id: 'dept_it',
    code: 'BVOC-IT',
    name: 'Information Technology',
    degreeCode: 'B.Voc',
    degreeFullName: 'Bachelor of Vocation (Bachelor of Vocational Studies)',
    subDepartmentName: 'Information Technology',
    hodName: 'Prof. Rishu Raj (HOD, IT)',
    studentCount: 6,
    facultyCount: 4,
    description: 'Applied software engineering, web architecture, cloud systems, and Google Workspace tool integration.',
  },
  {
    id: 'dept_bvoc_nf',
    code: 'BVOC-NF',
    name: 'Natural Farming',
    degreeCode: 'B.Voc',
    degreeFullName: 'Bachelor of Vocation (Bachelor of Vocational Studies)',
    subDepartmentName: 'Natural Farming',
    hodName: 'Dr. Sunita Parmar',
    studentCount: 19,
    facultyCount: 1,
    description: 'Zero-budget natural farming (ZBNF), bio-inputs, pest ecology, and soil organic carbon preservation.',
  },
  {
    id: 'dept_bvoc_afp',
    code: 'BVOC-AFP',
    name: 'Agro-Food Processing',
    degreeCode: 'B.Voc',
    degreeFullName: 'Bachelor of Vocation (Bachelor of Vocational Studies)',
    subDepartmentName: 'Agro-Food Processing',
    hodName: 'Dr. Mukund Bhai Patel',
    studentCount: 52,
    facultyCount: 2,
    description: 'Value addition to organic produce, food preservation technologies, quality assurance, and packaging.',
  },

  // --- BBA: Bachelor of Business Administration ---
  {
    id: 'dept_bba',
    code: 'BBA',
    name: 'Bachelor of Business Administration',
    degreeCode: 'BBA',
    degreeFullName: 'Bachelor of Business Administration',
    subDepartmentName: 'Business Administration',
    hodName: 'Dr. Ananya Desai',
    studentCount: 6,
    facultyCount: 3,
    description: 'Corporate management, agribusiness marketing, rural financial systems, entrepreneurship, and ethics.',
  },

  // --- B.A.: Bachelor of Arts ---
  {
    id: 'dept_ba_english',
    code: 'BA-ENG',
    name: 'B.A. English',
    degreeCode: 'B.A.',
    degreeFullName: 'Bachelor of Arts (B.A. English)',
    subDepartmentName: 'Department of English',
    hodName: 'Dr. H. M. Trivedi',
    studentCount: 5,
    facultyCount: 4,
    description: 'English literature, linguistics, communication skills, world literature, and creative writing.',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_provost_khimani',
    name: 'Dr. Rajendra Khimani',
    email: 'provost@lokbharatiuniversity.edu.in',
    role: 'admin',
    departmentId: 'dept_it',
    departmentName: 'Lokbharati University Administration',
    avatar: '',
    phone: '9054863117',
    employeeId: 'LBU-ADM-000',
    designation: 'Provost',
    qualification: 'Ph. D.',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Provost Office, Administrative Block',
    joiningDate: '2015-01-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_admin_vishal_bhadani',
    name: 'Dr. Vishal Bhadani',
    email: 'academicdirector@lokbharatiuniversity.edu.in',
    role: 'admin',
    departmentId: 'dept_it',
    departmentName: 'Academic Directorate & Administration',
    avatar: '',
    phone: '+91 94268 85387',
    employeeId: 'LBU-ADM-002',
    designation: 'Academic Director',
    qualification: 'Ph. D.',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Academic Directorate Building, Sanosara',
    joiningDate: '2018-01-01', password: 'Luri@123' },
  {
    id: 'usr_admin_bhautik_limbani',
    name: 'Dr. Bhautik Limbani',
    email: 'registrar@lokbharatiuniversity.edu.in',
    role: 'admin',
    departmentId: 'dept_humanities',
    departmentName: 'Department of English - School of Humanities and Social Science',
    avatar: AVATAR_BHAUTIK_LIMBANI,
    phone: '+91 98243 89739',
    employeeId: 'LBU-ADM-003',
    designation: 'Registrar in Charge',
    qualification: 'Ph.D.',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Registrar Office, Administrative Block, Sanosara',
    joiningDate: '2017-07-01', password: 'Luri@123' },
  {
    id: 'usr_hod_cs',
    name: 'Mr. Rishu Raj (HOD)',
    email: 'hod.it@lokbhartiuniversity.edu.in',
    role: 'hod',
    departmentId: 'dept_it',
    departmentName: 'Information Technology (B.Voc IT)',
    avatar: '',
    phone: '+91 87892 87630',
    employeeId: 'LBU-FAC-100',
    designation: 'Assistant Professor & Head',
    qualification: 'MCA',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'IT Block Room 101, Sanosara',
    joiningDate: '2018-08-15',
    password: 'Luri@123'
  },
  {
    id: 'usr_teacher_rishu',
    name: 'Mr. Rishu Raj',
    email: 'rishu.raj@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_it',
    departmentName: 'B. Voc. IT',
    avatar: '',
    phone: '8789287630',
    employeeId: 'LBU-FAC-100',
    designation: 'Assistant Professor & Head',
    qualification: 'MCA',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'IT Block Room 101, Sanosara',
    joiningDate: '2018-08-15',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_sachin_dhokiya',
    name: 'Mr. Sachin Dhokiya',
    email: 'sachin.dhokiya@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_agronomy',
    departmentName: 'School of Skills and Entrepreneurship',
    avatar: '',
    phone: '7698150835',
    employeeId: 'LBU-FAC-104',
    designation: 'Assistant Professor',
    qualification: 'MRS (Agronomy)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Skills & Entrepreneurship Block, Sanosara',
    joiningDate: '2021-08-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_chirag_kantariya',
    name: 'Mr. Chirag Kantariya',
    email: 'chirag.kantariya@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_bvoc_afp',
    departmentName: 'School of Skills and Entrepreneurship',
    avatar: '',
    phone: '09429381942',
    employeeId: 'LBU-FAC-105',
    designation: 'Assistant Professor',
    qualification: 'M.Sc Food Biotechnology',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Food Processing & Biotechnology Lab, Sanosara',
    joiningDate: '2021-08-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_ghanshyam_hirani',
    name: 'Mr. Ghanshyam Hirani',
    email: 'ghanshyam.hirani@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_agronomy',
    departmentName: 'School of Skills and Entrepreneurship',
    avatar: '',
    phone: '7096779672',
    employeeId: 'LBU-FAC-106',
    designation: 'Assistant Professor',
    qualification: 'MRS (Agronomy)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Skills & Entrepreneurship Block, Sanosara',
    joiningDate: '2020-07-15',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_ramdevsinh_gohil',
    name: 'Mr. Ramdevsinh Gohil',
    email: 'ramdevsinh.gohil@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_ahds',
    departmentName: 'Department of Animal Husbandry and Dairy Science – School of Skills and Entrepreneurship',
    avatar: '',
    phone: '9428994780',
    employeeId: 'LBU-FAC-107',
    designation: 'Assistant Professor',
    qualification: 'MRS',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Dairy Tech Complex, Sanosara',
    joiningDate: '2021-01-10',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_mayur_solanki',
    name: 'Dr. Mayur Solanki',
    email: 'mayur.solanki@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_horti',
    departmentName: 'School of Skills and Entrepreneurship',
    avatar: '',
    phone: '9723173774',
    employeeId: 'LBU-FAC-108',
    designation: 'Assistant Professor',
    qualification: 'MRS (Horticulture & Foresty)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Horticulture Research Block, Sanosara',
    joiningDate: '2020-06-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_paresh_zinzala',
    name: 'Dr. Paresh Zinzala',
    email: 'paresh.zinzala@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_bvoc_afp',
    departmentName: 'Department of Agro-Processing – School of Skills and Entrepreneurship',
    avatar: '',
    phone: '9537583109',
    employeeId: 'LBU-FAC-109',
    designation: 'Assistant Professor',
    qualification: 'Ph.D.',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Agro-Processing Unit, Sanosara',
    joiningDate: '2019-09-15',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_vijay_padhariya',
    name: 'Mr. Vijay Padhariya',
    email: 'vijay.padhariya@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_ahds',
    departmentName: 'School of Skills and Entrepreneurship',
    avatar: '',
    phone: '9558613134',
    employeeId: 'LBU-FAC-110',
    designation: 'Teacher Assistant',
    qualification: 'BRS (Animal Husbandry and Dairy Science) + MSW',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Skills & Extension Center, Sanosara',
    joiningDate: '2022-08-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_shraddha_vegda',
    name: 'Ms. Shraddha Vegda',
    email: 'shraddha.vegda@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_agronomy',
    departmentName: 'School of Skills and Entrepreneurship',
    avatar: '',
    phone: '6354893134',
    employeeId: 'LBU-FAC-111',
    designation: 'Assistant Professor',
    qualification: 'M.Sc. (Agri.) Agronomy',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Agronomy Research Wing, Sanosara',
    joiningDate: '2021-09-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_kalaria_rajvee',
    name: 'Miss. Kalaria Rajvee',
    email: 'rajvee.kalaria@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_bvoc_nf',
    departmentName: 'Natural Farming',
    avatar: '',
    phone: '8511563809',
    employeeId: 'LBU-FAC-112',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. Agronomy',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Natural Farming Research Center, Sanosara',
    joiningDate: '2021-03-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_himanshi_parmar',
    name: 'Miss. Himanshi Parmar',
    email: 'himanshi.parmar@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_ba_english',
    departmentName: 'Department of English – School of Humanities and Social Science',
    avatar: '',
    phone: '9537824655',
    employeeId: 'LBU-FAC-113',
    designation: 'Assistant Professor',
    qualification: 'M.A. (English)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Humanities & Social Sciences Block, Sanosara',
    joiningDate: '2022-07-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_vala_femi',
    name: 'Dr. Vala Femi',
    email: 'femi.vala@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_agronomy',
    departmentName: 'Department of Agronomy – School of Skills and Entrepreneurship',
    avatar: '',
    phone: '8530785635',
    employeeId: 'LBU-FAC-114',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. (Agronomy)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Agronomy & Applied Tech Lab, Sanosara',
    joiningDate: '2020-01-15',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_dhyan_patel',
    name: 'Mr. Dhyan Patel',
    email: 'dhyan.patel@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_brs_agronomy',
    departmentName: 'Department of Agronomy – School of Skills and Entrepreneurship',
    avatar: '',
    phone: '9316029801',
    employeeId: 'LBU-FAC-115',
    designation: 'Assistant Professor',
    qualification: 'M.R.S (Agronomy)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Agronomy Field Station, Sanosara',
    joiningDate: '2022-01-10',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_mitulgiri_gauswami',
    name: 'Mr. Mitulgiri Gauswami',
    email: 'mitulgiri.gauswami@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_it',
    departmentName: 'Information Technology, School of Skills and Entrepreneurship',
    avatar: '',
    phone: '9537777998',
    employeeId: 'LBU-FAC-101',
    designation: 'Assistant Professor',
    qualification: 'M.E., B.E.',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'IT Computer Lab 2, Sanosara',
    joiningDate: '2019-08-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_mahavirsinh_parmar',
    name: 'Mr. Mahavirsinh Parmar',
    email: 'mahavirsinh.parmar@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_bba',
    departmentName: 'Department of BBA',
    avatar: '',
    phone: '8000258008',
    employeeId: 'LBU-FAC-116',
    designation: 'Assistant Professor',
    qualification: 'MBA Marketing',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Department of BBA, Sanosara',
    joiningDate: '2018-06-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_bhautik_limbani',
    name: 'Dr. Bhautik Limbani',
    email: 'bhautik.limbani@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_ba_english',
    departmentName: 'Department of English – School of Humanities and Social Science',
    avatar: AVATAR_BHAUTIK_LIMBANI,
    phone: '+91 98254 77123',
    employeeId: 'LBU-FAC-118',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. (English Literature)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Humanities Block, Room 204, Sanosara',
    joiningDate: '2020-07-01',
    password: 'Luri@123'
  },
  {
    id: 'usr_fac_vishal_bhadani',
    name: 'Dr. Vishal Bhadani',
    email: 'vishal.bhadani@lokbharatiuniversity.edu.in',
    role: 'teacher',
    departmentId: 'dept_ba_english',
    departmentName: 'Department of English – School of Humanities and Social Science',
    avatar: '',
    phone: '+91 94280 11984',
    employeeId: 'LBU-FAC-119',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. (Comparative Literature & Linguistics)',
    address: 'Lokbharati University for Rural Innovation, Sanosara.',
    officeLocation: 'Humanities Block, Room 205, Sanosara',
    joiningDate: '2021-06-15',
    password: 'Luri@123'
  },

  // ==========================================
  // SEMESTER 3 STUDENTS (ACADEMIC YEAR 2026-27)
  // ==========================================

  // --- Department of Information Technology (B.Voc IT - Sem 03) ---
  { id: 'usr_st_it_301', name: 'Arpit Pratapbhai Makvana', email: 'Arpit.Makvana@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_it', departmentName: 'Information Technology', semester: 3, enrollmentNo: '25221103001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_it_302', name: 'Hardik Hareshbhai Chauhan', email: 'Hardik.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_it', departmentName: 'Information Technology', semester: 3, enrollmentNo: '25221103002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_it_304', name: 'Harshitaben Ketanbhai Kava', email: 'Harshitaben.Kava@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_it', departmentName: 'Information Technology', semester: 3, enrollmentNo: '25221103004', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_it_306', name: 'Nachiketa Hareshbhai Kargar', email: 'Nachiketa.Kargar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_it', departmentName: 'Information Technology', semester: 3, enrollmentNo: '25221103006', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_it_307', name: 'Naimish Vikrambhai Kerashiya', email: 'Naimish.Kerashiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_it', departmentName: 'Information Technology', semester: 3, enrollmentNo: '25221103007', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_it_310', name: 'Shubham Manojbhai Lashkari', email: 'Shubham.Lashkari@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_it', departmentName: 'Information Technology', semester: 3, enrollmentNo: '25221103010', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of Agro Food Processing (B.Voc AFP - Sem 03) ---
  { id: 'usr_st_afp_301', name: 'Akashbhai Bhupatbhai Dhapa', email: 'Akashbhai.Dhapa@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_302', name: 'Ankitbhai Mukeshbhai Zapadiya', email: 'Ankitbhai.Zapadiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_303', name: 'Arjunsinh Sureshbhai Rathod', email: 'Arjunsinh.Rathod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102003', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_304', name: 'Army Kamleshbhai Patel', email: 'Army.Patel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102004', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_305', name: 'Avleshbhai Rasikbhai Vala', email: 'Avleshbhai.Vala@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102005', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_306', name: 'Dev Manojbhai Dankhara', email: 'Dev.Dankhara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102006', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_307', name: 'Devvratsinh Jagdishbhai Chauhan', email: 'Devvratsinh.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102007', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_308', name: 'Jeet Pareshkumar Kotecha', email: 'Jeet.Kotecha@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102008', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_309', name: 'Kashyapkumar Vallabhbhai Ramani', email: 'Kashyapkumar.Ramani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102009', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_310', name: 'Krishaben Bhaveshbhai Limbani', email: 'Krishaben.Limbani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102010', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_311', name: 'Krutarthkumar Manjibhai Dihora', email: 'Krutarthkumar.Dihora@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102011', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_312', name: 'Mohamadfaraz Najmudin Badi', email: 'Mohamadfaraz.Badi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102012', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_313', name: 'Mufijhushen Ikbal Badi', email: 'Mufijhushen.Badi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102013', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_314', name: 'Pratham Mukeshbhai Shakoriya', email: 'Pratham.Shakoriya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102014', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_315', name: 'Prince Bhagavanji Khambhala', email: 'Prince.Khambhala@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102015', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_316', name: 'Prince Shaileshbhai Parmar', email: 'Prince.Parmar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102016', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_317', name: 'Rajubhai Kanabhai Kamaliya', email: 'Rajubhai.Kamaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102017', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_318', name: 'Rushitaben Kanjibhai Baraiya', email: 'Rushitaben.Baraiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102018', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_319', name: 'Safvan Nayarazak Badi', email: 'Safvan.Badi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102019', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_320', name: 'Sahil Gulammustufa Badi', email: 'Sahil.Badi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102020', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_321', name: 'Sajjadhushen Yunus Sherasiya', email: 'Sajjadhushen.Sherasiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102021', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_322', name: 'Seema Dhirubhai Jalondhara', email: 'Seema.Jalondhara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102022', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_323', name: 'Shubham Manishbhai Rathod', email: 'Shubham.Rathod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102023', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_324', name: 'Takshkumar Chaturbhai Zampadiya', email: 'Takshkumar.Zampadiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102024', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_325', name: 'Tirth Jitubhai Vaghani', email: 'Tirth.Vaghani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102025', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_326', name: 'Vishal Kalubhai Dekani', email: 'Vishal.Dekani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102026', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_327', name: 'Yug Vijaybhai Tarapara', email: 'Yug.Tarapara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102027', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_328', name: 'Bhagirath Nagbhai Faga', email: 'Bhagirath.Faga@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 3, enrollmentNo: '25221102028', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of Natural Farming (B.Voc NF - Sem 03) ---
  { id: 'usr_st_nf_301', name: 'Arjunsinh Khodubha Gohil', email: 'Arjunsinh.Gohil@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_302', name: 'Akshay Dalsukhbhai Jamod', email: 'Akshay.Jamod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_304', name: 'Jaydattsinh Jaydipsinh Rana', email: 'Jaydattsinh.Rana@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101004', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_305', name: 'Kuldip Bhurabhai Humbal', email: 'Kuldip.Humbal@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101005', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_306', name: 'Parth Jethurbhai Bhukan', email: 'Parth.Bhukan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101006', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_307', name: 'Rajvir Kanubhai Mobh', email: 'Rajvir.Mobh@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101007', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_308', name: 'Ruturaj Bhupatbhai Rathod', email: 'Ruturaj.Rathod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101008', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_309', name: 'Smit Aniruddhbhai Malani', email: 'Smit.Malani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101009', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_310', name: 'Smit Kishorbhai Ranva', email: 'Smit.Ranva@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101010', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_311', name: 'Sunil Ashokbhai Dabhi', email: 'Sunil.Dabhi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101011', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_314', name: 'Jayvirbhai Hanubhai Khuman', email: 'Jayvirbhai.Khuman@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 3, enrollmentNo: '25221101014', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of Animal Husbandry & Dairy Science (B.R.S. AHDS - Sem 03) ---
  { id: 'usr_st_ahds_302', name: 'Jaykrishna Ramabalakdasji Sadhu', email: 'Jaykrishna.Sadhu@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_303', name: 'Jenilbhai Govindbhai Sambad', email: 'Jenilbhai.Sambad@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202003', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_304', name: 'Milan Ghanshyambhai Mankoliya', email: 'Milan.Mankoliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202004', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_305', name: 'Om Alpansubhai Dave', email: 'Om.Dave@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202005', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_306', name: 'Piyushkumar Shambhubhai Goyal', email: 'Piyushkumar.Goyal@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202006', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_307', name: 'Vijay Bhaveshbhai Dekani', email: 'Vijay.Dekani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202007', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_308', name: 'Hardikbhai Arajanbhai Ragya', email: 'Hardikbhai.Ragya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 3, enrollmentNo: '25222202008', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of Agronomy (B.R.S. Agronomy - Sem 03) ---
  { id: 'usr_st_agro_301', name: 'Amit Bholabhai Gohel', email: 'Amit.Gohel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_302', name: 'Anil Mukeshbhai Pancholiya', email: 'Anil.Pancholiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_303', name: 'Anirudhdh Sureshbhai Chauhan', email: 'Anirudhdh.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201003', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_304', name: 'Darshankumar Devarajbhai Solamiya', email: 'Darshankumar.Solamiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201004', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_306', name: 'Dhruvkumar Hareshbhai Patel', email: 'Dhruvkumar.Patel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201006', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_307', name: 'Dhruvrajsinh Jitendrasinh Jadeja', email: 'Dhruvrajsinh.Jadeja@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201007', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_308', name: 'Digvijay Hasmukhbhai Kateshiya', email: 'Digvijay.Kateshiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201008', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_310', name: 'Hinaben Amrutbhai Parmar', email: 'Hinaben.Parmar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201010', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_311', name: 'Jaydipbhai Arvindbhai Dharajiya', email: 'Jaydipbhai.Dharajiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201011', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_312', name: 'Jeetkumar Chetanbhai Bhatt', email: 'Jeetkumar.Bhatt@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201012', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_313', name: 'Jitkumar Prakashbhai Ramani', email: 'Jitkumar.Ramani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201013', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_314', name: 'Khushiben Amrutbhai Vankar', email: 'Khushiben.Vankar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201014', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_315', name: 'Kundan Dineshbhai Vaghela', email: 'Kundan.Vaghela@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201015', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_316', name: 'Manav Ghelabhai Dangar', email: 'Manav.Dangar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201016', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_317', name: 'Mayankkumar Bharatbhai Sartanpara', email: 'Mayankkumar.Sartanpara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201017', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_318', name: 'Meetbhai Rameshbhai Katariya', email: 'Meetbhai.Katariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201018', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_319', name: 'Meetkumar Ishvarbhai Bhuva', email: 'Meetkumar.Bhuva@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201019', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_320', name: 'Mehul Dhirubhai Dharajiya', email: 'Mehul.Dharajiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201020', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_321', name: 'Mekaranbhai Boghabhai Dharajiya', email: 'Mekaranbhai.Dharajiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201021', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_322', name: 'Mit Kalubhai Malaviya', email: 'Mit.Malaviya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201022', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_323', name: 'Namradipsinh Mahavirsinh Gohil', email: 'Namradipsinh.Gohil@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201023', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_324', name: 'Nikunj Pravinbhai Rajapara', email: 'Nikunj.Rajapara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201024', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_325', name: 'Nitin Harjibhai Sankaliya', email: 'Nitin.Sankaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201025', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_326', name: 'Rajvir Dilipbhai Gohil', email: 'Rajvir.Gohil@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201026', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_327', name: 'Rehan Bhayjibhai Mahetar', email: 'Rehan.Mahetar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201027', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_328', name: 'Satyajit Mahipatbhai Chauhan', email: 'Satyajit.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201028', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_329', name: 'Sejalben Sureshbhai Makavana', email: 'Sejalben.Makavana@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201029', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_330', name: 'Sunilbhai Jayeshbhai Rathod', email: 'Sunilbhai.rathod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201030', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_331', name: 'Tirth Nileshbhai Vavaliya', email: 'Tirth.Vavaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201031', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_332', name: 'Tushar Laljibhai Rathod', email: 'Tushar.Rathod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201032', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_333', name: 'Vaibhav Alpeshbhai Patel', email: 'Vaibhav.Patel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201033', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_334', name: 'Yashrajsinh Baldevsinh Jadeja', email: 'Yashrajsinh.Jadeja@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201034', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_335', name: 'Jaydip Bharatbhai Zapadiya', email: 'Jaydip.Zapadiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201035', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_336', name: 'Parthbhai Ghanshyambhai Makwana', email: 'Parthbhai.Makwana@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201036', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_337', name: 'Rushibhai Ashokbhai Ambaliya', email: 'Rushibhai.Ambaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201037', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_338', name: 'Nikunj Bharatbhai Pavra', email: 'Nikunj.Pavra@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 3, enrollmentNo: '25222201038', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of Horticulture (B.R.S. Horticulture - Sem 03) ---
  { id: 'usr_st_horti_301', name: 'Jainamkumar Pareshbhai Kanzariya', email: 'Jainamkumar.Kanzariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 3, enrollmentNo: '25222203001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_horti_302', name: 'Monikaben Bakulbhai Kantariya', email: 'Monikaben.Kantariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 3, enrollmentNo: '25222203002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_horti_303', name: 'Dhrumil Balubhai Katariya', email: 'Dhrumil.Katariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 3, enrollmentNo: '25222203003', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of Business Administration (B.B.A. - Sem 03) ---
  { id: 'usr_st_bba_301', name: 'Khilan Bharatbhai Dudhagara', email: 'Khilan.Dudhagara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bba', departmentName: 'Bachelor of Business Administration', semester: 3, enrollmentNo: '25231101001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_bba_303', name: 'Nikunj Hareshbhai Solanki', email: 'Nikunj.Solanki@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bba', departmentName: 'Bachelor of Business Administration', semester: 3, enrollmentNo: '25231101003', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_bba_304', name: 'Rohit Dhirubhai Gohil', email: 'Rohit.Gohil@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bba', departmentName: 'Bachelor of Business Administration', semester: 3, enrollmentNo: '25231101004', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_bba_306', name: 'Tanvi Bhavesh Jamod', email: 'Tanvi.Jamod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bba', departmentName: 'Bachelor of Business Administration', semester: 3, enrollmentNo: '25231101006', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_bba_307', name: 'Utsav Kaushikbhai Dudhagara', email: 'Utsav.Dudhagara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bba', departmentName: 'Bachelor of Business Administration', semester: 3, enrollmentNo: '25231101007', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_bba_308', name: 'Vishva Shaileshbhai Jamod', email: 'Vishva.Jamod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bba', departmentName: 'Bachelor of Business Administration', semester: 3, enrollmentNo: '25231101008', joiningDate: '2025-08-01', password: 'Luri@123' },

  // --- Department of English (B.A. English - Sem 03) ---
  { id: 'usr_st_eng_301', name: 'Janvi Jilubhai Jebaliya', email: 'Janvi.Jebaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_ba_english', departmentName: 'B.A. English', semester: 3, enrollmentNo: '25211101001', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_eng_302', name: 'Yenshita Bharatbhai Savani', email: 'Yenshita.Savani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_ba_english', departmentName: 'B.A. English', semester: 3, enrollmentNo: '25211101002', joiningDate: '2025-08-01', password: 'Luri@123' },
  { id: 'usr_st_eng_303', name: 'Aayushi Narendrabhai Sojitra', email: 'Aayushi.Sojitra@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_ba_english', departmentName: 'B.A. English', semester: 3, enrollmentNo: '25211101003', joiningDate: '2025-08-01', password: 'Luri@123' },

  // ==========================================
  // SEMESTER 5 STUDENTS (ACADEMIC YEAR 2026-27)
  // ==========================================

  // --- Department of Agro Food Processing (B.Voc AFP - Sem 05) ---
  { id: 'usr_st_afp_502', name: 'Chintan Hirabhai Sambad', email: 'Chintan.Sambad@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102002', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_503', name: 'Foram Nileshbhai Metaliya', email: 'Foram.Metaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102003', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_505', name: 'Harerambhai Dhirabhai Shiyaliya', email: 'Harerambhai.Shiyaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102005', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_507', name: 'Jalpesh Dalsukhbhai Nakiya', email: 'Jalpesh.Nakiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102007', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_508', name: 'Jenil Jaysukhbhai Chovatiya', email: 'Jenil.Chovatiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102008', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_509', name: 'Kaushik Mulubhai Nandaniya', email: 'Kaushik.Nandaniya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102009', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_510', name: 'Krish Kalubhai Dangar', email: 'Krish.Dangar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102010', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_511', name: 'Krushang Hasmukhbhai Gami', email: 'Krushang.Gami@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102011', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_512', name: 'Mandip Naranbhai Gujjar', email: 'Mandip.Gujjar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102012', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_514', name: 'Nayan Rajubhai Khamal', email: 'Nayan.Khamal@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102014', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_515', name: 'Parth Hareshbhai Lathiya', email: 'Parth.Lathiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102015', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_516', name: 'Pradipbhai Mukeshbhai Meniya', email: 'Pradipbhai.Meniya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102016', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_517', name: 'Rohit Kanubhai Gujariya', email: 'Rohit.Gujariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102017', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_518', name: 'Roshankumar Veniram Devthala', email: 'Roshankumar.Devthala@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102018', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_519', name: 'Rudra Viralbhai Halvadiya', email: 'Rudra.Halvadiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102019', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_520', name: 'Rudrabhai Satishbhai Chauhan', email: 'Rudrabhai.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102020', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_521', name: 'Rushit Pankajbhai Chauhan', email: 'Rushit.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102021', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_522', name: 'Rutumbhara Kamleshkumar Dixit', email: 'Rutumbhara.Dixit@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102022', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_523', name: 'Samarth Narendrakumar Patel', email: 'Samarth.Patel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102023', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_524', name: 'Satish Arjanbhai Pithiya', email: 'Satish.Pithiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102024', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_525', name: 'Shivamkumar Dilipbhai Jasoliya', email: 'Shivamkumar.Jasoliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102025', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_527', name: 'Tanvi Dipakbhai Bagda', email: 'Tanvi.Bagda@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102027', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_528', name: 'Varshaben Bharatbhai Dabhi', email: 'Varshaben.Dabhi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102028', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_afp_529', name: 'Vrajkumar Ajaykumar Patel', email: 'Vrajkumar.Patel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_afp', departmentName: 'Agro-Food Processing', semester: 5, enrollmentNo: '24221102029', joiningDate: '2024-08-01', password: 'Luri@123' },

  // --- Department of Natural Farming (B.Voc NF - Sem 05) ---
  { id: 'usr_st_nf_501', name: 'Bhagyeshbhai Nareshbhai Talpada', email: 'Bhagyeshbhai.Talpada@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101001', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_502', name: 'Ghanshyambhai Rajeshbhai Baraiya', email: 'Ghanshyambhai.Baraiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101002', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_503', name: 'Jaydipbhai Mukeshbhai Dabhi', email: 'Jaydipbhai.Dabhi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101003', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_504', name: 'Jaymin Jagdish Talpada', email: 'Jaymin.Talpada@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101004', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_505', name: 'Ketanbhai Bhayabhai Dabhi', email: 'Ketanbhai.Dabhi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101005', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_506', name: 'Krishna Hasmukhbhai Patel', email: 'Krishna.Patel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101006', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_508', name: 'Raviraj Rajabhai Mobh', email: 'Raviraj.Mobh@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101008', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_nf_511', name: 'Vipulbhai Rajubhai Vaja', email: 'Vipulbhai.Vaja@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_bvoc_nf', departmentName: 'Natural Farming', semester: 5, enrollmentNo: '24221101011', joiningDate: '2024-08-01', password: 'Luri@123' },

  // --- Department of Animal Husbandry & Dairy Science (B.R.S. AHDS - Sem 05) ---
  { id: 'usr_st_ahds_501', name: 'Dhruvin Ashokbhai Dhameliya', email: 'Dhruvin.Dhameliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202001', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_503', name: 'Dipesh Manubhai Bhaliya', email: 'Dipesh.Bhaliya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202003', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_505', name: 'Kalpesh Mansukbhai Sisa', email: 'Kalpesh.Sisa@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202005', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_506', name: 'Ketan Mohan Vaghela', email: 'Ketan.Vaghela@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202006', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_507', name: 'Maheksinh Vijaysinh Zala', email: 'Maheksinh.Zala@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202007', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_509', name: 'Nalin Maganbhai Luhar', email: 'Nalin.Luhar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202009', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_510', name: 'Rohit Vinubhai Parmar', email: 'Rohit.Parmar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202010', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_511', name: 'Umesh Virambhai Khambhla', email: 'Umesh.Khambhla@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202011', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_512', name: 'Vaibhav Vinodbhai Gohil', email: 'Vaibhav.Gohil@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202012', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_ahds_513', name: 'Vishvash Sureshbhai Parmar', email: 'Vishvash.Parmar@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_ahds', departmentName: 'Animal Husbandry & Dairy Science', semester: 5, enrollmentNo: '24222202013', joiningDate: '2024-08-01', password: 'Luri@123' },

  // --- Department of Agronomy (B.R.S. Agronomy - Sem 05) ---
  { id: 'usr_st_agro_501', name: 'Anilkumar Babubhai Vanani', email: 'Anilkumar.Vanani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201001', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_502', name: 'Anuj Sanjaykumar Ramkabir', email: 'Anuj.Ramkabir@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201002', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_503', name: 'Bhumikaben Natvarbhai Tadavi', email: 'Bhumikaben.Tadavi@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201003', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_504', name: 'Chavda Anilkumar Maharibhai', email: 'Anilkumar.Chavda@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201004', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_505', name: 'Chirag Manojbhai Zezariya', email: 'Chirag.Zezariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201005', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_506', name: 'Dharmesh Ghanshyambhai Zalavadiya', email: 'Dharmesh.Zalavadiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201006', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_507', name: 'Gautambhai Kantibhai Virash', email: 'Gautambhai.Virash@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201007', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_508', name: 'Gautamkumar Pravinbhai Kashela', email: 'Gautamkumar.Kashela@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201008', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_509', name: 'Gopal Bharatbhai Jani', email: 'Gopal.Jani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201009', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_510', name: 'Hemanshuni Mahendrabhai Rathod', email: 'Hemanshuni.Rathod@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201010', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_511', name: 'Hemil Rajnikantbhai Sanghani', email: 'Hemil.Sanghani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201011', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_512', name: 'Jayraj Ashvinbhai Chavda', email: 'Jayraj.Chavda@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201012', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_513', name: 'Kishan Hothibhai Talavadiya', email: 'Kishan.Talavadiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201013', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_514', name: 'Kishan Maheshbhai Bhadka', email: 'Kishan.Bhadka@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201014', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_515', name: 'Maheshbhai Dajibhai Kanotara', email: 'Maheshbhai.Kanotara@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201015', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_516', name: 'Manthan Bharatbhai Solanki', email: 'Manthan.Solanki@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201016', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_517', name: 'Mitrajsinh Mahadevbhai Pavra', email: 'Mitrajsinh.Pavra@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201017', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_518', name: 'Mitraj Maheshbhai Chavda', email: 'Mitraj.Chavda@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201018', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_519', name: 'Mohit Gopalbhai Sanghani', email: 'Mohit.Sanghani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201019', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_520', name: 'Palak Balvantray Baraiya', email: 'Palak.Baraiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201020', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_521', name: 'Parthiv Bharatbhai Hariyani', email: 'Parthiv.Hariyani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201021', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_523', name: 'Rajanibhai Bharatbhai Vala', email: 'Rajanibhai.Vala@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201023', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_524', name: 'Rajnishbhai Bhurabhai Vaja', email: 'Rajnishbhai.Vaja@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201024', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_525', name: 'Rudra Raghavbhai Navdiya', email: 'Rudra.Navdiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201025', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_526', name: 'Sagar Janakbhai Nagadukiya', email: 'Sagar.Nagadukiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201026', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_527', name: 'Sagar Mahipatbhai Chauhan', email: 'Sagar.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201027', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_528', name: 'Sahil Farukbhai Solanki', email: 'Sahil.Solanki@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201028', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_529', name: 'Shaktibhai Ramajibhai Govindiya', email: 'Shaktibhai.Govindiya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201029', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_530', name: 'Shravankumar Ganpatbhai Vaghela', email: 'Shravankumar.Vaghela@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201030', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_531', name: 'Tirth Dhirubhai Gajera', email: 'Tirth.Gajera@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201031', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_532', name: 'Utsavkumar Ashvinbhai Vadhel', email: 'Utsavkumar.Vadhel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201032', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_533', name: 'Kuldipsinh Balbhadrasinh Vaja', email: 'Kuldipsinh.Vaja@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201033', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_534', name: 'Vikas Dolubhai Makwana', email: 'Vikas.Makwana@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201034', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_535', name: 'Vishvas Dineshbhai Kalsariya', email: 'Vishvas.Kalsariya@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201035', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_536', name: 'Yuvrajsinh Ajitbhai Chavda', email: 'Yuvrajsinh.Chavda@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201036', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_537', name: 'Arjun Parsottambhai Solanki', email: 'Arjun.Solanki@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201037', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_agro_538', name: 'Jaysukh Jagubhai Vadhel', email: 'Jaysukh.Vadhel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_agronomy', departmentName: 'Agronomy', semester: 5, enrollmentNo: '24222201038', joiningDate: '2024-08-01', password: 'Luri@123' },

  // --- Department of Horticulture (B.R.S. Horticulture - Sem 05) ---
  { id: 'usr_st_horti_501', name: 'Abhi Amarsinh Gohil', email: 'Abhi.Gohil@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 5, enrollmentNo: '24222203001', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_horti_502', name: 'Pruthaviraj Jesingbhai Vadhel', email: 'Pruthaviraj.Vadhel@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 5, enrollmentNo: '24222203002', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_horti_503', name: 'Rajdipsinh Ranchodbhai Chauhan', email: 'Rajdipsinh.Chauhan@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 5, enrollmentNo: '24222203003', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_horti_504', name: 'Ved Jayeshbhai Rangani', email: 'Ved.Rangani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_brs_horti', departmentName: 'Horticulture', semester: 5, enrollmentNo: '24222203004', joiningDate: '2024-08-01', password: 'Luri@123' },

  // --- Department of English (B.A. English - Sem 05) ---
  { id: 'usr_st_eng_501', name: 'Janvi Khodabhai Desai', email: 'Janvi.Desai@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_ba_english', departmentName: 'B.A. English', semester: 5, enrollmentNo: '24211101001', joiningDate: '2024-08-01', password: 'Luri@123' },
  { id: 'usr_st_eng_502', name: 'Manasvi Jagadishbhai Limbani', email: 'Manasvi.Limbani@lokbhartiuniversity.edu.in', avatar: '', role: 'student', departmentId: 'dept_ba_english', departmentName: 'B.A. English', semester: 5, enrollmentNo: '24211101002', joiningDate: '2024-08-01', password: 'Luri@123' },
];

export const SUBJECTS: Subject[] = [
  // --- Department of Information Technology (B.Voc IT - Semester 3) ---
  { id: 'sub_mj305', code: '08BVOCMJ305', name: 'Oops – using C++', departmentId: 'dept_it', semester: 3, credits: 4 },
  { id: 'sub_py_django', code: '08BVOCMJ307', name: 'Python & Django Web Framework', departmentId: 'dept_it', semester: 3, credits: 4 },
  { id: 'sub_mj306', code: '08BVOCMJ306', name: 'Software Engineering', departmentId: 'dept_it', semester: 3, credits: 4 },
  { id: 'sub_ae303', code: '08BVOCAE303', name: 'Values and Ethics', departmentId: 'dept_it', semester: 3, credits: 3 },
  { id: 'sub_se303', code: '08BVOCSE303', name: 'Google Tools', departmentId: 'dept_it', semester: 3, credits: 3 },
  { id: 'sub_va303', code: '08BVOCVA303', name: 'Rural Innovation', departmentId: 'dept_it', semester: 3, credits: 2 },
  { id: 'sub_ojt303', code: '08BVOCOJT303', name: 'Project Work', departmentId: 'dept_it', semester: 3, credits: 6 },

  // --- Department of BBA (Semester 3) ---
  { id: 'sub_bba_mj303', code: '09BBAMJ303', name: 'Consumer Behavior', departmentId: 'dept_bba', semester: 3, credits: 4 },
  { id: 'sub_bba_mn303', code: '09BBAMN303', name: 'Supply Chain Management', departmentId: 'dept_bba', semester: 3, credits: 4 },
  { id: 'sub_bba_ae303', code: '09BBAAE303', name: 'Values and Ethics', departmentId: 'dept_bba', semester: 3, credits: 3 },
  { id: 'sub_bba_se303', code: '09BBASE303', name: 'Google Tools', departmentId: 'dept_bba', semester: 3, credits: 3 },
  { id: 'sub_bba_va303', code: '09BBAVA303', name: 'Rural Innovation', departmentId: 'dept_bba', semester: 3, credits: 2 },
  { id: 'sub_bba_proj303', code: '09BBAOJT303', name: 'Project Work', departmentId: 'dept_bba', semester: 3, credits: 6 },

  // --- Department of AgroProcessing (B.Voc Agro-Food Processing - Sem 3) ---
  { id: 'sub_afp_mj305', code: '05BVOCMJ305', name: 'Processing Technology for Non-food Agro Products', departmentId: 'dept_bvoc_afp', semester: 3, credits: 4 },
  { id: 'sub_afp_mj306', code: '05BVOCMJ306', name: 'Unit Operations in Agro Processing', departmentId: 'dept_bvoc_afp', semester: 3, credits: 4 },
  { id: 'sub_afp_ae303', code: '05BVOCAE303', name: 'Value and Ethics', departmentId: 'dept_bvoc_afp', semester: 3, credits: 3 },
  { id: 'sub_afp_se303', code: '05BVOCSE303', name: 'Google Tools', departmentId: 'dept_bvoc_afp', semester: 3, credits: 3 },
  { id: 'sub_afp_va303', code: '05VOCVA303', name: 'Rural Innovation', departmentId: 'dept_bvoc_afp', semester: 3, credits: 2 },
  { id: 'sub_afp_proj303', code: '05BVOCOJT303', name: 'Project Work', departmentId: 'dept_bvoc_afp', semester: 3, credits: 6 },

  // --- Department of English (B.A. English - Sem 3) ---
  { id: 'sub_ba_mj303', code: '01BAMJ303', name: 'Introduction to Literature', departmentId: 'dept_ba_english', semester: 3, credits: 4 },
  { id: 'sub_ba_mj304', code: '01BAMJ304', name: 'British Poetry & Drama: 14th – 17th C', departmentId: 'dept_ba_english', semester: 3, credits: 4 },
  { id: 'sub_ba_mn303', code: '01BAMN303', name: 'ગુજરાતી નિબંધ (Gujarati Essay)', departmentId: 'dept_ba_english', semester: 3, credits: 4 },
  { id: 'sub_ba_ae303', code: '01BAAE303', name: 'Value and Ethics', departmentId: 'dept_ba_english', semester: 3, credits: 3 },
  { id: 'sub_ba_se303', code: '01BASE303', name: 'Google Tools', departmentId: 'dept_ba_english', semester: 3, credits: 3 },
  { id: 'sub_ba_va303', code: '01BAVA303', name: 'Rural Innovation', departmentId: 'dept_ba_english', semester: 3, credits: 2 },
  { id: 'sub_ba_proj303', code: '01BAOJT303', name: 'Project Work', departmentId: 'dept_ba_english', semester: 3, credits: 6 },

  // --- Department of BRS Agronomy (Sem 3) ---
  { id: 'sub_brs_agro_mj303', code: '03BRSMJ303', name: 'Crop Production Technology-I (Kharif)', departmentId: 'dept_brs_agronomy', semester: 3, credits: 4 },
  { id: 'sub_brs_agro_mj304', code: '03BRSMJ304', name: 'Soil and Soil Fertility', departmentId: 'dept_brs_agronomy', semester: 3, credits: 4 },
  { id: 'sub_brs_agro_mn303', code: '03BRSMN303', name: 'Principles of Animal Nutrition (Part 1)', departmentId: 'dept_brs_agronomy', semester: 3, credits: 4 },
  { id: 'sub_brs_agro_ae303', code: '03BRSAE303', name: 'Value and Ethics', departmentId: 'dept_brs_agronomy', semester: 3, credits: 3 },
  { id: 'sub_brs_agro_se303', code: '03BRSSE303', name: 'Google Tools', departmentId: 'dept_brs_agronomy', semester: 3, credits: 3 },
  { id: 'sub_brs_agro_va303', code: '03BR(SV)A303', name: 'Rural Innovation', departmentId: 'dept_brs_agronomy', semester: 3, credits: 2 },
  { id: 'sub_brs_agro_proj303', code: '03BRSOJT303', name: 'Project Work', departmentId: 'dept_brs_agronomy', semester: 3, credits: 6 },

  // --- Department of BRS AH & DS (Animal Husbandry & Dairy Science - Sem 3) ---
  { id: 'sub_brs_ahds_mj303', code: '03BRSMJ303', name: 'Principles of Animal Nutrition (Part 1)', departmentId: 'dept_brs_ahds', semester: 3, credits: 4 },
  { id: 'sub_brs_ahds_mj304', code: '03BRSMJ304', name: 'Animal Breeding & Reproduction', departmentId: 'dept_brs_ahds', semester: 3, credits: 4 },
  { id: 'sub_brs_ahds_mn303', code: '03BRSMN303', name: 'Crop Production Technology-I (Kharif)', departmentId: 'dept_brs_ahds', semester: 3, credits: 4 },
  { id: 'sub_brs_ahds_ae303', code: '04BRSAE303', name: 'Value and Ethics', departmentId: 'dept_brs_ahds', semester: 3, credits: 3 },
  { id: 'sub_brs_ahds_se303', code: '04BRSSE303', name: 'Google Tools', departmentId: 'dept_brs_ahds', semester: 3, credits: 3 },
  { id: 'sub_brs_ahds_va303', code: '04BRSVA303', name: 'Rural Innovation', departmentId: 'dept_brs_ahds', semester: 3, credits: 2 },
  { id: 'sub_brs_ahds_proj303', code: '04BRSOJT303', name: 'Project Work', departmentId: 'dept_brs_ahds', semester: 3, credits: 6 },

  // --- Department of Natural Farming (B.Voc Natural Farming - Sem 3) ---
  { id: 'sub_nf_mj305', code: '06BVOCMJ305', name: 'Introduction to Plant Life', departmentId: 'dept_bvoc_nf', semester: 3, credits: 4 },
  { id: 'sub_nf_mj306', code: '06BVOCMJ306', name: 'Natural Crop Protection', departmentId: 'dept_bvoc_nf', semester: 3, credits: 4 },
  { id: 'sub_nf_ae303', code: '06BVOCAE303', name: 'Value and Ethics', departmentId: 'dept_bvoc_nf', semester: 3, credits: 3 },
  { id: 'sub_nf_se303', code: '06BVOCSE303', name: 'Google Tools', departmentId: 'dept_bvoc_nf', semester: 3, credits: 3 },
  { id: 'sub_nf_va303', code: '06BVOCVA303', name: 'Rural Innovation', departmentId: 'dept_bvoc_nf', semester: 3, credits: 2 },
  { id: 'sub_nf_proj303', code: '06BVOCOJT303', name: 'Project Work', departmentId: 'dept_bvoc_nf', semester: 3, credits: 6 },
];

export const TIMETABLES: TimetableSlot[] = [
  // IT DEPARTMENT (Sem 3) SLOTS
  {
    id: 'slot_mon_1',
    dayOfWeek: 'Monday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '08BVOCAE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_gh',
    teacherName: 'Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'slot_mon_2',
    dayOfWeek: 'Monday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_jw',
    subjectName: 'Journal Writing',
    subjectCode: 'JW-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Faculty Coordinator',
    classroom: 'Classroom',
  },
  {
    id: 'slot_mon_3',
    dayOfWeek: 'Monday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_yag',
    subjectName: 'Yagnarth',
    subjectCode: 'YAG-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Campus Coordinator',
    classroom: 'Campus Grounds',
  },
  {
    id: 'slot_mon_4',
    dayOfWeek: 'Monday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    subjectCode: '08BVOCMJ305',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Classroom',
  },
  {
    id: 'slot_mon_5',
    dayOfWeek: 'Monday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_depact',
    subjectName: 'Departmental Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'IT Department Faculty',
    classroom: 'IT Department',
  },
  {
    id: 'slot_mon_6',
    dayOfWeek: 'Monday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering',
    subjectCode: '08BVOCMJ306',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Classroom',
  },

  // TUESDAY
  {
    id: 'slot_tue_1',
    dayOfWeek: 'Tuesday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering',
    subjectCode: '08BVOCMJ306',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Classroom',
  },
  {
    id: 'slot_tue_2_1',
    dayOfWeek: 'Tuesday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++ (Practical)',
    subjectCode: '08BVOCMJ305 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_tue_2_2',
    dayOfWeek: 'Tuesday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++ (Practical)',
    subjectCode: '08BVOCMJ305 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_tue_3',
    dayOfWeek: 'Tuesday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_se303',
    subjectName: 'Google Tools',
    subjectCode: '08BVOCSE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_tue_4_1',
    dayOfWeek: 'Tuesday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering (Practical)',
    subjectCode: '08BVOCMJ306 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_tue_4_2',
    dayOfWeek: 'Tuesday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering (Practical)',
    subjectCode: '08BVOCMJ306 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Computer Lab',
  },

  // WEDNESDAY
  {
    id: 'slot_wed_1',
    dayOfWeek: 'Wednesday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '08BVOCAE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_gh',
    teacherName: 'Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'slot_wed_2',
    dayOfWeek: 'Wednesday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    subjectCode: '08BVOCMJ305',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Classroom',
  },
  {
    id: 'slot_wed_3',
    dayOfWeek: 'Wednesday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_jw',
    subjectName: 'Journal Writing',
    subjectCode: 'JW-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Faculty Coordinator',
    classroom: 'Classroom',
  },
  {
    id: 'slot_wed_4_1',
    dayOfWeek: 'Wednesday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_depact',
    subjectName: 'Departmental Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'IT Department Faculty',
    classroom: 'IT Department',
  },
  {
    id: 'slot_wed_4_2',
    dayOfWeek: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_depact',
    subjectName: 'Departmental Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'IT Department Faculty',
    classroom: 'IT Department',
  },
  {
    id: 'slot_wed_5',
    dayOfWeek: 'Wednesday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_lib',
    subjectName: 'Library Session',
    subjectCode: 'LIB-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_librarian',
    teacherName: 'Librarian',
    classroom: 'Central Library',
  },

  // THURSDAY
  {
    id: 'slot_thu_1_1',
    dayOfWeek: 'Thursday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_proj',
    subjectName: 'Project Work (Morning Session)',
    subjectCode: 'PROJ-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Project Coordinator',
    classroom: 'Project Lab',
  },
  {
    id: 'slot_thu_1_2',
    dayOfWeek: 'Thursday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_proj',
    subjectName: 'Project Work (Morning Session)',
    subjectCode: 'PROJ-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Project Coordinator',
    classroom: 'Project Lab',
  },
  {
    id: 'slot_thu_1_3',
    dayOfWeek: 'Thursday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_proj',
    subjectName: 'Project Work (Morning Session)',
    subjectCode: 'PROJ-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Project Coordinator',
    classroom: 'Project Lab',
  },
  {
    id: 'slot_thu_2_1',
    dayOfWeek: 'Thursday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_proj',
    subjectName: 'Project Work (Afternoon Session)',
    subjectCode: 'PROJ-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Project Coordinator',
    classroom: 'Project Lab',
  },
  {
    id: 'slot_thu_2_2',
    dayOfWeek: 'Thursday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_proj',
    subjectName: 'Project Work (Afternoon Session)',
    subjectCode: 'PROJ-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Project Coordinator',
    classroom: 'Project Lab',
  },
  {
    id: 'slot_thu_2_3',
    dayOfWeek: 'Thursday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_proj',
    subjectName: 'Project Work (Afternoon Session)',
    subjectCode: 'PROJ-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Project Coordinator',
    classroom: 'Project Lab',
  },

  // FRIDAY
  {
    id: 'slot_fri_1',
    dayOfWeek: 'Friday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '08BVOCAE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_gh',
    teacherName: 'Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'slot_fri_2_1',
    dayOfWeek: 'Friday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_jw',
    subjectName: 'Journal Writing',
    subjectCode: 'JW-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Faculty Coordinator',
    classroom: 'Classroom',
  },
  {
    id: 'slot_fri_2_2',
    dayOfWeek: 'Friday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_jw',
    subjectName: 'Journal Writing',
    subjectCode: 'JW-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Faculty Coordinator',
    classroom: 'Classroom',
  },
  {
    id: 'slot_fri_3',
    dayOfWeek: 'Friday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_se303',
    subjectName: 'Google Tools',
    subjectCode: '08BVOCSE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_fri_4_1',
    dayOfWeek: 'Friday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_lib',
    subjectName: 'Library Session',
    subjectCode: 'LIB-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_librarian',
    teacherName: 'Librarian',
    classroom: 'Central Library',
  },
  {
    id: 'slot_fri_4_2',
    dayOfWeek: 'Friday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_lib',
    subjectName: 'Library Session',
    subjectCode: 'LIB-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_librarian',
    teacherName: 'Librarian',
    classroom: 'Central Library',
  },

  // SATURDAY
  {
    id: 'slot_sat_1',
    dayOfWeek: 'Saturday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_anub',
    subjectName: 'Anubandh Session',
    subjectCode: 'ANUB-301',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_faculty',
    teacherName: 'Faculty Coordinator',
    classroom: 'Auditorium',
  },
  {
    id: 'slot_sat_2_1',
    dayOfWeek: 'Saturday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++ (Practical)',
    subjectCode: '08BVOCMJ305 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_sat_2_2',
    dayOfWeek: 'Saturday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++ (Practical)',
    subjectCode: '08BVOCMJ305 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_sat_3',
    dayOfWeek: 'Saturday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_se303',
    subjectName: 'Google Tools',
    subjectCode: '08BVOCSE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_sat_4_1',
    dayOfWeek: 'Saturday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering (Practical)',
    subjectCode: '08BVOCMJ306 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Computer Lab',
  },
  {
    id: 'slot_sat_4_2',
    dayOfWeek: 'Saturday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering (Practical)',
    subjectCode: '08BVOCMJ306 P',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Computer Lab',
  },

  // ALSO DUP FOR DEPT_CS SEMESTER 3 / 4 FOR CONVENIENCE
  {
    id: 'slot_cs_1',
    dayOfWeek: 'Monday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '08BVOCAE303',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_gh',
    teacherName: 'Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'slot_cs_2',
    dayOfWeek: 'Monday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    subjectCode: '08BVOCMJ305',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    teacherName: 'Mitulgiri Gauswami (MG)',
    classroom: 'Classroom',
  },
  {
    id: 'slot_cs_3',
    dayOfWeek: 'Monday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering',
    subjectCode: '08BVOCMJ306',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_ry',
    teacherName: 'Rishu Raj (RY)',
    classroom: 'Classroom',
  },

  // ==========================================
  // DEPARTMENT OF BBA (Semester 3) TIMETABLE
  // Lokbharati University for Rural Innovation
  // Academic Time Table – 3rd Semester 2026-27 (Effective: 08/06/2026)
  // ==========================================

  // --- MONDAY ---
  {
    id: 'bba3_mon_1',
    dayOfWeek: 'Monday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_bba_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '09BBAAE303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_ghanshyam_hirani',
    teacherName: 'Mr. Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'bba3_mon_2',
    dayOfWeek: 'Monday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_mon_3',
    dayOfWeek: 'Monday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_bba_yagnarth',
    subjectName: 'Yagnarth',
    subjectCode: 'YAGNARTH',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'University Activity Cell',
    classroom: 'Assembly Hall',
  },
  {
    id: 'bba3_mon_4',
    dayOfWeek: 'Monday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_bba_mn303',
    subjectName: 'Supply Chain Management',
    subjectCode: '09BBAMN303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_mon_5',
    dayOfWeek: 'Monday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_mon_6',
    dayOfWeek: 'Monday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior',
    subjectCode: '09BBAMJ303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_mon_7',
    dayOfWeek: 'Monday',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    subjectId: 'sub_bba_sports',
    subjectName: 'Sports',
    subjectCode: 'SPORTS',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mukund_kalsariya',
    teacherName: 'Mr. Mukund Kalsariya (MK)',
    classroom: 'University Sports Ground',
  },

  // --- TUESDAY ---
  {
    id: 'bba3_tue_1',
    dayOfWeek: 'Tuesday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior (Practical)',
    subjectCode: '09BBAMJ303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_tue_2',
    dayOfWeek: 'Tuesday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior (Practical)',
    subjectCode: '09BBAMJ303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_tue_3',
    dayOfWeek: 'Tuesday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_tue_4',
    dayOfWeek: 'Tuesday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_bba_se303',
    subjectName: 'Google Tools',
    subjectCode: '09BBASE303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Computer Lab',
  },
  {
    id: 'bba3_tue_5',
    dayOfWeek: 'Tuesday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_tue_6',
    dayOfWeek: 'Tuesday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior',
    subjectCode: '09BBAMJ303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_tue_7',
    dayOfWeek: 'Tuesday',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    subjectId: 'sub_bba_sports',
    subjectName: 'Sports',
    subjectCode: 'SPORTS',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mukund_kalsariya',
    teacherName: 'Mr. Mukund Kalsariya (MK)',
    classroom: 'University Sports Ground',
  },

  // --- WEDNESDAY ---
  {
    id: 'bba3_wed_1',
    dayOfWeek: 'Wednesday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_bba_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '09BBAAE303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_ghanshyam_hirani',
    teacherName: 'Mr. Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'bba3_wed_2',
    dayOfWeek: 'Wednesday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior',
    subjectCode: '09BBAMJ303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_wed_3',
    dayOfWeek: 'Wednesday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_bba_mn303',
    subjectName: 'Supply Chain Management',
    subjectCode: '09BBAMN303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_wed_4',
    dayOfWeek: 'Wednesday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_wed_5',
    dayOfWeek: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_bba_mn303',
    subjectName: 'Supply Chain Management (Practical)',
    subjectCode: '09BBAMN303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_wed_6',
    dayOfWeek: 'Wednesday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_bba_mn303',
    subjectName: 'Supply Chain Management (Practical)',
    subjectCode: '09BBAMN303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_wed_7',
    dayOfWeek: 'Wednesday',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    subjectId: 'sub_bba_sports',
    subjectName: 'Sports',
    subjectCode: 'SPORTS',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mukund_kalsariya',
    teacherName: 'Mr. Mukund Kalsariya (MK)',
    classroom: 'University Sports Ground',
  },

  // --- THURSDAY ---
  {
    id: 'bba3_thu_1',
    dayOfWeek: 'Thursday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_bba_proj303',
    subjectName: 'Project Work',
    subjectCode: '09BBAOJT303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_dhyan_patel',
    teacherName: 'Mr. Dhyan Patel (DP)',
    classroom: 'Project Lab / Field',
  },
  {
    id: 'bba3_thu_2',
    dayOfWeek: 'Thursday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_bba_proj303',
    subjectName: 'Project Work',
    subjectCode: '09BBAOJT303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_dhyan_patel',
    teacherName: 'Mr. Dhyan Patel (DP)',
    classroom: 'Project Lab / Field',
  },
  {
    id: 'bba3_thu_3',
    dayOfWeek: 'Thursday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_bba_proj303',
    subjectName: 'Project Work',
    subjectCode: '09BBAOJT303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_dhyan_patel',
    teacherName: 'Mr. Dhyan Patel (DP)',
    classroom: 'Project Lab / Field',
  },
  {
    id: 'bba3_thu_4',
    dayOfWeek: 'Thursday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_bba_proj303',
    subjectName: 'Project Work',
    subjectCode: '09BBAOJT303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_dhyan_patel',
    teacherName: 'Mr. Dhyan Patel (DP)',
    classroom: 'Project Lab / Field',
  },
  {
    id: 'bba3_thu_5',
    dayOfWeek: 'Thursday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_bba_proj303',
    subjectName: 'Project Work',
    subjectCode: '09BBAOJT303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_dhyan_patel',
    teacherName: 'Mr. Dhyan Patel (DP)',
    classroom: 'Project Lab / Field',
  },
  {
    id: 'bba3_thu_6',
    dayOfWeek: 'Thursday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_bba_proj303',
    subjectName: 'Project Work',
    subjectCode: '09BBAOJT303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_dhyan_patel',
    teacherName: 'Mr. Dhyan Patel (DP)',
    classroom: 'Project Lab / Field',
  },
  {
    id: 'bba3_thu_7',
    dayOfWeek: 'Thursday',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    subjectId: 'sub_bba_sports',
    subjectName: 'Sports',
    subjectCode: 'SPORTS',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mukund_kalsariya',
    teacherName: 'Mr. Mukund Kalsariya (MK)',
    classroom: 'University Sports Ground',
  },

  // --- FRIDAY ---
  {
    id: 'bba3_fri_1',
    dayOfWeek: 'Friday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_bba_ae303',
    subjectName: 'Values and Ethics',
    subjectCode: '09BBAAE303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_ghanshyam_hirani',
    teacherName: 'Mr. Ghanshyam Hirani (GH)',
    classroom: 'Room B-203',
  },
  {
    id: 'bba3_fri_2',
    dayOfWeek: 'Friday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_bba_mn303',
    subjectName: 'Supply Chain Management (Practical)',
    subjectCode: '09BBAMN303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_fri_3',
    dayOfWeek: 'Friday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_bba_mn303',
    subjectName: 'Supply Chain Management (Practical)',
    subjectCode: '09BBAMN303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_fri_4',
    dayOfWeek: 'Friday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_bba_se303',
    subjectName: 'Google Tools',
    subjectCode: '09BBASE303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Computer Lab',
  },
  {
    id: 'bba3_fri_5',
    dayOfWeek: 'Friday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_fri_6',
    dayOfWeek: 'Friday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_fri_7',
    dayOfWeek: 'Friday',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    subjectId: 'sub_bba_sports',
    subjectName: 'Sports',
    subjectCode: 'SPORTS',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mukund_kalsariya',
    teacherName: 'Mr. Mukund Kalsariya (MK)',
    classroom: 'University Sports Ground',
  },

  // --- SATURDAY ---
  {
    id: 'bba3_sat_1',
    dayOfWeek: 'Saturday',
    startTime: '07:30 AM',
    endTime: '08:30 AM',
    subjectId: 'sub_bba_anubandh',
    subjectName: 'Anubandh',
    subjectCode: 'ANUBANDH',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Faculty & Student Welfare Cell',
    classroom: 'Central Hall',
  },
  {
    id: 'bba3_sat_2',
    dayOfWeek: 'Saturday',
    startTime: '08:40 AM',
    endTime: '09:40 AM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior (Practical)',
    subjectCode: '09BBAMJ303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_sat_3',
    dayOfWeek: 'Saturday',
    startTime: '09:40 AM',
    endTime: '10:40 AM',
    subjectId: 'sub_bba_mj303',
    subjectName: 'Consumer Behavior (Practical)',
    subjectCode: '09BBAMJ303 P',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'Mr. Mahavirsinh Parmar (MP)',
    classroom: 'D-203 Academic Building',
  },
  {
    id: 'bba3_sat_4',
    dayOfWeek: 'Saturday',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    subjectId: 'sub_bba_se303',
    subjectName: 'Google Tools',
    subjectCode: '09BBASE303',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Computer Lab',
  },
  {
    id: 'bba3_sat_5',
    dayOfWeek: 'Saturday',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_sat_6',
    dayOfWeek: 'Saturday',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    subjectId: 'sub_bba_depact',
    subjectName: 'Dept. Activity',
    subjectCode: 'DEPACT',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mahavirsinh_parmar',
    teacherName: 'BBA Faculty Cell',
    classroom: 'Dept. of BBA',
  },
  {
    id: 'bba3_sat_7',
    dayOfWeek: 'Saturday',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    subjectId: 'sub_bba_sports',
    subjectName: 'Sports',
    subjectCode: 'SPORTS',
    departmentId: 'dept_bba',
    semester: 3,
    teacherId: 'usr_fac_mukund_kalsariya',
    teacherName: 'Mr. Mukund Kalsariya (MK)',
    classroom: 'University Sports Ground',
  },

  // =========================================================================
  // DEPARTMENT OF AGROPROCESSING (B.VOC AGRO-FOOD PROCESSING) - SEMESTER 3
  // =========================================================================
  // --- MONDAY ---
  { id: 'afp3_mon_1', dayOfWeek: 'Monday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_afp_ae303', subjectName: 'Value and Ethics', subjectCode: '05BVOCAE303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room B-203' },
  { id: 'afp3_mon_2', dayOfWeek: 'Monday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_afp_mj305', subjectName: 'Processing Tec(h)nology for Non-food Agro Products', subjectCode: '05BVOCMJ305', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'B-203 Academic Building' },
  { id: 'afp3_mon_3', dayOfWeek: 'Monday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_afp_yagnarth', subjectName: 'Yagnarth', subjectCode: 'YAGNARTH', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Campus Life Cell', classroom: 'Campus Grounds' },
  { id: 'afp3_mon_4', dayOfWeek: 'Monday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_afp_mj306', subjectName: 'Unit Operations in Agro Processing', subjectCode: '05BVOCMJ306', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'B-203 Academic Building' },
  { id: 'afp3_mon_5', dayOfWeek: 'Monday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_afp_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'AgroProcessing Faculty Cell', classroom: 'AgroProcessing Dept' },
  { id: 'afp3_mon_6', dayOfWeek: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_afp_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'AgroProcessing Faculty Cell', classroom: 'AgroProcessing Dept' },
  { id: 'afp3_mon_7', dayOfWeek: 'Monday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_afp_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- TUESDAY ---
  { id: 'afp3_tue_1', dayOfWeek: 'Tuesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_afp_mj306', subjectName: 'Unit Operations in Agro Processing', subjectCode: '05BVOCMJ306', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'B-203 Academic Building' },
  { id: 'afp3_tue_2', dayOfWeek: 'Tuesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_afp_mj305', subjectName: 'Processing Tec(h)nology for Non-food Agro Products', subjectCode: '05BVOCMJ305', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'B-203 Academic Building' },
  { id: 'afp3_tue_3', dayOfWeek: 'Tuesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_afp_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'AgroProcessing Faculty Cell', classroom: 'B-203 Academic Building' },
  { id: 'afp3_tue_4', dayOfWeek: 'Tuesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_afp_se303', subjectName: 'Google Tools', subjectCode: '05BVOCSE303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'afp3_tue_5', dayOfWeek: 'Tuesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_afp_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'AgroProcessing Faculty Cell', classroom: 'AgroProcessing Dept' },
  { id: 'afp3_tue_6', dayOfWeek: 'Tuesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_afp_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'AgroProcessing Faculty Cell', classroom: 'AgroProcessing Dept' },
  { id: 'afp3_tue_7', dayOfWeek: 'Tuesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_afp_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- WEDNESDAY ---
  { id: 'afp3_wed_1', dayOfWeek: 'Wednesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_afp_ae303', subjectName: 'Value and Ethics', subjectCode: '05BVOCAE303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room B-203' },
  { id: 'afp3_wed_2', dayOfWeek: 'Wednesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_afp_mj306', subjectName: 'Unit Operations in Agro Processing (Practical)', subjectCode: '05BVOCMJ306 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Lab' },
  { id: 'afp3_wed_3', dayOfWeek: 'Wednesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_afp_mj306', subjectName: 'Unit Operations in Agro Processing (Practical)', subjectCode: '05BVOCMJ306 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Lab' },
  { id: 'afp3_wed_4', dayOfWeek: 'Wednesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_afp_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'AgroProcessing Faculty Cell', classroom: 'B-203 Academic Building' },
  { id: 'afp3_wed_5', dayOfWeek: 'Wednesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_afp_foodlab', subjectName: 'Food Lab', subjectCode: 'FOODLAB', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'Food Lab' },
  { id: 'afp3_wed_6', dayOfWeek: 'Wednesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_afp_foodlab', subjectName: 'Food Lab', subjectCode: 'FOODLAB', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'Food Lab' },
  { id: 'afp3_wed_7', dayOfWeek: 'Wednesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_afp_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- THURSDAY ---
  { id: 'afp3_thu_1', dayOfWeek: 'Thursday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_afp_proj303', subjectName: 'Project Work', subjectCode: '05BVOCOJT303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Processing Unit / Field' },
  { id: 'afp3_thu_2', dayOfWeek: 'Thursday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_afp_proj303', subjectName: 'Project Work', subjectCode: '05BVOCOJT303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Processing Unit / Field' },
  { id: 'afp3_thu_3', dayOfWeek: 'Thursday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_afp_proj303', subjectName: 'Project Work', subjectCode: '05BVOCOJT303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Processing Unit / Field' },
  { id: 'afp3_thu_4', dayOfWeek: 'Thursday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_afp_proj303', subjectName: 'Project Work', subjectCode: '05BVOCOJT303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Processing Unit / Field' },
  { id: 'afp3_thu_5', dayOfWeek: 'Thursday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_afp_proj303', subjectName: 'Project Work', subjectCode: '05BVOCOJT303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Processing Unit / Field' },
  { id: 'afp3_thu_6', dayOfWeek: 'Thursday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_afp_proj303', subjectName: 'Project Work', subjectCode: '05BVOCOJT303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Processing Unit / Field' },
  { id: 'afp3_thu_7', dayOfWeek: 'Thursday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_afp_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- FRIDAY ---
  { id: 'afp3_fri_1', dayOfWeek: 'Friday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_afp_ae303', subjectName: 'Value and Ethics', subjectCode: '05BVOCAE303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room B-203' },
  { id: 'afp3_fri_2', dayOfWeek: 'Friday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_afp_mj305', subjectName: 'Processing Tec(h)nology for Non-food Agro Products (Practical)', subjectCode: '05BVOCMJ305 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'Food Lab' },
  { id: 'afp3_fri_3', dayOfWeek: 'Friday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_afp_mj305', subjectName: 'Processing Tec(h)nology for Non-food Agro Products (Practical)', subjectCode: '05BVOCMJ305 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'Food Lab' },
  { id: 'afp3_fri_4', dayOfWeek: 'Friday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_afp_se303', subjectName: 'Google Tools', subjectCode: '05BVOCSE303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'afp3_fri_5', dayOfWeek: 'Friday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_afp_foodlab', subjectName: 'Food Lab', subjectCode: 'FOODLAB', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Lab' },
  { id: 'afp3_fri_6', dayOfWeek: 'Friday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_afp_foodlab', subjectName: 'Food Lab', subjectCode: 'FOODLAB', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Lab' },
  { id: 'afp3_fri_7', dayOfWeek: 'Friday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_afp_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- SATURDAY ---
  { id: 'afp3_sat_1', dayOfWeek: 'Saturday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_afp_anubandh', subjectName: 'Anubandh', subjectCode: 'ANUBANDH', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Faculty & Student Welfare Cell', classroom: 'Central Hall' },
  { id: 'afp3_sat_2', dayOfWeek: 'Saturday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_afp_mj306', subjectName: 'Unit Operations in Agro Processing (Practical)', subjectCode: '05BVOCMJ306 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Lab' },
  { id: 'afp3_sat_3', dayOfWeek: 'Saturday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_afp_mj306', subjectName: 'Unit Operations in Agro Processing (Practical)', subjectCode: '05BVOCMJ306 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_paresh_zinzala', teacherName: 'Dr. Paresh Zinzala (PZ)', classroom: 'Food Lab' },
  { id: 'afp3_sat_4', dayOfWeek: 'Saturday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_afp_se303', subjectName: 'Google Tools', subjectCode: '05BVOCSE303', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'afp3_sat_5', dayOfWeek: 'Saturday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_afp_mj305', subjectName: 'Processing Tec(h)nology for Non-food Agro Products (Practical)', subjectCode: '05BVOCMJ305 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'Food Lab' },
  { id: 'afp3_sat_6', dayOfWeek: 'Saturday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_afp_mj305', subjectName: 'Processing Tec(h)nology for Non-food Agro Products (Practical)', subjectCode: '05BVOCMJ305 P', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_chirag_kantariya', teacherName: 'Mr. Chirag Kantariya (CK)', classroom: 'Food Lab' },
  { id: 'afp3_sat_7', dayOfWeek: 'Saturday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_afp_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_afp', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // =========================================================================
  // DEPARTMENT OF ENGLISH (B.A. ENGLISH) - SEMESTER 3
  // =========================================================================
  // --- MONDAY ---
  { id: 'eng3_mon_1', dayOfWeek: 'Monday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_ba_mj303', subjectName: 'Introduction to Literature', subjectCode: '01BAMJ303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_mon_2', dayOfWeek: 'Monday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_ba_se303', subjectName: 'Google Tools', subjectCode: '01BASE303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'eng3_mon_3', dayOfWeek: 'Monday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_ba_yagnarth', subjectName: 'Yagnart(H)', subjectCode: 'YAGNARTH', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Campus Life Cell', classroom: 'Campus Grounds' },
  { id: 'eng3_mon_4', dayOfWeek: 'Monday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_ba_mn303', subjectName: 'ગુજરાતી નિબંધ (Gujarati Essay)', subjectCode: '01BAMN303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL) / Dr. Vishal Bhadani (VB)', classroom: 'English Dept Room 201' },
  { id: 'eng3_mon_5', dayOfWeek: 'Monday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_ba_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'eng3_mon_6', dayOfWeek: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_ba_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'English Faculty Cell', classroom: 'English Dept' },
  { id: 'eng3_mon_7', dayOfWeek: 'Monday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_ba_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- TUESDAY ---
  { id: 'eng3_tue_1', dayOfWeek: 'Tuesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_ba_se303', subjectName: 'Google Tools', subjectCode: '01BASE303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'eng3_tue_2', dayOfWeek: 'Tuesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_ba_mj303', subjectName: 'Introduction to Literature', subjectCode: '01BAMJ303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_tue_3', dayOfWeek: 'Tuesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_ba_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'eng3_tue_4', dayOfWeek: 'Tuesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_ba_mj304', subjectName: 'British Poetry & Drama: 14th – 17th C', subjectCode: '01BAMJ304', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_tue_5', dayOfWeek: 'Tuesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_ba_mn303', subjectName: 'ગુજરાતી નિબંધ (Gujarati Essay)', subjectCode: '01BAMN303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL) / Dr. Vishal Bhadani (VB)', classroom: 'English Dept Room 201' },
  { id: 'eng3_tue_6', dayOfWeek: 'Tuesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_ba_ae303', subjectName: 'Value and Ethics', subjectCode: '01BAAE303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'eng3_tue_7', dayOfWeek: 'Tuesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_ba_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- WEDNESDAY ---
  { id: 'eng3_wed_1', dayOfWeek: 'Wednesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_ba_se303', subjectName: 'Google Tools', subjectCode: '01BASE303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'eng3_wed_2', dayOfWeek: 'Wednesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_ba_mj303', subjectName: 'Introduction to Literature', subjectCode: '01BAMJ303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_wed_3', dayOfWeek: 'Wednesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_ba_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'eng3_wed_4', dayOfWeek: 'Wednesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_ba_ae303', subjectName: 'Value and Ethics', subjectCode: '01BAAE303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'eng3_wed_5', dayOfWeek: 'Wednesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_ba_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'eng3_wed_6', dayOfWeek: 'Wednesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_ba_mj304', subjectName: 'British Poetry & Drama: 14th – 17th C', subjectCode: '01BAMJ304', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_wed_7', dayOfWeek: 'Wednesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_ba_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- THURSDAY ---
  { id: 'eng3_thu_1', dayOfWeek: 'Thursday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_ba_proj303', subjectName: 'Project Work', subjectCode: '01BAOJT303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Research Center' },
  { id: 'eng3_thu_2', dayOfWeek: 'Thursday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_ba_proj303', subjectName: 'Project Work', subjectCode: '01BAOJT303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Research Center' },
  { id: 'eng3_thu_3', dayOfWeek: 'Thursday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_ba_proj303', subjectName: 'Project Work', subjectCode: '01BAOJT303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Research Center' },
  { id: 'eng3_thu_4', dayOfWeek: 'Thursday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_ba_proj303', subjectName: 'Project Work', subjectCode: '01BAOJT303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Research Center' },
  { id: 'eng3_thu_5', dayOfWeek: 'Thursday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_ba_proj303', subjectName: 'Project Work', subjectCode: '01BAOJT303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Research Center' },
  { id: 'eng3_thu_6', dayOfWeek: 'Thursday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_ba_proj303', subjectName: 'Project Work', subjectCode: '01BAOJT303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Research Center' },
  { id: 'eng3_thu_7', dayOfWeek: 'Thursday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_ba_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- FRIDAY ---
  { id: 'eng3_fri_1', dayOfWeek: 'Friday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_ba_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'English Faculty Cell', classroom: 'English Dept' },
  { id: 'eng3_fri_2', dayOfWeek: 'Friday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_ba_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'English Faculty Cell', classroom: 'English Dept' },
  { id: 'eng3_fri_3', dayOfWeek: 'Friday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_ba_mj303', subjectName: 'Introduction to Literature', subjectCode: '01BAMJ303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_fri_4', dayOfWeek: 'Friday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_ba_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'eng3_fri_5', dayOfWeek: 'Friday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_ba_mj304', subjectName: 'British Poetry & Drama: 14th – 17th C', subjectCode: '01BAMJ304', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_fri_6', dayOfWeek: 'Friday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_ba_mn303', subjectName: 'ગુજરાતી નિબંધ (Gujarati Essay)', subjectCode: '01BAMN303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL) / Dr. Vishal Bhadani (VB)', classroom: 'English Dept Room 201' },
  { id: 'eng3_fri_7', dayOfWeek: 'Friday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_ba_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- SATURDAY ---
  { id: 'eng3_sat_1', dayOfWeek: 'Saturday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_ba_anubandh', subjectName: 'Anubandh', subjectCode: 'ANUBANDH', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Faculty & Student Welfare Cell', classroom: 'Central Hall' },
  { id: 'eng3_sat_2', dayOfWeek: 'Saturday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_ba_mj304', subjectName: 'British Poetry & Drama: 14th – 17th C', subjectCode: '01BAMJ304', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL)', classroom: 'English Dept Room 201' },
  { id: 'eng3_sat_3', dayOfWeek: 'Saturday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_ba_mn303', subjectName: 'ગુજરાતી નિબંધ (Gujarati Essay)', subjectCode: '01BAMN303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'Dr. Bhautik Limbani (BL) / Dr. Vishal Bhadani (VB)', classroom: 'English Dept Room 201' },
  { id: 'eng3_sat_4', dayOfWeek: 'Saturday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_ba_ae303', subjectName: 'Value and Ethics', subjectCode: '01BAAE303', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'eng3_sat_5', dayOfWeek: 'Saturday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_ba_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'English Faculty Cell', classroom: 'English Dept' },
  { id: 'eng3_sat_6', dayOfWeek: 'Saturday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_ba_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_bhautik_limbani', teacherName: 'English Faculty Cell', classroom: 'English Dept' },
  { id: 'eng3_sat_7', dayOfWeek: 'Saturday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_ba_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_ba_english', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // =========================================================================
  // DEPARTMENT OF BRS AGRONOMY - SEMESTER 3
  // =========================================================================
  // --- MONDAY ---
  { id: 'agro3_mon_1', dayOfWeek: 'Monday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_agro_mj304', subjectName: 'Soil and Soil Fertility', subjectCode: '03BRSMJ304', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_mon_2', dayOfWeek: 'Monday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_agro_se303', subjectName: 'Google Tools', subjectCode: '03BRSSE303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'agro3_mon_3', dayOfWeek: 'Monday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_agro_yagnarth', subjectName: 'Yagnarth', subjectCode: 'YAGNARTH', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Campus Life Cell', classroom: 'Campus Grounds' },
  { id: 'agro3_mon_4', dayOfWeek: 'Monday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_agro_mj303', subjectName: 'Crop Production Technology-I (Kharif)', subjectCode: '03BRSMJ303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_mon_5', dayOfWeek: 'Monday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_agro_mn303', subjectName: 'Principles of Animal Nutrition (Part 1)', subjectCode: '03BRSMN303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_mon_6', dayOfWeek: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_agro_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'agro3_mon_7', dayOfWeek: 'Monday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_agro_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- TUESDAY ---
  { id: 'agro3_tue_1', dayOfWeek: 'Tuesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_agro_se303', subjectName: 'Google Tools', subjectCode: '03BRSSE303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'agro3_tue_2', dayOfWeek: 'Tuesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_agro_mj303', subjectName: 'Crop Production Technology-I (Kharif)', subjectCode: '03BRSMJ303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_tue_3', dayOfWeek: 'Tuesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_agro_mn303', subjectName: 'Principles of Animal Nutrition (Part 1)', subjectCode: '03BRSMN303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_tue_4', dayOfWeek: 'Tuesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_agro_mj304', subjectName: 'Soil and Soil Fertility', subjectCode: '03BRSMJ304', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_tue_5', dayOfWeek: 'Tuesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_agro_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Agronomy Faculty Cell', classroom: 'A-103 Academic Building' },
  { id: 'agro3_tue_6', dayOfWeek: 'Tuesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_agro_ae303', subjectName: 'Value and Ethics', subjectCode: '03BRSAE303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'agro3_tue_7', dayOfWeek: 'Tuesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_agro_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- WEDNESDAY ---
  { id: 'agro3_wed_1', dayOfWeek: 'Wednesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_agro_se303', subjectName: 'Google Tools', subjectCode: '03BRSSE303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'agro3_wed_2', dayOfWeek: 'Wednesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_agro_mj303', subjectName: 'Crop Production Technology-I (Kharif)', subjectCode: '03BRSMJ303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_wed_3', dayOfWeek: 'Wednesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_agro_mn303', subjectName: 'Principles of Animal Nutrition (Part 1)', subjectCode: '03BRSMN303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_wed_4', dayOfWeek: 'Wednesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_agro_ae303', subjectName: 'Value and Ethics', subjectCode: '03BRSAE303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'agro3_wed_5', dayOfWeek: 'Wednesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_agro_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Agronomy Faculty Cell', classroom: 'Agronomy Dept' },
  { id: 'agro3_wed_6', dayOfWeek: 'Wednesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_agro_depact', subjectName: 'Departmental Activity', subjectCode: 'DEPACT', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Agronomy Faculty Cell', classroom: 'Agronomy Dept' },
  { id: 'agro3_wed_7', dayOfWeek: 'Wednesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_agro_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- THURSDAY ---
  { id: 'agro3_thu_1', dayOfWeek: 'Thursday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_agro_proj303', subjectName: 'Project Work', subjectCode: '03BRSOJT303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Agronomy Research Farm / Field' },
  { id: 'agro3_thu_2', dayOfWeek: 'Thursday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_agro_proj303', subjectName: 'Project Work', subjectCode: '03BRSOJT303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Agronomy Research Farm / Field' },
  { id: 'agro3_thu_3', dayOfWeek: 'Thursday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_agro_proj303', subjectName: 'Project Work', subjectCode: '03BRSOJT303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Agronomy Research Farm / Field' },
  { id: 'agro3_thu_4', dayOfWeek: 'Thursday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_agro_proj303', subjectName: 'Project Work', subjectCode: '03BRSOJT303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Agronomy Research Farm / Field' },
  { id: 'agro3_thu_5', dayOfWeek: 'Thursday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_agro_proj303', subjectName: 'Project Work', subjectCode: '03BRSOJT303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Agronomy Research Farm / Field' },
  { id: 'agro3_thu_6', dayOfWeek: 'Thursday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_agro_proj303', subjectName: 'Project Work', subjectCode: '03BRSOJT303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Agronomy Research Farm / Field' },
  { id: 'agro3_thu_7', dayOfWeek: 'Thursday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_agro_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- FRIDAY ---
  { id: 'agro3_fri_1', dayOfWeek: 'Friday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_agro_mj304', subjectName: 'Soil and Soil Fertility (Practical)', subjectCode: '03BRSMJ304 P', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Soil Science Lab' },
  { id: 'agro3_fri_2', dayOfWeek: 'Friday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_agro_mj304', subjectName: 'Soil and Soil Fertility (Practical)', subjectCode: '03BRSMJ304 P', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'Soil Science Lab' },
  { id: 'agro3_fri_3', dayOfWeek: 'Friday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_agro_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Agronomy Faculty Cell', classroom: 'A-103 Academic Building' },
  { id: 'agro3_fri_4', dayOfWeek: 'Friday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_agro_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'agro3_fri_5', dayOfWeek: 'Friday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_agro_mn303', subjectName: 'Principles of Animal Nutrition (Part 1) (Practical)', subjectCode: '03BRSMN303 P', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'Animal Nutrition Lab' },
  { id: 'agro3_fri_6', dayOfWeek: 'Friday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_agro_mn303', subjectName: 'Principles of Animal Nutrition (Part 1) (Practical)', subjectCode: '03BRSMN303 P', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'Animal Nutrition Lab' },
  { id: 'agro3_fri_7', dayOfWeek: 'Friday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_agro_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- SATURDAY ---
  { id: 'agro3_sat_1', dayOfWeek: 'Saturday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_agro_anubandh', subjectName: 'Anubandh', subjectCode: 'ANUBANDH', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Faculty & Student Welfare Cell', classroom: 'Central Hall' },
  { id: 'agro3_sat_2', dayOfWeek: 'Saturday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_agro_mj303', subjectName: 'Crop Production Technology-I (Kharif) (Practical)', subjectCode: '03BRSMJ303 P', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mukund Kalsariya (MK) / Femi Vala (FV)', classroom: 'Agronomy Farm' },
  { id: 'agro3_sat_3', dayOfWeek: 'Saturday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_agro_mj303', subjectName: 'Crop Production Technology-I (Kharif) (Practical)', subjectCode: '03BRSMJ303 P', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mukund Kalsariya (MK) / Femi Vala (FV)', classroom: 'Agronomy Farm' },
  { id: 'agro3_sat_4', dayOfWeek: 'Saturday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_agro_ae303', subjectName: 'Value and Ethics', subjectCode: '03BRSAE303', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'agro3_sat_5', dayOfWeek: 'Saturday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_agro_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Agronomy Faculty Cell', classroom: 'A-103 Academic Building' },
  { id: 'agro3_sat_6', dayOfWeek: 'Saturday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_agro_mj304', subjectName: 'Soil and Soil Fertility', subjectCode: '03BRSMJ304', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_dhyan_patel', teacherName: 'Dhyanbhai Patel (DP)', classroom: 'A-103 Academic Building' },
  { id: 'agro3_sat_7', dayOfWeek: 'Saturday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_agro_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_agronomy', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // =========================================================================
  // DEPARTMENT OF BRS AH & DS (ANIMAL HUSBANDRY & DAIRY SCIENCE) - SEMESTER 3
  // =========================================================================
  // --- MONDAY ---
  { id: 'ahds3_mon_1', dayOfWeek: 'Monday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_ahds_mj304', subjectName: 'Animal Breeding & Reproduction', subjectCode: '03BRSMJ304', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_mon_2', dayOfWeek: 'Monday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_ahds_se303', subjectName: 'Google Tools', subjectCode: '04BRSSE303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'ahds3_mon_3', dayOfWeek: 'Monday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_ahds_yagnarth', subjectName: 'Yagnarth', subjectCode: 'YAGNARTH', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Campus Life Cell', classroom: 'Campus Grounds' },
  { id: 'ahds3_mon_4', dayOfWeek: 'Monday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_ahds_mn303', subjectName: 'Crop Production Technology-I (Kharif)', subjectCode: '03BRSMN303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Room A-103' },
  { id: 'ahds3_mon_5', dayOfWeek: 'Monday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_ahds_mj303', subjectName: 'Principles of Animal Nutrition (Part 1)', subjectCode: '03BRSMJ303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_mon_6', dayOfWeek: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_ahds_sports_d', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },
  { id: 'ahds3_mon_7', dayOfWeek: 'Monday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_ahds_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- TUESDAY ---
  { id: 'ahds3_tue_1', dayOfWeek: 'Tuesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_ahds_se303', subjectName: 'Google Tools', subjectCode: '04BRSSE303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'ahds3_tue_2', dayOfWeek: 'Tuesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_ahds_mn303', subjectName: 'Crop Production Technology-I (Kharif)', subjectCode: '03BRSMN303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Room A-103' },
  { id: 'ahds3_tue_3', dayOfWeek: 'Tuesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_ahds_mj303', subjectName: 'Principles of Animal Nutrition (Part 1)', subjectCode: '03BRSMJ303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_tue_4', dayOfWeek: 'Tuesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_ahds_mj304', subjectName: 'Animal Breeding & Reproduction', subjectCode: '03BRSMJ304', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_tue_5', dayOfWeek: 'Tuesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_ahds_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'AH & DS Faculty Cell', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_tue_6', dayOfWeek: 'Tuesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_ahds_ae303', subjectName: 'Value and Ethics', subjectCode: '04BRSAE303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'ahds3_tue_7', dayOfWeek: 'Tuesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_ahds_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- WEDNESDAY ---
  { id: 'ahds3_wed_1', dayOfWeek: 'Wednesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_ahds_se303', subjectName: 'Google Tools', subjectCode: '04BRSSE303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'ahds3_wed_2', dayOfWeek: 'Wednesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_ahds_mn303', subjectName: 'Crop Production Technology-I (Kharif)', subjectCode: '03BRSMN303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Room A-103' },
  { id: 'ahds3_wed_3', dayOfWeek: 'Wednesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_ahds_mj303', subjectName: 'Principles of Animal Nutrition (Part 1)', subjectCode: '03BRSMJ303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_wed_4', dayOfWeek: 'Wednesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_ahds_ae303', subjectName: 'Value and Ethics', subjectCode: '04BRSAE303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'ahds3_wed_5', dayOfWeek: 'Wednesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_ahds_depact', subjectName: 'Department Activities', subjectCode: 'DEPACT', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'AH & DS Faculty Cell', classroom: 'AH & DS Complex' },
  { id: 'ahds3_wed_6', dayOfWeek: 'Wednesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_ahds_sports_d', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },
  { id: 'ahds3_wed_7', dayOfWeek: 'Wednesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_ahds_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- THURSDAY ---
  { id: 'ahds3_thu_1', dayOfWeek: 'Thursday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_ahds_proj303', subjectName: 'Project Work', subjectCode: '04BRSOJT303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy Tech & Veterinary Field' },
  { id: 'ahds3_thu_2', dayOfWeek: 'Thursday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_ahds_proj303', subjectName: 'Project Work', subjectCode: '04BRSOJT303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy Tech & Veterinary Field' },
  { id: 'ahds3_thu_3', dayOfWeek: 'Thursday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_ahds_proj303', subjectName: 'Project Work', subjectCode: '04BRSOJT303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy Tech & Veterinary Field' },
  { id: 'ahds3_thu_4', dayOfWeek: 'Thursday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_ahds_proj303', subjectName: 'Project Work', subjectCode: '04BRSOJT303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy Tech & Veterinary Field' },
  { id: 'ahds3_thu_5', dayOfWeek: 'Thursday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_ahds_proj303', subjectName: 'Project Work', subjectCode: '04BRSOJT303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy Tech & Veterinary Field' },
  { id: 'ahds3_thu_6', dayOfWeek: 'Thursday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_ahds_proj303', subjectName: 'Project Work', subjectCode: '04BRSOJT303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy Tech & Veterinary Field' },
  { id: 'ahds3_thu_7', dayOfWeek: 'Thursday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_ahds_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- FRIDAY ---
  { id: 'ahds3_fri_1', dayOfWeek: 'Friday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_ahds_depact', subjectName: 'Department Activities', subjectCode: 'DEPACT', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'AH & DS Faculty Cell', classroom: 'AH & DS Complex' },
  { id: 'ahds3_fri_2', dayOfWeek: 'Friday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_ahds_mj304', subjectName: 'Animal Breeding & Reproduction', subjectCode: '03BRSMJ304', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_fri_3', dayOfWeek: 'Friday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_ahds_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'ahds3_fri_4', dayOfWeek: 'Friday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_ahds_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'AH & DS Faculty Cell', classroom: 'A-103 Academic Building' },
  { id: 'ahds3_fri_5', dayOfWeek: 'Friday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_ahds_mj303', subjectName: 'Principles of Animal Nutrition (Part 1) (Practical)', subjectCode: '03BRSMJ303 P', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'Animal Nutrition Lab' },
  { id: 'ahds3_fri_6', dayOfWeek: 'Friday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_ahds_mj303', subjectName: 'Principles of Animal Nutrition (Part 1) (Practical)', subjectCode: '03BRSMJ303 P', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_vijay_padhariya', teacherName: 'Vijaybhai Padhariya (VP)', classroom: 'Animal Nutrition Lab' },
  { id: 'ahds3_fri_7', dayOfWeek: 'Friday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_ahds_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- SATURDAY ---
  { id: 'ahds3_sat_1', dayOfWeek: 'Saturday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_brs_ahds_anubandh', subjectName: 'Anubandh', subjectCode: 'ANUBANDH', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Faculty & Student Welfare Cell', classroom: 'Central Hall' },
  { id: 'ahds3_sat_2', dayOfWeek: 'Saturday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_brs_ahds_mn303', subjectName: 'Crop Production Technology-I (Kharif) (Practical)', subjectCode: '03BRSMN303 P', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mukund Kalsariya (MK) / Femi Vala (FV)', classroom: 'Agronomy Farm' },
  { id: 'ahds3_sat_3', dayOfWeek: 'Saturday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_brs_ahds_mn303', subjectName: 'Crop Production Technology-I (Kharif) (Practical)', subjectCode: '03BRSMN303 P', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mukund Kalsariya (MK) / Femi Vala (FV)', classroom: 'Agronomy Farm' },
  { id: 'ahds3_sat_4', dayOfWeek: 'Saturday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_brs_ahds_ae303', subjectName: 'Value and Ethics', subjectCode: '04BRSAE303', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room A-103' },
  { id: 'ahds3_sat_5', dayOfWeek: 'Saturday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_brs_ahds_mj304', subjectName: 'Animal Breeding & Reproduction (Practical)', subjectCode: '03BRSMJ304 P', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy & Veterinary Lab' },
  { id: 'ahds3_sat_6', dayOfWeek: 'Saturday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_brs_ahds_mj304', subjectName: 'Animal Breeding & Reproduction (Practical)', subjectCode: '03BRSMJ304 P', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_ramdevsinh_gohil', teacherName: 'Ramdevsinh Gohil (RG)', classroom: 'Dairy & Veterinary Lab' },
  { id: 'ahds3_sat_7', dayOfWeek: 'Saturday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_brs_ahds_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_brs_ahds', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // =========================================================================
  // DEPARTMENT OF NATURAL FARMING (B.VOC NATURAL FARMING) - SEMESTER 3
  // =========================================================================
  // --- MONDAY ---
  { id: 'nf3_mon_1', dayOfWeek: 'Monday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_nf_ae303', subjectName: 'Value and Ethics', subjectCode: '06BVOCAE303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room B-203' },
  { id: 'nf3_mon_2', dayOfWeek: 'Monday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_nf_mj305', subjectName: 'Introduction to Plant Life', subjectCode: '06BVOCMJ305', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'B-102 Academic Building' },
  { id: 'nf3_mon_3', dayOfWeek: 'Monday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_nf_yagnarth', subjectName: 'Yagnarth', subjectCode: 'YAGNARTH', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Campus Life Cell', classroom: 'Campus Grounds' },
  { id: 'nf3_mon_4', dayOfWeek: 'Monday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_nf_fieldwork', subjectName: 'Field Work', subjectCode: 'FIELDWORK', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'Natural Farming Field' },
  { id: 'nf3_mon_5', dayOfWeek: 'Monday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_nf_fieldwork', subjectName: 'Field Work', subjectCode: 'FIELDWORK', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'Natural Farming Field' },
  { id: 'nf3_mon_6', dayOfWeek: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_nf_complab', subjectName: 'Computer Lab', subjectCode: 'COMPLAB', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'nf3_mon_7', dayOfWeek: 'Monday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_nf_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- TUESDAY ---
  { id: 'nf3_tue_1', dayOfWeek: 'Tuesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_nf_mj306', subjectName: 'Natural Crop Protection', subjectCode: '06BVOCMJ306', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'B-102 Academic Building' },
  { id: 'nf3_tue_2', dayOfWeek: 'Tuesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_nf_mj305', subjectName: 'Introduction to Plant Life', subjectCode: '06BVOCMJ305', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'B-102 Academic Building' },
  { id: 'nf3_tue_3', dayOfWeek: 'Tuesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_nf_prep', subjectName: 'Self Study / Preparation', subjectCode: 'SELFSTUDY', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Natural Farming Faculty Cell', classroom: 'B-102 Academic Building' },
  { id: 'nf3_tue_4', dayOfWeek: 'Tuesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_nf_se303', subjectName: 'Google Tools', subjectCode: '06BVOCSE303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'nf3_tue_5', dayOfWeek: 'Tuesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_nf_mj305', subjectName: 'Introduction to Plant Life (Practical)', subjectCode: '06BVOCMJ305 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'Botany & Soil Lab' },
  { id: 'nf3_tue_6', dayOfWeek: 'Tuesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_nf_mj305', subjectName: 'Introduction to Plant Life (Practical)', subjectCode: '06BVOCMJ305 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'Botany & Soil Lab' },
  { id: 'nf3_tue_7', dayOfWeek: 'Tuesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_nf_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- WEDNESDAY ---
  { id: 'nf3_wed_1', dayOfWeek: 'Wednesday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_nf_ae303', subjectName: 'Value and Ethics', subjectCode: '06BVOCAE303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room B-203' },
  { id: 'nf3_wed_2', dayOfWeek: 'Wednesday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_nf_mj306', subjectName: 'Natural Crop Protection (Practical)', subjectCode: '06BVOCMJ306 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Bio-Input Lab' },
  { id: 'nf3_wed_3', dayOfWeek: 'Wednesday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_nf_mj306', subjectName: 'Natural Crop Protection (Practical)', subjectCode: '06BVOCMJ306 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Bio-Input Lab' },
  { id: 'nf3_wed_4', dayOfWeek: 'Wednesday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_nf_mj306', subjectName: 'Natural Crop Protection', subjectCode: '06BVOCMJ306', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'B-102 Academic Building' },
  { id: 'nf3_wed_5', dayOfWeek: 'Wednesday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_nf_tissue', subjectName: 'Soil/Tissue Culture Lab', subjectCode: 'TISSUE_CULTURE', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Soil/Tissue Culture Lab' },
  { id: 'nf3_wed_6', dayOfWeek: 'Wednesday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_nf_tissue', subjectName: 'Soil/Tissue Culture Lab', subjectCode: 'TISSUE_CULTURE', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Soil/Tissue Culture Lab' },
  { id: 'nf3_wed_7', dayOfWeek: 'Wednesday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_nf_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- THURSDAY ---
  { id: 'nf3_thu_1', dayOfWeek: 'Thursday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_nf_proj303', subjectName: 'Project Work', subjectCode: '06BVOCOJT303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Natural Farming Research Field' },
  { id: 'nf3_thu_2', dayOfWeek: 'Thursday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_nf_proj303', subjectName: 'Project Work', subjectCode: '06BVOCOJT303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Natural Farming Research Field' },
  { id: 'nf3_thu_3', dayOfWeek: 'Thursday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_nf_proj303', subjectName: 'Project Work', subjectCode: '06BVOCOJT303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Natural Farming Research Field' },
  { id: 'nf3_thu_4', dayOfWeek: 'Thursday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_nf_proj303', subjectName: 'Project Work', subjectCode: '06BVOCOJT303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Natural Farming Research Field' },
  { id: 'nf3_thu_5', dayOfWeek: 'Thursday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_nf_proj303', subjectName: 'Project Work', subjectCode: '06BVOCOJT303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Natural Farming Research Field' },
  { id: 'nf3_thu_6', dayOfWeek: 'Thursday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_nf_proj303', subjectName: 'Project Work', subjectCode: '06BVOCOJT303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Natural Farming Research Field' },
  { id: 'nf3_thu_7', dayOfWeek: 'Thursday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_nf_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- FRIDAY ---
  { id: 'nf3_fri_1', dayOfWeek: 'Friday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_nf_ae303', subjectName: 'Value and Ethics', subjectCode: '06BVOCAE303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_ghanshyam_hirani', teacherName: 'Ghanshyam Hirani (GH)', classroom: 'Room B-203' },
  { id: 'nf3_fri_2', dayOfWeek: 'Friday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_nf_mj305', subjectName: 'Introduction to Plant Life (Practical)', subjectCode: '06BVOCMJ305 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'Botany & Soil Lab' },
  { id: 'nf3_fri_3', dayOfWeek: 'Friday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_nf_mj305', subjectName: 'Introduction to Plant Life (Practical)', subjectCode: '06BVOCMJ305 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_kalaria_rajvee', teacherName: 'Rajvee Kalariya (RK)', classroom: 'Botany & Soil Lab' },
  { id: 'nf3_fri_4', dayOfWeek: 'Friday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_nf_se303', subjectName: 'Google Tools', subjectCode: '06BVOCSE303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'nf3_fri_5', dayOfWeek: 'Friday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_nf_journal', subjectName: 'Journal Writing', subjectCode: 'JOURNAL', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Natural Farming Faculty Cell', classroom: 'B-102 Academic Building' },
  { id: 'nf3_fri_6', dayOfWeek: 'Friday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_nf_library', subjectName: 'Library', subjectCode: 'LIBRARY', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Central Library Cell', classroom: 'Central Library' },
  { id: 'nf3_fri_7', dayOfWeek: 'Friday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_nf_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },

  // --- SATURDAY ---
  { id: 'nf3_sat_1', dayOfWeek: 'Saturday', startTime: '07:30 AM', endTime: '08:30 AM', subjectId: 'sub_nf_anubandh', subjectName: 'Anubandh', subjectCode: 'ANUBANDH', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Faculty & Student Welfare Cell', classroom: 'Central Hall' },
  { id: 'nf3_sat_2', dayOfWeek: 'Saturday', startTime: '08:40 AM', endTime: '09:40 AM', subjectId: 'sub_nf_mj306', subjectName: 'Natural Crop Protection (Practical)', subjectCode: '06BVOCMJ306 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Bio-Input Lab' },
  { id: 'nf3_sat_3', dayOfWeek: 'Saturday', startTime: '09:40 AM', endTime: '10:40 AM', subjectId: 'sub_nf_mj306', subjectName: 'Natural Crop Protection (Practical)', subjectCode: '06BVOCMJ306 P', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Mr. Sachin Dhokiya (SD)', classroom: 'Bio-Input Lab' },
  { id: 'nf3_sat_4', dayOfWeek: 'Saturday', startTime: '02:00 PM', endTime: '03:00 PM', subjectId: 'sub_nf_se303', subjectName: 'Google Tools', subjectCode: '06BVOCSE303', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_vala_femi', teacherName: 'Femi Vala (FV)', classroom: 'Computer Lab' },
  { id: 'nf3_sat_5', dayOfWeek: 'Saturday', startTime: '03:00 PM', endTime: '04:00 PM', subjectId: 'sub_nf_depact', subjectName: 'Departmental Activities', subjectCode: 'DEPACT', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Natural Farming Faculty Cell', classroom: 'Natural Farming Dept' },
  { id: 'nf3_sat_6', dayOfWeek: 'Saturday', startTime: '04:00 PM', endTime: '05:00 PM', subjectId: 'sub_nf_depact', subjectName: 'Departmental Activities', subjectCode: 'DEPACT', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_sachin_dhokiya', teacherName: 'Natural Farming Faculty Cell', classroom: 'Natural Farming Dept' },
  { id: 'nf3_sat_7', dayOfWeek: 'Saturday', startTime: '05:00 PM', endTime: '06:00 PM', subjectId: 'sub_nf_sports', subjectName: 'Sports', subjectCode: 'SPORTS', departmentId: 'dept_bvoc_nf', semester: 3, teacherId: 'usr_fac_mukund_kalsariya', teacherName: 'Mr. Mukund Kalsariya (MK)', classroom: 'University Sports Ground' },
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att_20260804_it_django',
    timetableSlotId: 'slot_it_3',
    date: '2026-08-04',
    departmentId: 'dept_it',
    semester: 3,
    subjectId: 'sub_py_django',
    subjectName: 'Python & Django Web Framework',
    teacherId: 'usr_hod_it',
    teacherName: 'Prof. Rishu Raj',
    classroom: 'Lab-B (Web Dev Center)',
    lectureTime: '10:00 AM - 11:00 AM',
    isSubmitted: true,
    submittedAt: '2026-08-04 10:55:00',
    studentEntries: [
      { studentId: 'usr_student_arav', studentName: 'Arav Sharma', enrollmentNo: '2024CS0301', status: 'absent', remarks: 'Unexcused Absence (1 Hour Lecture)' },
      { studentId: 'usr_student_priya', studentName: 'Priya Patel', enrollmentNo: '2024CS0302', status: 'present' },
      { studentId: 'usr_student_kabir', studentName: 'Kabir Verma', enrollmentNo: '2024CS0303', status: 'present' },
      { studentId: 'usr_student_divya', studentName: 'Divya Joshi', enrollmentNo: '2024CS0304', status: 'present' },
      { studentId: 'usr_student_rohit', studentName: 'Rohit Singh', enrollmentNo: '2024CS0305', status: 'absent', remarks: 'Unexcused Absence (1 Hour Lecture)' },
    ],
  },
  {
    id: 'att_20260803_it_oops',
    timetableSlotId: 'slot_it_1',
    date: '2026-08-03',
    departmentId: 'dept_it',
    semester: 3,
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    teacherId: 'usr_teacher_mehta',
    teacherName: 'Prof. Rajesh Mehta',
    classroom: 'Room 204 (Computing Lab)',
    lectureTime: '11:00 AM - 12:00 PM',
    isSubmitted: true,
    submittedAt: '2026-08-03 11:58:00',
    studentEntries: [
      { studentId: 'usr_student_arav', studentName: 'Arav Sharma', enrollmentNo: '2024CS0301', status: 'absent', remarks: 'Medical Leave Requested (1 Hour)' },
      { studentId: 'usr_student_priya', studentName: 'Priya Patel', enrollmentNo: '2024CS0302', status: 'present' },
      { studentId: 'usr_student_kabir', studentName: 'Kabir Verma', enrollmentNo: '2024CS0303', status: 'absent', remarks: 'Unexcused Absence' },
      { studentId: 'usr_student_divya', studentName: 'Divya Joshi', enrollmentNo: '2024CS0304', status: 'present' },
      { studentId: 'usr_student_rohit', studentName: 'Rohit Singh', enrollmentNo: '2024CS0305', status: 'present' },
    ],
  },
  {
    id: 'att_20260801_it_se',
    timetableSlotId: 'slot_it_2',
    date: '2026-08-01',
    departmentId: 'dept_it',
    semester: 3,
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering',
    teacherId: 'usr_hod_it',
    teacherName: 'Prof. Rishu Raj',
    classroom: 'Room 202',
    lectureTime: '02:00 PM - 04:00 PM',
    isSubmitted: true,
    submittedAt: '2026-08-01 15:50:00',
    studentEntries: [
      { studentId: 'usr_student_arav', studentName: 'Arav Sharma', enrollmentNo: '2024CS0301', status: 'late', remarks: 'Arrived 20 mins late (2 Hour Lab)' },
      { studentId: 'usr_student_priya', studentName: 'Priya Patel', enrollmentNo: '2024CS0302', status: 'present' },
      { studentId: 'usr_student_kabir', studentName: 'Kabir Verma', enrollmentNo: '2024CS0303', status: 'present' },
      { studentId: 'usr_student_divya', studentName: 'Divya Joshi', enrollmentNo: '2024CS0304', status: 'present' },
      { studentId: 'usr_student_rohit', studentName: 'Rohit Singh', enrollmentNo: '2024CS0305', status: 'present' },
    ],
  },
  {
    id: 'att_20260731_it_ethics',
    timetableSlotId: 'slot_it_4',
    date: '2026-07-31',
    departmentId: 'dept_it',
    semester: 3,
    subjectId: 'sub_ae303',
    subjectName: 'Values and Ethics',
    teacherId: 'usr_teacher_desai',
    teacherName: 'Dr. Ananya Desai',
    classroom: 'Auditorium B',
    lectureTime: '09:00 AM - 10:00 AM',
    isSubmitted: true,
    submittedAt: '2026-07-31 09:50:00',
    studentEntries: [
      { studentId: 'usr_student_arav', studentName: 'Arav Sharma', enrollmentNo: '2024CS0301', status: 'present' },
      { studentId: 'usr_student_priya', studentName: 'Priya Patel', enrollmentNo: '2024CS0302', status: 'present' },
      { studentId: 'usr_student_kabir', studentName: 'Kabir Verma', enrollmentNo: '2024CS0303', status: 'absent', remarks: 'Unexcused Absence' },
      { studentId: 'usr_student_divya', studentName: 'Divya Joshi', enrollmentNo: '2024CS0304', status: 'present' },
      { studentId: 'usr_student_rohit', studentName: 'Rohit Singh', enrollmentNo: '2024CS0305', status: 'leave', remarks: 'Official Event Duty' },
    ],
  },
  {
    id: 'att_20260728_1',
    timetableSlotId: 'slot_it_se',
    date: '2026-07-28',
    departmentId: 'dept_it',
    semester: 3,
    subjectId: 'sub_se303',
    subjectName: 'Google Tools',
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    classroom: 'Lab-A (Computing Center)',
    lectureTime: '09:00 AM - 10:00 AM',
    isSubmitted: true,
    submittedAt: '2026-07-28 09:55:00',
    studentEntries: [
      { studentId: 'usr_student_arav', studentName: 'Arav Sharma', enrollmentNo: '2024CS0301', status: 'present' },
      { studentId: 'usr_student_priya', studentName: 'Priya Patel', enrollmentNo: '2024CS0302', status: 'present' },
      { studentId: 'usr_student_kabir', studentName: 'Kabir Verma', enrollmentNo: '2024CS0303', status: 'absent' },
      { studentId: 'usr_student_divya', studentName: 'Divya Joshi', enrollmentNo: '2024CS0304', status: 'present' },
      { studentId: 'usr_student_rohit', studentName: 'Rohit Singh', enrollmentNo: '2024CS0305', status: 'absent' },
    ],
  },
  {
    id: 'att_20260727_2',
    timetableSlotId: 'slot_it_va',
    date: '2026-07-27',
    departmentId: 'dept_it',
    semester: 3,
    subjectId: 'sub_va303',
    subjectName: 'Rural Innovation',
    teacherId: 'usr_teacher_gh',
    teacherName: 'Ghanshyam Hirani (GH)',
    classroom: 'Lecture Hall 102',
    lectureTime: '10:15 AM - 11:15 AM',
    isSubmitted: true,
    submittedAt: '2026-07-27 10:20:00',
    studentEntries: [
      { studentId: 'usr_student_arav', studentName: 'Arav Sharma', enrollmentNo: '2024CS0301', status: 'present' },
      { studentId: 'usr_student_priya', studentName: 'Priya Patel', enrollmentNo: '2024CS0302', status: 'late' },
      { studentId: 'usr_student_kabir', studentName: 'Kabir Verma', enrollmentNo: '2024CS0303', status: 'absent' },
      { studentId: 'usr_student_divya', studentName: 'Divya Joshi', enrollmentNo: '2024CS0304', status: 'present' },
      { studentId: 'usr_student_rohit', studentName: 'Rohit Singh', enrollmentNo: '2024CS0305', status: 'leave' },
    ],
  },
];

export const INITIAL_EDIT_REQUESTS: AttendanceEditRequest[] = [
  {
    id: 'req_001',
    attendanceRecordId: 'att_20260728_1',
    subjectName: 'Google Tools',
    date: '2026-07-28',
    teacherId: 'usr_fac_vala_femi',
    teacherName: 'Dr. Vala Femi (FV)',
    departmentId: 'dept_it',
    semester: 3,
    reason: 'Student Kabir Verma submitted medical leave document after class hours.',
    requestedChanges: [
      {
        studentId: 'usr_student_kabir',
        studentName: 'Kabir Verma',
        oldStatus: 'absent',
        newStatus: 'leave',
      },
    ],
    status: 'pending',
    createdAt: '2026-07-28 14:30:00',
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_py_django',
    title: 'Python Django MVT Architecture & REST API Implementation',
    description: 'Develop a full-fledged web application using Python Django framework (MVT pattern), ORM model migrations, custom middleware, and Django REST Framework (DRF) serializers.',
    subjectId: 'sub_py_django',
    subjectName: 'Python & Django Web Framework',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_hod_it',
    teacherName: 'Prof. Rishu Raj',
    dueDate: '2026-08-18 23:59',
    totalMarks: 50,
    attachmentUrl: '#',
    attachmentName: 'Django_REST_Framework_Lab_Guide.pdf',
    createdAt: '2026-08-01 10:00:00',
  },
  {
    id: 'asg_101',
    title: 'Software Engineering & Agile System Design',
    description: 'Design a comprehensive UML class diagram and sprint user stories for a university campus management portal. Submit detailed system documentation.',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_hod_it',
    teacherName: 'Prof. Rishu Raj',
    dueDate: '2026-08-10 23:59',
    totalMarks: 50,
    attachmentUrl: '#',
    attachmentName: 'Agile_Design_Specification_Guide.pdf',
    createdAt: '2026-07-25 10:00:00',
  },
  {
    id: 'asg_102',
    title: 'Object-Oriented Programming (C++) Case Study',
    description: 'Implement a custom memory pool manager using dynamic pointer allocation and template classes in C++. Include memory leak verification logs.',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'fac_1',
    teacherName: 'Mitulgiri Gauswami',
    dueDate: '2026-08-08 18:00',
    totalMarks: 40,
    attachmentUrl: '#',
    attachmentName: 'CPP_Templates_MemoryPool_Guidelines.pptx',
    createdAt: '2026-07-26 12:00:00',
  },
  {
    id: 'asg_103',
    title: 'Soil Fertility & Organic Fertilizer Synthesis',
    description: 'Prepare a report on nitrogen fixing bacterial cultures and vermicompost yield analysis for monsoon crop rotation cycles.',
    subjectId: 'sub_agri201',
    subjectName: 'Soil Science & Organic Fertilizers',
    departmentId: 'dept_brs_agronomy',
    semester: 2,
    teacherId: 'usr_hod_agri',
    teacherName: 'Prof. Ramesh Bhai Patel',
    dueDate: '2026-08-05 17:00',
    totalMarks: 50,
    attachmentUrl: '#',
    attachmentName: 'Soil_Fertility_Lab_Manual_2026.pdf',
    createdAt: '2026-07-20 09:00:00',
  },
  {
    id: 'asg_104',
    title: 'Closed Deadline Sample Assignment (Past Due)',
    description: 'This is an example assignment whose submission deadline has expired (2026-07-20). Notice that the submit button is hidden for students.',
    subjectId: 'sub_ae303',
    subjectName: 'Values and Ethics',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'fac_3',
    teacherName: 'Ghanshyam Hirani',
    dueDate: '2026-07-20 23:59',
    totalMarks: 20,
    attachmentUrl: '#',
    attachmentName: 'Ethics_Case_Study_Doc.docx',
    createdAt: '2026-07-10 10:00:00',
  },
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub_m_01',
    assignmentId: 'asg_101',
    studentId: 'usr_student_arav',
    studentName: 'Arav Sharma',
    enrollmentNo: '2024CS0401',
    submittedAt: '2026-07-28 18:20:00',
    fileUrl: '#',
    fileName: 'Arav_Sharma_2024CS0401_DBMS_Schema.pdf',
    comments: 'Completed all 3NF and BCNF normalization proofs.',
    isLate: false,
    marksObtained: 48,
    feedback: 'Excellent breakdown of entity relationships and key constraints.',
    status: 'graded',
  },
  {
    id: 'sub_m_02',
    assignmentId: 'asg_101',
    studentId: 'usr_student_priya',
    studentName: 'Priya Patel',
    enrollmentNo: '2024CS0402',
    submittedAt: '2026-07-29 08:15:00',
    fileUrl: '#',
    fileName: 'Priya_Patel_2024CS0402_DBMS_Assignment.pdf',
    comments: 'Attached schema documentation.',
    isLate: false,
    status: 'submitted',
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz_django_01',
    title: 'Python Django Framework & MVT Architecture Quiz',
    subjectId: 'sub_py_django',
    subjectName: 'Python & Django Web Framework',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_hod_it',
    durationMinutes: 20,
    totalMarks: 20,
    dueDate: '2026-08-20 23:59',
    isPublished: true,
    createdAt: '2026-08-01 09:00:00',
    questions: [
      {
        id: 'dq1',
        question: 'In Python Django framework, what does the MVT architecture stand for?',
        options: ['Model-View-Template', 'Model-Value-Test', 'Module-View-Type', 'Method-Vector-Trait'],
        correctAnswer: 0,
        explanation: 'Django follows Model-View-Template (MVT) where Templates handle rendering HTML layouts while Views handle business logic.',
      },
      {
        id: 'dq2',
        question: 'Which Django command creates database migrations based on changes in models.py?',
        options: ['python manage.py runserver', 'python manage.py makemigrations', 'python manage.py migrate', 'python manage.py collectstatic'],
        correctAnswer: 1,
        explanation: 'makemigrations inspects models.py and generates python migration script files.',
      },
      {
        id: 'dq3',
        question: 'Which file in a Django project defines URL path routing to views?',
        options: ['settings.py', 'urls.py', 'wsgi.py', 'apps.py'],
        correctAnswer: 1,
        explanation: 'urls.py maps HTTP URL routes to Django view functions or class-based views (CBVs).',
      },
      {
        id: 'dq4',
        question: 'What is the primary purpose of Django ORM?',
        options: [
          'To generate CSS themes automatically',
          'To interact with relational databases using Python object syntax',
          'To compress JavaScript bundles',
          'To establish WebSocket connections'
        ],
        correctAnswer: 1,
        explanation: 'Django Object-Relational Mapper (ORM) translates Python code into SQL queries for PostgreSQL, SQLite, MySQL, etc.',
      },
    ],
  },
  {
    id: 'quiz_401',
    title: 'Mid-Term C++ OOPs & Inheritance Speed Quiz',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    departmentId: 'dept_it',
    semester: 3,
    teacherId: 'usr_teacher_mg',
    durationMinutes: 15,
    totalMarks: 20,
    dueDate: '2026-08-15 17:00',
    isPublished: true,
    createdAt: '2026-08-02 11:00:00',
    questions: [
      {
        id: 'q1',
        question: 'Which C++ access specifier allows member variables to be accessed in derived classes but not outside the class hierarchy?',
        options: ['private', 'protected', 'public', 'friend'],
        correctAnswer: 1,
        explanation: 'Protected members are accessible within the base class and any classes derived from it.',
      },
      {
        id: 'q2',
        question: 'Which keyword is used in C++ to achieve runtime polymorphism with virtual member functions?',
        options: ['virtual', 'override', 'dynamic', 'inline'],
        correctAnswer: 0,
        explanation: 'The virtual keyword in the base class enables dynamic dispatch via vtable at runtime.',
      },
      {
        id: 'q3',
        question: 'What is the destructor syntax for a class named UniversityStudent?',
        options: ['~UniversityStudent()', 'delete UniversityStudent()', '!UniversityStudent()', 'drop UniversityStudent()'],
        correctAnswer: 0,
        explanation: 'In C++, destructors have the same name as the class preceded by a tilde (~).',
      },
      {
        id: 'q4',
        question: 'Which OOP concept binds data together with functions that manipulate that data?',
        options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction'],
        correctAnswer: 0,
        explanation: 'Encapsulation is the bundling of data and the methods that operate on that data into a single unit/class.',
      },
    ],
  },
];

export const INITIAL_QUIZ_RESULTS: QuizResult[] = [
  {
    id: 'qres_01',
    quizId: 'quiz_401',
    quizTitle: 'Mid-Term C++ OOPs & Inheritance Speed Quiz',
    studentId: 'usr_student_arav',
    studentName: 'Arav Sharma',
    score: 20,
    totalMarks: 20,
    percentage: 100,
    completedAt: '2026-08-03 16:10:00',
    timeTakenSeconds: 340,
  },
  {
    id: 'qres_02',
    quizId: 'quiz_401',
    quizTitle: 'Mid-Term C++ OOPs & Inheritance Speed Quiz',
    studentId: 'usr_student_priya',
    studentName: 'Priya Patel',
    score: 15,
    totalMarks: 20,
    percentage: 75,
    completedAt: '2026-08-03 16:25:00',
    timeTakenSeconds: 420,
  },
];

export const INITIAL_RESULTS: StudentResult[] = [
  {
    id: 'res_arav_sem3',
    studentId: 'usr_student_arav',
    studentName: 'Arav Sharma',
    enrollmentNo: '2024CS0301',
    departmentId: 'dept_it',
    semester: 3,
    academicYear: '2025-2026',
    subjects: [
      { subjectCode: '08BVOCMJ305', subjectName: 'Oops – using C++', credits: 4, internalMarks: 28, externalMarks: 64, totalMarks: 92, grade: 'A+', gradePoint: 10 },
      { subjectCode: '08BVOCMJ307', subjectName: 'Python & Django Web Framework', credits: 4, internalMarks: 27, externalMarks: 62, totalMarks: 89, grade: 'A+', gradePoint: 10 },
      { subjectCode: '08BVOCMJ306', subjectName: 'Software Engineering', credits: 4, internalMarks: 26, externalMarks: 58, totalMarks: 84, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCAE303', subjectName: 'Values and Ethics', credits: 3, internalMarks: 25, externalMarks: 56, totalMarks: 81, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCSE303', subjectName: 'Google Tools', credits: 3, internalMarks: 26, externalMarks: 57, totalMarks: 83, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCVA303', subjectName: 'Rural Innovation', credits: 2, internalMarks: 18, externalMarks: 40, totalMarks: 58, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCOJT303', subjectName: 'Project Work', credits: 6, internalMarks: 46, externalMarks: 92, totalMarks: 138, grade: 'A+', gradePoint: 10 },
    ],
    sgpa: 9.62,
    cgpa: 9.48,
    remarks: 'Outstanding Academic Performance',
  },
  {
    id: 'res_priya_sem3',
    studentId: 'usr_student_priya',
    studentName: 'Priya Patel',
    enrollmentNo: '2024CS0302',
    departmentId: 'dept_it',
    semester: 3,
    academicYear: '2025-2026',
    subjects: [
      { subjectCode: '08BVOCMJ305', subjectName: 'Oops – using C++', credits: 4, internalMarks: 26, externalMarks: 58, totalMarks: 84, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCMJ307', subjectName: 'Python & Django Web Framework', credits: 4, internalMarks: 26, externalMarks: 60, totalMarks: 86, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCMJ306', subjectName: 'Software Engineering', credits: 4, internalMarks: 25, externalMarks: 55, totalMarks: 80, grade: 'A', gradePoint: 9 },
      { subjectCode: '08BVOCAE303', subjectName: 'Values and Ethics', credits: 3, internalMarks: 24, externalMarks: 52, totalMarks: 76, grade: 'B+', gradePoint: 8 },
      { subjectCode: '08BVOCSE303', subjectName: 'Google Tools', credits: 3, internalMarks: 25, externalMarks: 54, totalMarks: 79, grade: 'B+', gradePoint: 8 },
      { subjectCode: '08BVOCVA303', subjectName: 'Rural Innovation', credits: 2, internalMarks: 17, externalMarks: 38, totalMarks: 55, grade: 'B+', gradePoint: 8 },
      { subjectCode: '08BVOCOJT303', subjectName: 'Project Work', credits: 6, internalMarks: 44, externalMarks: 86, totalMarks: 130, grade: 'A', gradePoint: 9 },
    ],
    sgpa: 8.85,
    cgpa: 8.78,
    remarks: 'First Class with Distinction',
  },
];

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat_django_01',
    title: 'Python Django Framework: MVT, ORM Models & REST APIs',
    description: 'Complete official lecture notes covering Django project setup, settings configuration, ORM querysets, forms, custom middleware, and Django REST Framework.',
    type: 'pdf',
    fileUrl: '#',
    fileName: 'Python_Django_Framework_Mastery_Guide.pdf',
    subjectId: 'sub_py_django',
    subjectName: 'Python & Django Web Framework',
    departmentId: 'dept_it',
    semester: 3,
    uploadedBy: 'usr_hod_it',
    uploadedByName: 'Prof. Rishu Raj',
    uploadedAt: '2026-08-01 10:30:00',
    downloadCount: 198,
  },
  {
    id: 'mat_01',
    title: 'Unit 1 & 2: Object-Oriented Programming with C++ Classes & Inheritance',
    description: 'Comprehensive slides covering constructors, destructors, operator overloading, and inheritance hierarchies in C++.',
    type: 'pdf',
    fileUrl: '#',
    fileName: 'CPP_OOP_Unit1_2_LectureNotes.pdf',
    subjectId: 'sub_mj305',
    subjectName: 'Oops – using C++',
    departmentId: 'dept_it',
    semester: 3,
    uploadedBy: 'usr_teacher_mg',
    uploadedByName: 'Mitulgiri Gauswami (MG)',
    uploadedAt: '2026-08-02 09:30:00',
    downloadCount: 142,
  },
  {
    id: 'mat_02',
    title: 'Software Engineering: Requirements Engineering & Agile Methodologies',
    description: 'Presentation slides and case studies on Scrum sprint planning, SRS documents, and testing life cycles.',
    type: 'ppt',
    fileUrl: '#',
    fileName: 'Software_Engineering_Agile_Architecture.pptx',
    subjectId: 'sub_mj306',
    subjectName: 'Software Engineering',
    departmentId: 'dept_it',
    semester: 3,
    uploadedBy: 'usr_hod_it',
    uploadedByName: 'Prof. Rishu Raj',
    uploadedAt: '2026-08-03 14:15:00',
    downloadCount: 118,
  },
  {
    id: 'mat_03',
    title: 'Google Workspace Cloud Tools & Productivity Suites in Higher Ed',
    description: 'Official university guide on Google Classroom, Sheets automations, Google Apps Script, and Colab.',
    type: 'video',
    fileUrl: 'https://youtube.com',
    fileName: 'Google_Tools_Cloud_Productivity.mp4',
    subjectId: 'sub_se303',
    subjectName: 'Google Tools',
    departmentId: 'dept_it',
    semester: 3,
    uploadedBy: 'usr_fac_vala_femi',
    uploadedByName: 'Dr. Vala Femi (FV)',
    uploadedAt: '2026-08-04 16:00:00',
    downloadCount: 215,
  },
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not_vac_1',
    title: 'Inter-Departmental Vacancy: Junior Research Assistant (Agro-Food Lab)',
    content: 'The Department of Agro-Food Processing invites applications for 2 Junior Research Assistant vacancies under ICAR Grant 2026. Students & faculty from all university departments are eligible to apply before Aug 15.',
    category: 'vacancy',
    departmentId: 'dept_bvoc_afp',
    departmentName: 'Agro-Food Processing',
    postedBy: 'usr_hod_afp',
    postedByName: 'Dr. Ramesh Chandra',
    postedByRole: 'HOD Agro-Food Processing',
    date: '2026-08-02',
    isPinned: true,
  },
  {
    id: 'not_vac_2',
    title: 'Faculty & Lab Instructor Vacancy: Department of Computer Science & IT',
    content: 'Applications are invited for 1 Adjunct Lecturer and 2 Student Teaching Assistant vacancies in Web & AI Technologies. Teachers and senior students across disciplines may submit resumes.',
    category: 'vacancy',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    postedBy: 'usr_hod_cs',
    postedByName: 'Dr. Vikramaditya Solanki',
    postedByRole: 'HOD CS',
    date: '2026-08-01',
    isPinned: true,
  },
  {
    id: 'not_vac_3',
    title: 'Project Coordinator Vacancy: Natural Farming Field Mission',
    content: 'The Department of Natural Farming has an open Field Project Coordinator vacancy. Interested students and teachers across Lokbharti University are encouraged to apply by Aug 10.',
    category: 'vacancy',
    departmentId: 'dept_bvoc_nf',
    departmentName: 'Natural Farming',
    postedBy: 'usr_hod_nf',
    postedByName: 'Dr. Pravinbhai Patel',
    postedByRole: 'HOD Natural Farming',
    date: '2026-07-30',
    isPinned: false,
  },
  {
    id: 'not_1',
    title: 'Schedule for Mid-Semester Examinations (Monsoon Semester 2026)',
    content: 'All undergraduate students of CS, Agriculture, and Rural Studies are hereby notified that Mid-Semester Examinations will commence from August 18, 2026. Detailed seat plans will be displayed on department notice boards.',
    category: 'exam',
    postedBy: 'usr_admin',
    postedByName: 'Dr. R. K. Shastri',
    postedByRole: 'Registrar',
    date: '2026-07-27',
    isPinned: true,
  },
  {
    id: 'not_2',
    title: 'URGENT: Mandatory 75% Attendance Requirement for Semester End Assessment',
    content: 'As per Academic Regulations Section 4.2, students with overall attendance below 75% will be strictly debarred from appearing in external examinations without prior HOD approval.',
    category: 'urgent',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    postedBy: 'usr_hod_cs',
    postedByName: 'Dr. Vikramaditya Solanki',
    postedByRole: 'HOD CS',
    date: '2026-07-26',
    isPinned: true,
  },
  {
    id: 'not_3',
    title: 'National Conference on Sustainable Organic Agriculture 2026',
    content: 'Lokbharti University is hosting a 2-day national symposium on organic seed preservation. Registrations open for all faculty and research scholars.',
    category: 'general',
    postedBy: 'usr_hod_agri',
    postedByName: 'Dr. Sunita Parmar',
    postedByRole: 'HOD Agriculture',
    date: '2026-07-25',
    isPinned: false,
  },
];

export const INITIAL_CALENDAR_EVENTS: AcademicEvent[] = [
  // Odd Semester (Sem 1, 3 & 5)
  { id: 'evt_01', title: '3rd & 5th Sem Begins', description: 'Academic session commences for 3rd and 5th Semester students', startDate: '2026-06-08', endDate: '2026-06-08', type: 'semester', isImportant: true },
  { id: 'evt_02', title: 'Yoga Day Celebration', description: 'University-wide Yoga & Wellness Workshop', startDate: '2026-06-21', endDate: '2026-06-21', type: 'event' },
  { id: 'evt_03', title: 'Digital Portfolio Workshop (AP, BBA, Agronomy)', description: 'Hands-on portfolio building for SY & TY students', startDate: '2026-06-23', endDate: '2026-06-25', type: 'event' },
  { id: 'evt_04', title: 'M. M. Bhatt Birth Anniversary', description: 'Commemorative lectures and awards ceremony', startDate: '2026-06-26', endDate: '2026-06-26', type: 'event' },
  { id: 'evt_05', title: '1st Sem Begins & BRS-5 / BA-5 Internship Starts', description: 'Freshmen orientation & senior internship commencement', startDate: '2026-07-01', endDate: '2026-07-01', type: 'semester', isImportant: true },
  { id: 'evt_06', title: 'BA-5 Internship Ends', description: 'Final report submission and evaluation', startDate: '2026-07-15', endDate: '2026-07-15', type: 'deadline' },
  { id: 'evt_07', title: 'DIY from Waste to Best Expo', description: 'Student sustainable innovation exhibition', startDate: '2026-07-22', endDate: '2026-07-22', type: 'event' },
  { id: 'evt_08', title: 'BVoc-5 Internship Begins', description: '5th Semester vocational industry deployment', startDate: '2026-07-27', endDate: '2026-07-27', type: 'semester' },
  { id: 'evt_09', title: 'Guru Purnima Celebrations', description: 'Faculty felicitation & cultural gathering', startDate: '2026-07-29', endDate: '2026-07-29', type: 'holiday' },
  { id: 'evt_10', title: 'BRS-5 Internship Ends', description: 'BRS 5th Semester field evaluation', startDate: '2026-08-01', endDate: '2026-08-01', type: 'deadline' },
  { id: 'evt_11', title: 'Educational Field Tour (Tentative)', description: '3-day field study and industrial tour', startDate: '2026-08-03', endDate: '2026-08-05', type: 'event' },
  { id: 'evt_12', title: 'BVoc-3 & BBA-3 Internship Begins', description: '3rd Semester industry internship kickoff', startDate: '2026-08-10', endDate: '2026-08-10', type: 'semester' },
  { id: 'evt_13', title: 'Independence Day Celebrations', description: 'Flag hoisting, parade and national pride gala', startDate: '2026-08-15', endDate: '2026-08-15', type: 'holiday', isImportant: true },
  { id: 'evt_14', title: 'Public Speaking & All Internship Wrap-up', description: 'Public speaking presentations & internship completion', startDate: '2026-08-26', endDate: '2026-08-26', type: 'event' },
  { id: 'evt_15', title: 'Rakshabandhan Festival', description: 'University holiday', startDate: '2026-08-28', endDate: '2026-08-28', type: 'holiday' },
  { id: 'evt_16', title: 'Annual Cultural Evening Programme', description: 'Grand music, dance and drama evening', startDate: '2026-08-29', endDate: '2026-08-29', type: 'event' },
  { id: 'evt_17', title: 'BVoc-1 & BBA-1 Internship Begins', description: 'Freshmen vocational internship program launch', startDate: '2026-08-31', endDate: '2026-08-31', type: 'semester' },
  { id: 'evt_18', title: 'Janmashtami Mid-Term Break', description: 'Festive holiday break', startDate: '2026-09-04', endDate: '2026-09-04', type: 'holiday' },
  { id: 'evt_19', title: 'Odd Semester Mid-Term Examinations', description: 'Comprehensive written and practical midterm tests', startDate: '2026-09-07', endDate: '2026-09-19', type: 'exam', isImportant: true },
  { id: 'evt_20', title: 'Sandhida Amas Cultural Fair', description: 'Traditional rural heritage fair', startDate: '2026-09-11', endDate: '2026-09-11', type: 'event' },
  { id: 'evt_21', title: 'University Convocation Ceremony', description: 'Degree awarding ceremony for graduating batch', startDate: '2026-10-02', endDate: '2026-10-02', type: 'event', isImportant: true },
  { id: 'evt_22', title: 'BVoc & BBA Mid-Term & Evaluation', description: 'Evaluation and viva voce exam', startDate: '2026-10-06', endDate: '2026-10-06', type: 'exam' },
  { id: 'evt_23', title: 'Cybersecurity Fest & Hackathon', description: 'Inter-departmental coding and security competition', startDate: '2026-10-10', endDate: '2026-10-10', type: 'event' },
  { id: 'evt_24', title: 'Skill Development Workshop Week', description: 'Hands-on practical skill tracks and masterclasses', startDate: '2026-10-12', endDate: '2026-10-17', type: 'event' },
  { id: 'evt_25', title: 'Creative Writing & Tech Journalism Workshop', description: 'Interactive writing session', startDate: '2026-10-22', endDate: '2026-10-22', type: 'event' },
  { id: 'evt_26', title: 'Diwali Festive Holiday Break', description: 'University-wide autumn break', startDate: '2026-11-10', endDate: '2026-11-18', type: 'holiday' },
  { id: 'evt_27', title: 'Odd Semester End Examinations', description: 'Final university theory & practical term exams', startDate: '2026-11-23', endDate: '2026-11-30', type: 'exam', isImportant: true },

  // Even Semester (Sem 2, 4 & 6)
  { id: 'evt_28', title: 'Even Semester Begins (Sem 2, 4, 6)', description: 'Commencement of even semester classes', startDate: '2026-12-01', endDate: '2026-12-01', type: 'semester', isImportant: true },
  { id: 'evt_29', title: '3-Day Industrial Exposure Visit', description: 'Departmental industrial tours and plant visits', startDate: '2026-12-21', endDate: '2026-12-23', type: 'event' },
  { id: 'evt_30', title: 'Educational Study Tour', description: 'Outstation educational tour', startDate: '2027-01-01', endDate: '2027-01-03', type: 'event' },
  { id: 'evt_31', title: 'Annual Day & Barash Gala', description: 'University foundation day & student awards', startDate: '2027-01-04', endDate: '2027-01-04', type: 'event', isImportant: true },
  { id: 'evt_32', title: 'Uttarayan (Makar Sankranti) Break', description: 'Kite flying festival holiday', startDate: '2027-01-15', endDate: '2027-01-15', type: 'holiday' },
  { id: 'evt_33', title: 'Even Semester Mid-Term Examinations', description: 'Mid-term assessments for 2nd, 4th, 6th semesters', startDate: '2027-01-18', endDate: '2027-01-23', type: 'exam', isImportant: true },
  { id: 'evt_34', title: 'Republic Day Parade & Celebrations', description: 'Flag hoisting and patriotic events', startDate: '2027-01-26', endDate: '2027-01-26', type: 'holiday' },
  { id: 'evt_35', title: 'Gram Jivan Padyatra', description: 'Social awareness rural march', startDate: '2027-01-30', endDate: '2027-01-30', type: 'event' },
  { id: 'evt_36', title: 'AI Tools Workshop & Mini Challenge', description: 'Hands-on Generative AI and prompting hackathon', startDate: '2027-02-05', endDate: '2027-02-05', type: 'event' },
  { id: 'evt_37', title: 'International Women\'s Day: Women in Tech', description: 'Special seminar and tech panel', startDate: '2027-03-08', endDate: '2027-03-08', type: 'event' },
  { id: 'evt_38', title: 'Holi Festival Break', description: 'Festival of colors holiday', startDate: '2027-03-22', endDate: '2027-03-22', type: 'holiday' },
  { id: 'evt_39', title: 'Even Semester End Examinations', description: 'Final university examinations for Sem 2, 4, 6', startDate: '2027-04-19', endDate: '2027-04-30', type: 'exam', isImportant: true },
  { id: 'evt_40', title: 'Summer Vacation & Break Begins', description: 'Academic summer recess', startDate: '2027-05-01', endDate: '2027-05-31', type: 'holiday' },
  { id: 'evt_41', title: 'Odd Semester Begins (Session 2027-28)', description: 'Next academic year commencement', startDate: '2027-06-07', endDate: '2027-06-07', type: 'semester', isImportant: true },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_notice_01',
    title: '📢 Official Notice: Schedule for Mid-Semester Examinations',
    message: 'Monsoon Semester 2026 exams will commence from August 18, 2026 across CS, Agriculture, and Rural Studies.',
    type: 'notice',
    targetTab: 'notices',
    targetId: 'not_1',
    isRead: false,
    timestamp: '2026-07-27 09:30:00',
  },
  {
    id: 'n_notice_02',
    title: '🚨 Official Notice: URGENT 75% Attendance Requirement',
    message: 'Mandatory 75% attendance circular issued by Registrar for semester-end assessment eligibility.',
    type: 'notice',
    targetTab: 'notices',
    targetId: 'not_2',
    isRead: false,
    timestamp: '2026-07-26 11:15:00',
  },
  {
    id: 'n_notice_03',
    title: '💼 Official Notice: Inter-Departmental Research Assistant Vacancy',
    message: '2 vacancies open in Agro-Food Processing Lab under ICAR Grant 2026. Apply before Aug 15.',
    type: 'notice',
    targetTab: 'notices',
    targetId: 'not_vac_1',
    isRead: false,
    timestamp: '2026-08-02 14:00:00',
  },
  {
    id: 'n_msg_shubham_01',
    userId: 'usr_st_it_310',
    title: '💬 New Private Message from Mr. Rishu Raj (HOD)',
    message: 'Mr. Rishu Raj (HOD): "Hello Shubham. Implement RBAC at both levels: authenticate the JWT at the API gateway layer and enforce fine-grained role authorization in each service handler."',
    type: 'message',
    targetTab: 'messaging',
    targetId: 'msg_t2',
    isRead: false,
    timestamp: '2026-08-16 10:15:00',
  },
  {
    id: 'n_msg_rishu_01',
    userId: 'usr_hod_cs',
    title: '💬 New Private Message from Shubham Manojbhai Lashkari',
    message: 'Shubham Manojbhai Lashkari (STUDENT): "Respected Sir, for our B.Voc IT 3rd semester project on Cloud-Native University Architecture, should we implement role-based access control directly in the authentication gateway?"',
    type: 'message',
    targetTab: 'messaging',
    targetId: 'msg_t2',
    isRead: false,
    timestamp: '2026-08-16 09:40:00',
  },
  {
    id: 'n_01',
    role: 'student',
    title: 'Attendance Warning (<75%)',
    message: 'Your current attendance in Database Management Systems is 68%. Please meet Prof. Rajesh Mehta immediately.',
    type: 'attendance',
    targetTab: 'attendance',
    isRead: false,
    timestamp: '2026-07-28 10:05:00',
  },
  {
    id: 'n_02',
    role: 'student',
    title: 'New Assignment Uploaded',
    message: 'Prof. Rajesh Mehta added "DBMS Project: Relational Schema Normalization". Due: Aug 5.',
    type: 'assignment',
    targetTab: 'assignments',
    isRead: false,
    timestamp: '2026-07-25 10:02:00',
  },
  {
    id: 'n_03',
    role: 'teacher',
    title: 'Assignment Submitted',
    message: 'Arav Sharma submitted assignment DBMS Project: Relational Schema Normalization.',
    type: 'assignment',
    targetTab: 'assignments',
    isRead: true,
    timestamp: '2026-07-28 18:21:00',
  },
  {
    id: 'n_04',
    role: 'hod',
    title: 'Attendance Edit Request Pending',
    message: 'Prof. Rajesh Mehta requested an edit for CS-401 attendance on 2026-07-28.',
    type: 'attendance',
    targetTab: 'attendance',
    isRead: false,
    timestamp: '2026-07-28 14:31:00',
  },
];

export const INITIAL_MESSAGES: MessageThread[] = [
  {
    id: 'msg_t1',
    senderId: 'usr_student_arav',
    senderName: 'Arav Sharma',
    senderRole: 'student',
    receiverId: 'usr_teacher_mehta',
    receiverName: 'Prof. Rajesh Mehta',
    receiverRole: 'teacher',
    subject: 'Query regarding BCNF Deconstruction in DBMS Assignment',
    messages: [
      {
        id: 'm1',
        senderId: 'usr_student_arav',
        senderName: 'Arav Sharma',
        text: 'Good afternoon Sir, I had a question on Question 3. Should we decompose functional dependencies with composite candidate keys into 3 separate relations?',
        timestamp: '2026-07-27 15:30:00',
      },
      {
        id: 'm2',
        senderId: 'usr_teacher_mehta',
        senderName: 'Prof. Rajesh Mehta',
        text: 'Hello Arav. Yes, if X -> Y violates BCNF and X is not a superkey, decompose into R1(X, Y) and R2(R - Y). Ensure attribute preservation.',
        timestamp: '2026-07-27 16:10:00',
      },
    ],
    lastUpdated: '2026-07-27 16:10:00',
  },
  {
    id: 'msg_t2',
    senderId: 'usr_st_it_310',
    senderName: 'Shubham Manojbhai Lashkari',
    senderRole: 'student',
    receiverId: 'usr_hod_cs',
    receiverName: 'Mr. Rishu Raj (HOD)',
    receiverRole: 'hod',
    subject: 'Inquiry on Cloud Architecture Final Project & RBAC Security Scope',
    messages: [
      {
        id: 'm_shubham_1',
        senderId: 'usr_st_it_310',
        senderName: 'Shubham Manojbhai Lashkari',
        text: 'Respected Sir, for our B.Voc IT 3rd semester project on Cloud-Native University Architecture, should we implement role-based access control directly in the authentication gateway or at the controller level?',
        timestamp: '2026-08-16 09:40:00',
      },
      {
        id: 'm_rishu_1',
        senderId: 'usr_hod_cs',
        senderName: 'Mr. Rishu Raj (HOD)',
        text: 'Hello Shubham. Implement RBAC at both levels: authenticate the JWT at the API gateway layer and enforce fine-grained role authorization in each service handler. Make sure private chat payloads are scoped strictly to the sender and recipient IDs so no third party can access them.',
        timestamp: '2026-08-16 10:15:00',
      },
      {
        id: 'm_shubham_2',
        senderId: 'usr_st_it_310',
        senderName: 'Shubham Manojbhai Lashkari',
        text: 'Understood Sir, thank you! I have updated the security schema and database models accordingly. Will present the prototype in the upcoming lab review.',
        timestamp: '2026-08-16 10:22:00',
      },
    ],
    lastUpdated: '2026-08-16 10:22:00',
  },
  {
    id: 'msg_t3',
    senderId: 'usr_admin_bhautik_limbani',
    senderName: 'Dr. Bhautik Limbani',
    senderRole: 'admin',
    receiverId: 'usr_hod_cs',
    receiverName: 'Mr. Rishu Raj (HOD)',
    receiverRole: 'hod',
    subject: 'Curriculum Review & Lab Infrastructure Upgrade for B.Voc IT Monsoon 2026',
    messages: [
      {
        id: 'm_admin_1',
        senderId: 'usr_admin_bhautik_limbani',
        senderName: 'Dr. Bhautik Limbani',
        text: 'Prof. Rishu, please submit the updated syllabus matrix and server hardware requisition for Semester 3 Cloud Computing Lab by Friday.',
        timestamp: '2026-08-15 11:00:00',
      },
      {
        id: 'm_rishu_admin_1',
        senderId: 'usr_hod_cs',
        senderName: 'Mr. Rishu Raj (HOD)',
        text: 'Good morning Dr. Limbani. The revised syllabus matrix and lab cluster requisition have been compiled and uploaded to the Document Vault for administrative approval.',
        timestamp: '2026-08-15 14:30:00',
      },
    ],
    lastUpdated: '2026-08-15 14:30:00',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_101',
    userEmail: 'admin@lokbhartiuniversity.edu.in',
    userName: 'Dr. R. K. Shastri',
    role: 'admin',
    action: 'USER_CREATED',
    details: 'Added new faculty member Dr. Ananya Desai (LBU-FAC-202) to Department of CS.',
    timestamp: '2026-07-20 11:20:15',
    ipAddress: '172.16.0.4',
  },
  {
    id: 'log_102',
    userEmail: 'hod.cs@lokbhartiuniversity.edu.in',
    userName: 'Dr. Vikramaditya Solanki',
    role: 'hod',
    action: 'ATTENDANCE_EDIT_APPROVED',
    details: 'Approved attendance status correction for student Kabir Verma on 2026-07-20.',
    timestamp: '2026-07-21 09:12:40',
    ipAddress: '172.16.0.12',
  },
];

export const INITIAL_DELETED_STUDENTS: DeletedStudentRecord[] = [
  {
    id: 'usr_st_del_101',
    name: 'Jayesh Patel',
    email: 'jayesh.patel@lokbhartiuniversity.edu.in',
    role: 'student',
    enrollmentNo: '25221103099',
    rollNo: 'ROLL-3-19',
    departmentId: 'dept_brs_agronomy',
    departmentName: 'Agronomy (BRS)',
    semester: 3,
    phone: '+91 98251 44521',
    deletedAt: '2026-08-10 14:30',
    deletedBy: 'Prof. Ramesh Bhai Patel (HOD)',
    deletedByRole: 'hod',
    reason: 'Transferred to Gujarat Agricultural University as per official NOC request.'
  },
  {
    id: 'usr_st_del_102',
    name: 'Anjali Sharma',
    email: 'anjali.sharma@lokbhartiuniversity.edu.in',
    role: 'student',
    enrollmentNo: '25222201088',
    rollNo: 'ROLL-4-07',
    departmentId: 'dept_bvoc_fpt',
    departmentName: 'Food Processing & Technology (B.Voc)',
    semester: 4,
    phone: '+91 94262 88310',
    deletedAt: '2026-08-08 09:15',
    deletedBy: 'System Administrator',
    deletedByRole: 'admin',
    reason: 'Duplicate enrollment record merged during annual ERP audit.'
  },
  {
    id: 'usr_st_del_103',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@lokbhartiuniversity.edu.in',
    role: 'student',
    enrollmentNo: '25221103045',
    rollNo: 'ROLL-2-12',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    semester: 2,
    phone: '+91 98980 12345',
    deletedAt: '2026-08-05 11:45',
    deletedBy: 'Dr. Kirit Kumar Joshi (HOD)',
    deletedByRole: 'hod',
    reason: 'Voluntary academic withdrawal submitted by student and approved by Dean.'
  }
];

// Helper to get normalized set of purged & deleted account identifiers
export function getPurgedIdentifiers(): Set<string> {
  const set = new Set<string>();
  const normalize = (s: string) => s.toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');

  // 1. Purged users from safe storage (permanent deletes)
  try {
    const arr = safeStorageGet<string[]>('lbu_purged_users', []);
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach((item) => {
        if (item) {
          const clean = item.toLowerCase().trim();
          set.add(clean);
          set.add(normalize(clean));
        }
      });
    }
  } catch (e) {
    console.error('Error reading lbu_purged_users:', e);
  }

  // 2. Deleted students currently in Delete History (soft deletes)
  try {
    const arr = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', []);
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach((rec) => {
        if (rec.id) set.add(rec.id.toLowerCase().trim());
        if (rec.email) {
          const clean = rec.email.toLowerCase().trim();
          set.add(clean);
          set.add(normalize(clean));
        }
      });
    }
  } catch (e) {
    console.error('Error reading lbu_deleted_students:', e);
  }

  return set;
}

// Check if an account is permanently purged
export function isAccountPermanentlyPurged(emailOrId: string): boolean {
  if (!emailOrId) return false;
  const normalize = (s: string) => s.toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const cleanStr = emailOrId.toLowerCase().trim();
  const normStr = normalize(cleanStr);
  try {
    const arr = safeStorageGet<string[]>('lbu_purged_users', []);
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.some((item) => {
        const c = item.toLowerCase().trim();
        return c === cleanStr || c === normStr;
      });
    }
  } catch (e) {}
  return false;
}

// Unpurge or reactivate an account
export function unpurgeOrReactivateAccount(emailOrId: string) {
  if (!emailOrId) return;
  const normalize = (s: string) => s.toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const target = emailOrId.toLowerCase().trim();
  const targetNorm = normalize(emailOrId);

  try {
    const arr = safeStorageGet<string[]>('lbu_purged_users', []);
    if (Array.isArray(arr) && arr.length > 0) {
      const filtered = arr.filter((item) => {
        const clean = item.toLowerCase().trim();
        return clean !== target && clean !== targetNorm;
      });
      safeStorageSet('lbu_purged_users', filtered);
    }
  } catch (e) {}

  try {
    const arr = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', []);
    if (Array.isArray(arr) && arr.length > 0) {
      const filtered = arr.filter((rec) => {
        const cleanId = rec.id ? rec.id.toLowerCase().trim() : '';
        const cleanEmail = rec.email ? rec.email.toLowerCase().trim() : '';
        return cleanId !== target && cleanEmail !== target && cleanEmail !== targetNorm;
      });
      safeStorageSet('lbu_deleted_students', filtered);
    }
  } catch (e) {}
}

// Soft delete a user account (moves to Delete History, blocks login until restored or purged)
export function softDeleteUserAccount(
  user: User,
  reason: string = 'Administrative user removal',
  deletedBy: string = 'System Administrator',
  deletedByRole: UserRole = 'admin'
): DeletedStudentRecord {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const deletedRecord: DeletedStudentRecord = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    enrollmentNo: user.enrollmentNo || user.employeeId || 'N/A',
    rollNo: (user as any).rollNo || '',
    departmentId: user.departmentId || 'dept_it',
    departmentName: user.departmentName || 'Lokbharati University',
    semester: user.semester,
    phone: user.phone,
    deletedAt: nowStr,
    deletedBy,
    deletedByRole,
    reason: reason || 'Administrative record deletion',
  };

  // 1. Add to lbu_deleted_students (Deletion History)
  try {
    const existingList = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', [...INITIAL_DELETED_STUDENTS]);
    const filtered = existingList.filter((d) => d.id !== user.id && (!user.email || d.email.toLowerCase() !== user.email.toLowerCase()));
    const updatedList = [deletedRecord, ...filtered];
    safeStorageSet('lbu_deleted_students', updatedList);
  } catch (e) {
    console.error('Error saving soft deleted user:', e);
  }

  // 2. Remove from active students / custom users
  try {
    const customUsers = safeStorageGet<User[]>('lbu_custom_users', []);
    if (customUsers.length > 0) {
      const filtered = customUsers.filter((u) => u.id !== user.id && (!user.email || u.email.toLowerCase().trim() !== user.email.toLowerCase().trim()));
      safeStorageSet('lbu_custom_users', filtered);
    }
  } catch (e) {}

  // 3. Remove from INITIAL_USERS in-memory array
  for (let i = INITIAL_USERS.length - 1; i >= 0; i--) {
    const u = INITIAL_USERS[i];
    if (u.id === user.id || (user.email && u.email && u.email.toLowerCase().trim() === user.email.toLowerCase().trim())) {
      INITIAL_USERS.splice(i, 1);
    }
  }

  // 4. Invalidate logged in user session if matching
  try {
    const currentUser = safeStorageGet<User | null>('lbu_user', null);
    if (currentUser && (currentUser.id === user.id || (user.email && currentUser.email && currentUser.email.toLowerCase().trim() === user.email.toLowerCase().trim()))) {
      safeStorageRemove('lbu_user');
      safeStorageRemove('lbu_token');
    }
  } catch (e) {}

  // 5. Broadcast global database update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lbu_user_updated'));
    window.dispatchEvent(new CustomEvent('lbu_deleted_records_updated'));
  }

  return deletedRecord;
}

// Check if a user ID or email address belongs to a deleted/purged account
export function isAccountPurgedOrDeleted(emailOrId: string): boolean {
  if (!emailOrId) return false;
  const set = getPurgedIdentifiers();
  const cleanStr = emailOrId.toLowerCase().trim();
  const normStr = cleanStr.replace('lokbharatiuniversity', 'lokbhartiuniversity');
  return set.has(cleanStr) || set.has(normStr);
}

// Permanently purge a user account across all database tables and local storage structures
export function purgeUserAccount(userId: string, email?: string) {
  const normalize = (s: string) => s.toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const idsToPurge = new Set<string>();
  if (userId) idsToPurge.add(userId.toLowerCase().trim());
  if (email) {
    idsToPurge.add(email.toLowerCase().trim());
    idsToPurge.add(normalize(email));
  }

  // 1. Add to lbu_purged_users
  try {
    const existing = safeStorageGet<string[]>('lbu_purged_users', []);
    idsToPurge.forEach((val) => existing.push(val));
    const unique = Array.from(new Set(existing));
    safeStorageSet('lbu_purged_users', unique);
  } catch (e) {
    console.error('Error updating lbu_purged_users:', e);
  }

  // 2. Remove from in-memory INITIAL_USERS database
  for (let i = INITIAL_USERS.length - 1; i >= 0; i--) {
    const u = INITIAL_USERS[i];
    const match =
      (u.id && idsToPurge.has(u.id.toLowerCase().trim())) ||
      (u.email && (idsToPurge.has(u.email.toLowerCase().trim()) || idsToPurge.has(normalize(u.email))));
    if (match) {
      INITIAL_USERS.splice(i, 1);
    }
  }

  // 3. Remove from custom users
  try {
    const customUsers = safeStorageGet<User[]>('lbu_custom_users', []);
    if (customUsers.length > 0) {
      const filtered = customUsers.filter(
        (u) =>
          !idsToPurge.has(u.id.toLowerCase().trim()) &&
          (!u.email || (!idsToPurge.has(u.email.toLowerCase().trim()) && !idsToPurge.has(normalize(u.email))))
      );
      safeStorageSet('lbu_custom_users', filtered);
    }
  } catch (e) {}

  // 4. Remove from deleted students history list if purged
  try {
    const deletedList = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', []);
    if (deletedList.length > 0) {
      const filtered = deletedList.filter(
        (d) =>
          !idsToPurge.has(d.id.toLowerCase().trim()) &&
          (!d.email || (!idsToPurge.has(d.email.toLowerCase().trim()) && !idsToPurge.has(normalize(d.email))))
      );
      safeStorageSet('lbu_deleted_students', filtered);
    }
  } catch (e) {
    console.error('Error updating lbu_deleted_students on purge:', e);
  }

  // 5. Clean profile & password overrides
  try {
    const pMap = safeStorageGet<Record<string, any>>('lbu_user_profiles', {});
    idsToPurge.forEach((k) => delete pMap[k]);
    safeStorageSet('lbu_user_profiles', pMap);
  } catch (e) {
    console.error('Error cleaning profiles on purge:', e);
  }

  try {
    const passMap = safeStorageGet<Record<string, string>>('lbu_user_passwords', {});
    idsToPurge.forEach((k) => delete passMap[k]);
    safeStorageSet('lbu_user_passwords', passMap);
  } catch (e) {}

  // 6. Check active logged in user and invalidate if matches deleted user
  try {
    const currentUser = safeStorageGet<User | null>('lbu_user', null);
    if (
      currentUser &&
      (idsToPurge.has(currentUser.id.toLowerCase().trim()) ||
        (currentUser.email &&
          (idsToPurge.has(currentUser.email.toLowerCase().trim()) || idsToPurge.has(normalize(currentUser.email)))))
    ) {
      safeStorageRemove('lbu_user');
      safeStorageRemove('lbu_token');
    }
  } catch (e) {}

  // 7. Broadcast global database update event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lbu_user_updated'));
    window.dispatchEvent(
      new CustomEvent('lbu_user_deleted', {
        detail: { id: userId, email },
      })
    );
  }

  // 8. Notify backend API if running
  try {
    fetch('/api/users/purge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, email }),
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

// Unpurge / Restore user account
export function restoreUserAccount(userId: string, email?: string): User | null {
  const normalize = (s: string) => s.toLowerCase().trim().replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const targetId = (userId || '').toLowerCase().trim();
  const targetEmail = (email && email !== 'N/A' ? email : '').toLowerCase().trim();
  const targetEmailNorm = targetEmail ? normalize(targetEmail) : '';

  let restoredRecord: DeletedStudentRecord | null = null;
  try {
    const deletedList = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', [...INITIAL_DELETED_STUDENTS]);
    if (Array.isArray(deletedList) && deletedList.length > 0) {
      // 1. Strictly find the selected single record
      restoredRecord =
        deletedList.find((d) => {
          const dId = (d.id || '').toLowerCase().trim();
          if (targetId && dId === targetId) return true;
          const dEmail = (d.email || '').toLowerCase().trim();
          if (targetEmail && dEmail && (dEmail === targetEmail || normalize(dEmail) === targetEmailNorm)) return true;
          return false;
        }) || null;

      // 2. Remove ONLY this single specific record from deleted records list
      if (restoredRecord) {
        const recIdToRemove = restoredRecord.id;
        const filtered = deletedList.filter((d) => d.id !== recIdToRemove);
        safeStorageSet('lbu_deleted_students', filtered);
      }
    }
  } catch (e) {
    console.error('Error updating lbu_deleted_students on restore:', e);
  }

  // 3. Clear purge entries only for this specific user
  try {
    const existingPurged = safeStorageGet<string[]>('lbu_purged_users', []);
    if (Array.isArray(existingPurged) && existingPurged.length > 0) {
      const specificPurgeKeys = new Set<string>();
      if (targetId) specificPurgeKeys.add(targetId);
      if (targetEmail) {
        specificPurgeKeys.add(targetEmail);
        specificPurgeKeys.add(targetEmailNorm);
      }
      if (restoredRecord) {
        if (restoredRecord.id) specificPurgeKeys.add(restoredRecord.id.toLowerCase().trim());
        if (restoredRecord.email) {
          const rEmail = restoredRecord.email.toLowerCase().trim();
          specificPurgeKeys.add(rEmail);
          specificPurgeKeys.add(normalize(rEmail));
        }
      }

      const filteredPurged = existingPurged.filter((item) => {
        const clean = item.toLowerCase().trim();
        return !specificPurgeKeys.has(clean) && !specificPurgeKeys.has(normalize(clean));
      });
      safeStorageSet('lbu_purged_users', filteredPurged);
    }
  } catch (e) {
    console.error('Error updating lbu_purged_users on restore:', e);
  }

  if (restoredRecord) {
    const isStudent = restoredRecord.role === 'student';
    let desig = 'Undergraduate Student';
    if (restoredRecord.role === 'hod') desig = 'Head of Department';
    else if (restoredRecord.role === 'teacher') desig = 'Assistant Professor';
    else if (restoredRecord.role === 'admin') desig = 'System Administrator';

    const restoredUser: User = {
      id: restoredRecord.id,
      name: restoredRecord.name,
      email: restoredRecord.email,
      role: restoredRecord.role,
      departmentId: restoredRecord.departmentId || 'dept_it',
      departmentName: restoredRecord.departmentName || 'Lokbharati University',
      enrollmentNo: restoredRecord.enrollmentNo !== 'N/A' ? restoredRecord.enrollmentNo : undefined,
      employeeId: !isStudent && restoredRecord.enrollmentNo !== 'N/A' ? restoredRecord.enrollmentNo : undefined,
      semester: restoredRecord.semester,
      phone: restoredRecord.phone || '+91 98250 11000',
      designation: desig,
      joiningDate: '2024-08-01',
      avatar: generateAlphabetAvatar(restoredRecord.name, restoredRecord.role),
    };

    // Add back to custom users list so getStoredUsers() includes it
    try {
      const customUsers = safeStorageGet<User[]>('lbu_custom_users', []);
      const filtered = customUsers.filter(
        (u) =>
          u.id.toLowerCase().trim() !== restoredUser.id.toLowerCase().trim() &&
          (!restoredUser.email || u.email.toLowerCase().trim() !== restoredUser.email.toLowerCase().trim())
      );
      safeStorageSet('lbu_custom_users', [restoredUser, ...filtered]);
    } catch (e) {}

    // Dispatch global events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lbu_user_updated', { detail: { restoredUser } }));
      window.dispatchEvent(new CustomEvent('lbu_deleted_records_updated', { detail: { restoredId: restoredUser.id } }));
    }

    return restoredUser;
  }

  return null;
}

// Helper to retrieve users with all saved local overrides applied
export function getStoredUsers(): User[] {
  let usersList = [...INITIAL_USERS];

  // Proactively auto-heal and unpurge core accounts (e.g. Shubham Rathod / Shubham Lashkari)
  try {
    const coreRestores = [
      'shubham.rathod@lokbhartiuniversity.edu.in',
      'shubham.rathod@lokbharatiuniversity.edu.in',
      'shubham.lashkari@lokbhartiuniversity.edu.in',
      'shubham.lashkari@lokbharatiuniversity.edu.in',
      'usr_st_afp_323',
      'usr_st_it_310',
      '25221102023',
      '25221103010',
    ];
    const purged = safeStorageGet<string[]>('lbu_purged_users', []);
    if (Array.isArray(purged) && purged.length > 0) {
      const filtered = purged.filter((p) => !coreRestores.includes(p.toLowerCase().trim()));
      if (filtered.length !== purged.length) {
        safeStorageSet('lbu_purged_users', filtered);
      }
    }
    const deletedSt = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', []);
    if (Array.isArray(deletedSt) && deletedSt.length > 0) {
      const filteredDel = deletedSt.filter((d) => !coreRestores.includes(d.email?.toLowerCase().trim() || '') && !coreRestores.includes(d.id.toLowerCase().trim()));
      if (filteredDel.length !== deletedSt.length) {
        safeStorageSet('lbu_deleted_students', filteredDel);
      }
    }
  } catch (e) {}

  const purgedSet = getPurgedIdentifiers();

  // 1. Custom / newly added users
  try {
    const customUsers = safeStorageGet<User[]>('lbu_custom_users', []);
    if (Array.isArray(customUsers) && customUsers.length > 0) {
      const existingIds = new Set(usersList.map((u) => u.id));
      const newUsers = customUsers.filter((u) => !existingIds.has(u.id));
      usersList = [...newUsers, ...usersList];
    }
  } catch (e) {
    console.error('Error loading custom users:', e);
  }

  // 2. Clean up legacy bloated storage keys if present
  try {
    if (localStorage.getItem('lbu_admin_users')) {
      localStorage.removeItem('lbu_admin_users');
    }
    if (localStorage.getItem('lbu_active_students')) {
      localStorage.removeItem('lbu_active_students');
    }
  } catch (e) {}

  // Filter out any purged, soft-deleted, or contractor accounts
  usersList = usersList.filter((u) => {
    const cleanId = u.id ? u.id.toLowerCase().trim() : '';
    const cleanEmail = u.email ? u.email.toLowerCase().trim() : '';
    const normEmail = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    if ((u as any).role === 'contractor' || cleanId.startsWith('usr_cnt_') || cleanEmail.includes('contractor')) {
      return false;
    }
    return !purgedSet.has(cleanId) && !purgedSet.has(cleanEmail) && !purgedSet.has(normEmail);
  });

  // 3. Profile updates override (from profile edits)
  try {
    const profileMap = safeStorageGet<Record<string, Partial<User>>>('lbu_user_profiles', {});
    if (Object.keys(profileMap).length > 0) {
      usersList = usersList.map((u) => {
        const cleanId = u.id ? u.id.trim() : '';
        const cleanEmail = u.email ? u.email.toLowerCase().trim() : '';
        const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
        const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');
        const empId = u.employeeId ? u.employeeId.trim() : '';

        const override =
          (cleanId && profileMap[cleanId]) ||
          (cleanEmail && profileMap[cleanEmail]) ||
          (normEmail1 && profileMap[normEmail1]) ||
          (normEmail2 && profileMap[normEmail2]) ||
          (empId && profileMap[empId]) ||
          {};

        return { ...u, ...override };
      });
    }
  } catch (e) {
    console.error('Error loading profile overrides:', e);
  }

  // 4. Password overrides
  try {
    const passMap = safeStorageGet<Record<string, string>>('lbu_user_passwords', {});
    if (Object.keys(passMap).length > 0) {
      usersList = usersList.map((u) => {
        const cleanId = u.id ? u.id.trim() : '';
        const cleanEmail = u.email ? u.email.toLowerCase().trim() : '';
        const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
        const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');
        const enroll = u.enrollmentNo ? u.enrollmentNo.trim() : '';
        const emp = u.employeeId ? u.employeeId.trim() : '';
        const pass =
          (cleanId && passMap[cleanId]) ||
          (cleanEmail && passMap[cleanEmail]) ||
          (normEmail1 && passMap[normEmail1]) ||
          (normEmail2 && passMap[normEmail2]) ||
          (enroll && passMap[enroll]) ||
          (emp && passMap[emp]);
        if (pass) return { ...u, password: pass };
        return u;
      });
    }
  } catch (e) {
    console.error('Error loading password overrides:', e);
  }

  // Ensure all users have their permanent role-colored alphabet avatar
  return usersList.map((u) => ({
    ...u,
    avatar: generateAlphabetAvatar(u.name, u.role),
  }));
}

// Helper to persist user profile edits across database and re-login sessions
export function saveUserProfileOverride(userId: string, email: string, updates: Partial<User>) {
  try {
    const cleanId = userId ? userId.trim() : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');

    // 1. Update safeStorage persistent profile map
    const profilesMap = safeStorageGet<Record<string, Partial<User>>>('lbu_user_profiles', {});
    const existing =
      (cleanId && profilesMap[cleanId]) ||
      (cleanEmail && profilesMap[cleanEmail]) ||
      (normEmail1 && profilesMap[normEmail1]) ||
      (normEmail2 && profilesMap[normEmail2]) ||
      {};

    const userRole = updates.role || existing.role || 'student';
    const userName = updates.name || existing.name || 'User';
    const merged: Partial<User> = {
      ...existing,
      ...updates,
      avatar: generateAlphabetAvatar(userName, userRole),
    };

    if (cleanId) profilesMap[cleanId] = merged;
    if (cleanEmail) profilesMap[cleanEmail] = merged;
    if (normEmail1 && normEmail1 !== cleanEmail) profilesMap[normEmail1] = merged;
    safeStorageSet('lbu_user_profiles', profilesMap);

    // 2. Update custom users in database storage if applicable
    const customUsers = safeStorageGet<User[]>('lbu_custom_users', []);
    if (Array.isArray(customUsers) && customUsers.length > 0) {
      let customChanged = false;
      const updatedCustom = customUsers.map((u) => {
        const uCleanEmail = u.email ? u.email.toLowerCase().trim() : '';
        const match =
          (cleanId && u.id === cleanId) ||
          (cleanEmail && uCleanEmail === cleanEmail) ||
          (normEmail1 && uCleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity') === normEmail1);
        if (match) {
          customChanged = true;
          return { ...u, ...updates };
        }
        return u;
      });
      if (customChanged) {
        safeStorageSet('lbu_custom_users', updatedCustom);
      }
    }

    // 3. Update current active user in storage if matching
    const currentUser = safeStorageGet<User | null>('lbu_user', null);
    if (currentUser) {
      const curCleanEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
      const isCurMatch =
        (cleanId && currentUser.id === cleanId) ||
        (cleanEmail && curCleanEmail === cleanEmail) ||
        (normEmail1 && curCleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity') === normEmail1);
      if (isCurMatch) {
        safeStorageSet('lbu_user', { ...currentUser, ...updates });
      }
    }

    // 4. Update in-memory INITIAL_USERS so real-time query calls reflect it
    for (let i = 0; i < INITIAL_USERS.length; i++) {
      const u = INITIAL_USERS[i];
      const uCleanEmail = u.email ? u.email.toLowerCase().trim() : '';
      const match =
        (cleanId && u.id === cleanId) ||
        (cleanEmail && uCleanEmail === cleanEmail) ||
        (normEmail1 && uCleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity') === normEmail1);
      if (match) {
        INITIAL_USERS[i] = { ...u, ...updates };
      }
    }

    // 5. Asynchronously persist to backend server
    if (typeof window !== 'undefined' && window.fetch) {
      fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanId, email: cleanEmail, updates }),
      }).catch(() => {
        // Silently ignore offline network errors
      });
    }

    // 6. Broadcast global database update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lbu_user_updated', {
          detail: { userId: cleanId, email: cleanEmail, updates },
        })
      );
    }
  } catch (e) {
    console.error('Error saving user profile override to database:', e);
  }
}

export const INITIAL_STUDENT_REQUESTS: StudentRequest[] = [
  {
    id: 'req_101',
    studentId: 'usr_st_2',
    studentName: 'Manthan Solanki',
    enrollmentNo: '24222201016',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    semester: 5,
    recipientRole: 'hod',
    requestType: 'medical',
    subject: 'Medical Duty Leave Sanction Application',
    reason: 'Sanctioned leave for hospital stay and viral fever recovery.',
    startDate: '2026-08-05',
    endDate: '2026-08-08',
    days: '4 Days (05 Aug - 08 Aug)',
    attachment: 'Medical_Discharge_Summary.pdf',
    status: 'Pending',
    submittedAt: '2026-08-09 11:20',
  },
  {
    id: 'req_102',
    studentId: 'usr_st_1',
    studentName: 'Arav Sharma',
    enrollmentNo: '2024CS0401',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    semester: 3,
    recipientRole: 'hod',
    requestType: 'onduty',
    subject: 'Duty Leave Attendance Credit (Inter-College NSS)',
    reason: 'Represented Lokbharti University in Inter-College NSS Camp.',
    startDate: '2026-08-02',
    endDate: '2026-08-03',
    days: '2 Days (02 Aug - 03 Aug)',
    attachment: 'NSS_Officer_Certificate.pdf',
    status: 'Pending',
    submittedAt: '2026-08-08 14:15',
  },
  {
    id: 'req_103',
    studentId: 'usr_st_3',
    studentName: 'Janvi Desai',
    enrollmentNo: '24211101001',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    semester: 5,
    recipientRole: 'hod',
    requestType: 'general',
    subject: 'Academic Bonafide Certificate Official Seal',
    reason: 'Requesting HOD official seal for Higher Education Scholarship portal.',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    days: 'Single Application',
    attachment: 'Scholarship_Form_Draft.pdf',
    status: 'Pending',
    submittedAt: '2026-08-10 09:30',
  },
  {
    id: 'req_104',
    studentId: 'usr_st_it_310',
    studentName: 'Shubham Manojbhai Lashkari',
    enrollmentNo: '24222201027',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    semester: 3,
    recipientRole: 'admin',
    requestType: 'exam',
    subject: 'University Central Exam Hall Ticket & Clearance NOC',
    reason: 'Petition to University Administration for issuing duplicate exam admission hall ticket and semester clearance certificate.',
    startDate: '2026-08-14',
    endDate: '2026-08-14',
    days: 'Single Application',
    attachment: 'Clearance_Fee_Receipt.pdf',
    status: 'Pending',
    submittedAt: '2026-08-14 10:45',
  },
  {
    id: 'req_105',
    studentId: 'usr_st_1',
    studentName: 'Arav Sharma',
    enrollmentNo: '2024CS0401',
    departmentId: 'dept_it',
    departmentName: 'Information Technology',
    semester: 3,
    recipientRole: 'admin',
    requestType: 'general',
    subject: 'Central Library Digital Repository Institutional License',
    reason: 'Requesting university administration for institutional access token for IEEE Xplore & ACM digital library research portal.',
    startDate: '2026-08-11',
    endDate: '2026-08-11',
    days: 'Single Application',
    attachment: 'Student_ID_Verification.pdf',
    status: 'Approved',
    reviewedBy: 'Dr. Bhautik Limbani (System Administrator)',
    reviewComment: 'Approved: Institutional token provisioned. Access credentials dispatched to student university email.',
    processedAt: 1786528800000,
    submittedAt: '2026-08-11 15:20',
  },
];

/**
 * Global Timetable Persistence & Synchronization API
 * Allows Admin and authorized roles to manage, add, edit, and delete timetables
 * across all university departments and semesters.
 */
export function getStoredTimetables(): TimetableSlot[] {
  try {
    const custom = safeStorageGet<TimetableSlot[]>('lbu_timetables', []);
    if (Array.isArray(custom) && custom.length > 0) {
      return custom;
    }
  } catch (e) {
    console.error('Error loading stored timetables:', e);
  }
  return [...TIMETABLES];
}

export function saveStoredTimetables(slots: TimetableSlot[]): void {
  try {
    safeStorageSet('lbu_timetables', slots);
    // Keep in-memory TIMETABLES array synchronized
    TIMETABLES.splice(0, TIMETABLES.length, ...slots);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lbu_timetables_updated', {
          detail: { slots, count: slots.length, timestamp: Date.now() },
        })
      );
    }
  } catch (e) {
    console.error('Error saving stored timetables:', e);
  }
}

export function addStoredTimetableSlot(slot: TimetableSlot): TimetableSlot[] {
  const current = getStoredTimetables();
  const updated = [...current, slot];
  saveStoredTimetables(updated);
  return updated;
}

export function addStoredTimetableSlots(newSlots: TimetableSlot[]): TimetableSlot[] {
  const current = getStoredTimetables();
  const updated = [...current, ...newSlots];
  saveStoredTimetables(updated);
  return updated;
}

export function replaceSemesterStoredTimetables(
  departmentId: string,
  semester: number,
  newSemesterSlots: TimetableSlot[]
): TimetableSlot[] {
  const current = getStoredTimetables();
  const otherSlots = current.filter(
    (s) => !(s.departmentId === departmentId && Number(s.semester) === Number(semester))
  );
  const updated = [...otherSlots, ...newSemesterSlots];
  saveStoredTimetables(updated);
  return updated;
}

export function updateStoredTimetableSlot(slot: TimetableSlot): TimetableSlot[] {
  const current = getStoredTimetables();
  const updated = current.map((s) => (s.id === slot.id ? { ...s, ...slot } : s));
  saveStoredTimetables(updated);
  return updated;
}

export function deleteStoredTimetableSlot(slotId: string): TimetableSlot[] {
  const current = getStoredTimetables();
  const updated = current.filter((s) => s.id !== slotId);
  saveStoredTimetables(updated);
  return updated;
}

export function clearSemesterStoredTimetables(departmentId: string, semester: number): TimetableSlot[] {
  const current = getStoredTimetables();
  const updated = current.filter(
    (s) => !(s.departmentId === departmentId && Number(s.semester) === Number(semester))
  );
  saveStoredTimetables(updated);
  return updated;
}

export function generateAutoSemesterTimetable(departmentId: string, semester: number): TimetableSlot[] {
  const current = getStoredTimetables();
  const otherSlots = current.filter(
    (s) => !(s.departmentId === departmentId && Number(s.semester) === Number(semester))
  );

  const deptObj = DEPARTMENTS.find((d) => d.id === departmentId);
  const deptName = deptObj ? deptObj.name : 'University Department';

  // Get department subjects matching this semester, or fallback to standard templates
  const deptSubjects = SUBJECTS.filter(
    (sub) => sub.departmentId === departmentId && (sub.semester === semester || !sub.semester)
  );

  const defaultTemplates = [
    { code: `${departmentId.replace('dept_', '').toUpperCase().slice(0, 4)}MJ${semester}01`, name: `Core Fundamentals of ${deptName}`, teacher: 'Prof. Faculty In-Charge', room: 'Lecture Hall 101' },
    { code: `${departmentId.replace('dept_', '').toUpperCase().slice(0, 4)}MJ${semester}02`, name: `Applied Practices & Lab – Sem ${semester}`, teacher: 'Prof. Lab Coordinator', room: 'Computer Lab' },
    { code: `${departmentId.replace('dept_', '').toUpperCase().slice(0, 4)}AE${semester}01`, name: `Values and Ethics & Communication`, teacher: 'Dr. Ethics Chair', room: 'Room B-203' },
    { code: `${departmentId.replace('dept_', '').toUpperCase().slice(0, 4)}SE${semester}01`, name: `Digital Tools & Technical Skills`, teacher: 'Dr. Tech Mentor', room: 'Innovation Hub' },
    { code: `${departmentId.replace('dept_', '').toUpperCase().slice(0, 4)}VA${semester}01`, name: `Rural Innovation Practicum`, teacher: 'Prof. Field Expert', room: 'Seminar Hall' },
  ];

  const subjectsToUse = deptSubjects.length > 0
    ? deptSubjects.map((s) => ({
        code: s.code,
        name: s.name,
        teacher: 'Department Faculty Assigned',
        room: 'Department Classroom',
      }))
    : defaultTemplates;

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const timeTuples = [
    { start: '07:30 AM', end: '08:30 AM' },
    { start: '08:40 AM', end: '09:40 AM' },
    { start: '09:40 AM', end: '10:40 AM' },
    { start: '02:00 PM', end: '03:00 PM' },
    { start: '03:00 PM', end: '04:00 PM' },
    { start: '04:00 PM', end: '05:00 PM' },
  ];

  const generatedSlots: TimetableSlot[] = [];

  days.forEach((day, dayIdx) => {
    timeTuples.forEach((time, timeIdx) => {
      const subjectItem = subjectsToUse[(dayIdx + timeIdx) % subjectsToUse.length];
      generatedSlots.push({
        id: `auto_${departmentId}_sem${semester}_${day.toLowerCase()}_${timeIdx}_${Date.now()}`,
        dayOfWeek: day,
        startTime: time.start,
        endTime: time.end,
        subjectId: `sub_${subjectItem.code.toLowerCase()}`,
        subjectName: subjectItem.name,
        subjectCode: subjectItem.code,
        departmentId: departmentId,
        semester: Number(semester),
        teacherId: `usr_fac_${timeIdx}`,
        teacherName: subjectItem.teacher,
        classroom: subjectItem.room,
      });
    });
  });

  const updated = [...otherSlots, ...generatedSlots];
  saveStoredTimetables(updated);
  return updated;
}

/**
 * Adds a new custom user record (e.g. Student, Faculty, HOD) to ERP persistent storage
 * and instantly broadcasts lbu_user_updated across all dashboard views.
 */
export const addCustomUserRecord = (newUser: User): void => {
  try {
    const currentCustom = safeStorageGet<User[]>('lbu_custom_users', []);
    const updatedCustom = [newUser, ...currentCustom.filter((u) => u.id !== newUser.id)];
    safeStorageSet('lbu_custom_users', updatedCustom);
    window.dispatchEvent(new CustomEvent('lbu_user_updated', { detail: { newUser } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to add custom user record:', err);
  }
};



