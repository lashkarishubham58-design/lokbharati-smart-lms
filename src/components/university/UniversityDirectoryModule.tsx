import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  Mail,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Award,
  Sparkles,
  MapPin,
  ExternalLink,
  X,
  Filter,
  User as UserIcon,
  MessageSquare,
  Eye
} from 'lucide-react';
import { User, Department, Subject, TimetableSlot } from '../../types';
import { DEPARTMENTS, INITIAL_USERS, SUBJECTS, TIMETABLES, getStoredUsers } from '../../data/mockDatabase';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { UserProfileModal } from '../profile/UserProfileModal';
import { canCommunicate } from '../../utils/communicationRules';
import { UserAvatar } from '../common/UserAvatar';
import { matchUserSmart } from '../../utils/searchMatching';
import { formatStudentDisplayName } from '../../utils/studentNameUtils';

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
  AVATAR_DHYAN_PATEL,
} from '../../assets/avatars';

interface UniversityDirectoryModuleProps {
  currentUser: User;
  onNavigateTab?: (tab: string, deptId?: string) => void;
  onSendMessageToUser?: (recipient: User) => void;
}

// Administration Dataset (Provost, Academic Director, Registrar)
const ADMIN_LIST = [
  {
    id: 'usr_provost_khimani',
    name: 'Dr. Rajendra Khimani',
    title: 'Hon. Provost & Vice Chancellor',
    designation: 'Vice Chancellor & Provost',
    department: 'University Executive Office',
    departmentId: 'dept_admin',
    email: 'provost@lokbharatiuniversity.edu.in',
    phone: '+91 98250 11000',
    employeeId: 'LBU-ADM-001',
    room: 'Chancellery & Central Secretariat 101',
    officeHours: 'Mon - Fri: 11:00 AM - 01:00 PM',
    qualification: 'Ph.D. (Agricultural Extension & Rural Development)',
    specialization: 'Gandhian Nai Talim, Higher Education Policy & Rural University Governance',
    avatar: AVATAR_RAJENDRA_KHIMANI,
  },
  {
    id: 'usr_admin_vishal_bhadani',
    name: 'Dr. Vishal Bhadani',
    title: 'Academic Director & Assistant Professor',
    designation: 'Academic Director & Assistant Professor (Comparative Literature)',
    department: 'Academic Affairs & Department of English',
    departmentId: 'dept_ba_english',
    email: 'vishal.bhadani@lokbharatiuniversity.edu.in',
    phone: '+91 94280 11984',
    employeeId: 'LBU-ADM-003',
    room: 'Academic Council Directorate Wing A',
    officeHours: 'Mon - Fri: 10:30 AM - 01:00 PM',
    qualification: 'Ph.D. in Comparative Literature & Linguistics',
    specialization: 'Curriculum Framework, World Literature & NEP Accreditation',
    avatar: AVATAR_VISHAL_BHADANI,
  },
  {
    id: 'usr_admin_bhautik_limbani',
    name: 'Dr. Bhautik Limbani',
    title: 'Registrar (I/C) & Assistant Professor',
    designation: 'Registrar (In-Charge) & Assistant Professor (English)',
    department: 'Registrar General Office & Department of English',
    departmentId: 'dept_ba_english',
    email: 'bhautik.limbani@lokbharatiuniversity.edu.in',
    phone: '+91 98254 77123',
    employeeId: 'LBU-ADM-002',
    room: 'Office of Registrar General Room 102',
    officeHours: 'Mon - Fri: 10:00 AM - 01:00 PM',
    qualification: 'Ph.D. in English Literature & University Administration',
    specialization: 'University Records, Institutional Governance & Regulatory Affairs',
    avatar: AVATAR_BHAUTIK_LIMBANI,
  },
];

// Complete HOD Dataset aligned with active academic departments
const HOD_DETAILS = [
  {
    id: 'usr_hod_agronomy',
    name: 'Prof. Ramesh Bhai Patel',
    title: 'Head of Agronomy Department',
    deptCode: 'BRS-AGRO',
    deptName: 'Agronomy (Bachelor of Rural Studies)',
    email: 'patel.ramesh@lokbhartiuniversity.edu.in',
    phone: '+91 98250 33221',
    employeeId: 'LBU-HOD-201',
    room: 'BRS Agronomy Block Room 104',
    officeHours: 'Mon - Fri: 10:00 AM - 12:30 PM',
    qualification: 'M.Sc (Agronomy), Ph.D. in Organic Seed Technology',
    specialization: 'Crop Production, Organic Soil Fertility & Crop Ecology',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'usr_hod_ahds',
    name: 'Dr. Kirit Kumar Joshi',
    title: 'Head of Animal Husbandry & Dairy Science',
    deptCode: 'BRS-AHDS',
    deptName: 'Animal Husbandry & Dairy Science (BRS)',
    email: 'joshi.kirit@lokbhartiuniversity.edu.in',
    phone: '+91 98250 55112',
    employeeId: 'LBU-HOD-202',
    room: 'Dairy Tech Complex Wing B',
    officeHours: 'Mon - Sat: 09:30 AM - 11:30 AM',
    qualification: 'Ph.D. in Dairy Microbiology & Livestock Genetics',
    specialization: 'Organic Milk Processing, Cattle Breeding & Nutrition',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'usr_hod_horti',
    name: 'Dr. Bhavna Chaudhari',
    title: 'Head of Horticulture Department',
    deptCode: 'BRS-HORT',
    deptName: 'Horticulture (Bachelor of Rural Studies)',
    email: 'chaudhari.bhavna@lokbhartiuniversity.edu.in',
    phone: '+91 98250 88990',
    employeeId: 'LBU-HOD-203',
    room: 'Horticulture Green House Lab 02',
    officeHours: 'Tue - Fri: 11:00 AM - 01:00 PM',
    qualification: 'Ph.D. in Floriculture & Pomology',
    specialization: 'Greenhouse Management, Organic Olericulture & Nursery Care',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'usr_hod_it',
    name: 'Prof. Rishu Raj (RY / RR)',
    title: 'Head of Information Technology Department',
    deptCode: 'BVOC-IT',
    deptName: 'Information Technology (Bachelor of Vocation)',
    email: 'hod.it@lokbhartiuniversity.edu.in',
    phone: '+91 98250 12001',
    employeeId: 'LBU-HOD-100',
    room: 'IT Block Room 101',
    officeHours: 'Mon - Fri: 10:00 AM - 12:30 PM',
    qualification: 'M.Tech (Software Engineering), Ph.D. Scholar',
    specialization: 'Software Architecture, Cloud Systems & Developer Engineering',
    avatar: AVATAR_RISHU_RAJ,
  },
  {
    id: 'usr_hod_nf',
    name: 'Dr. Sunita Parmar',
    title: 'Head of Natural Farming Department',
    deptCode: 'BVOC-NF',
    deptName: 'Natural Farming (Bachelor of Vocation)',
    email: 'parmar.sunita@lokbhartiuniversity.edu.in',
    phone: '+91 98250 77889',
    employeeId: 'LBU-HOD-102',
    room: 'Bio-Input Research Lab 05',
    officeHours: 'Mon - Sat: 09:30 AM - 11:30 AM',
    qualification: 'Ph.D. in Natural Farming & Bio-Ecology',
    specialization: 'Zero-Budget Natural Farming (ZBNF), Jeevamrut & Soil Health',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'usr_hod_afp',
    name: 'Dr. Mukund Bhai Patel',
    title: 'Head of Agro-Food Processing Department',
    deptCode: 'BVOC-AFP',
    deptName: 'Agro-Food Processing (Bachelor of Vocation)',
    email: 'patel.mukund@lokbhartiuniversity.edu.in',
    phone: '+91 98250 99441',
    employeeId: 'LBU-HOD-204',
    room: 'Food Processing Plant Unit 1',
    officeHours: 'Mon - Fri: 02:00 PM - 04:00 PM',
    qualification: 'Ph.D. in Food Technology & Biochemical Preservation',
    specialization: 'Food Quality Assurance, Value Addition & Organic Packaging',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'usr_hod_bba',
    name: 'Dr. Ananya Desai',
    title: 'Head of Department of Business Administration',
    deptCode: 'BBA',
    deptName: 'Bachelor of Business Administration (BBA Department)',
    email: 'desai.ananya@lokbhartiuniversity.edu.in',
    phone: '+91 98251 67890',
    employeeId: 'LBU-HOD-104',
    room: 'BBA Department Executive Block B-301',
    officeHours: 'Mon - Fri: 01:30 PM - 03:30 PM',
    qualification: 'MBA (IIM Ahmedabad), Ph.D. in Business Systems',
    specialization: 'Corporate Administration, Agribusiness Marketing & Ethics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'usr_hod_english',
    name: 'Dr. H. M. Trivedi',
    title: 'Head of Department of English',
    deptCode: 'BA-ENG',
    deptName: 'Department of English (School of Arts and Humanities)',
    email: 'trivedi.hm@lokbhartiuniversity.edu.in',
    phone: '+91 98250 88990',
    employeeId: 'LBU-HOD-105',
    room: 'Arts Building Block A-201',
    officeHours: 'Mon - Fri: 11:00 AM - 01:00 PM',
    qualification: 'M.A., Ph.D. in English Literature & Comparative Linguistics',
    specialization: 'British Literature, Indian Writing in English & Communication Skills',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  },
];

// Student roster record interface
export interface StudentRosterItem {
  id: string;
  name: string;
  enrollmentNo: string;
  email: string;
  department: string;
  departmentId: string;
  semester: number;
  status: string;
  phone: string;
  avatar?: string;
}

function getInitialStudentsRoster(): StudentRosterItem[] {
  try {
    return getStoredUsers().filter((u) => u.role === 'student').map((u) => ({
      id: u.id,
      name: u.name,
      enrollmentNo: u.enrollmentNo || 'N/A',
      email: u.email,
      department: u.departmentName || 'Department',
      departmentId: u.departmentId,
      semester: u.semester || 3,
      status: 'Active',
      phone: u.phone || '+91 98765 00000',
      avatar: u.avatar,
    }));
  } catch (e) {
    return [];
  }
}


// Faculty List across Active Departments (All Authentic Faculty Members)
const FACULTY_LIST = [
  {
    id: 'fac_sachin_dhokiya',
    name: 'Mr. Sachin Dhokiya',
    employeeId: 'LBU-FAC-104',
    designation: 'Assistant Professor',
    qualification: 'MRS (Agronomy)',
    department: 'School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_agronomy',
    email: 'sachin.dhokiya@lokbharatiuniversity.edu.in',
    phone: '7698150835',
    avatar: AVATAR_SACHIN_DHOKIYA,
    subjects: [
      { code: 'AG-201', name: 'Soil Science & Organic Fertilizers', semester: 2, credits: 4, weeklyHours: 5 },
      { code: 'AG-302', name: 'Agronomy Field Experiments', semester: 3, credits: 4, weeklyHours: 6 },
    ],
  },
  {
    id: 'fac_chirag_kantariya',
    name: 'Mr. Chirag Kantariya',
    employeeId: 'LBU-FAC-105',
    designation: 'Assistant Professor',
    qualification: 'M.Sc Food Biotechnology',
    department: 'School of Skills and Entrepreneurship',
    departmentId: 'dept_bvoc_afp',
    email: 'chirag.kantariya@lokbharatiuniversity.edu.in',
    phone: '09429381942',
    avatar: AVATAR_CHIRAG_KANTARIYA,
    subjects: [
      { code: 'AFP-301', name: 'Food Biotechnology & Preservation', semester: 3, credits: 4, weeklyHours: 6 },
      { code: 'AFP-302', name: 'Quality Control in Food Processing', semester: 3, credits: 3, weeklyHours: 4 },
    ],
  },
  {
    id: 'fac_ghanshyam_hirani',
    name: 'Mr. Ghanshyam Hirani',
    employeeId: 'LBU-FAC-106',
    designation: 'Assistant Professor',
    qualification: 'MRS (Agronomy)',
    department: 'School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_agronomy',
    email: 'ghanshyam.hirani@lokbharatiuniversity.edu.in',
    phone: '7096779672',
    avatar: AVATAR_GHANSHYAM_HIRANI,
    subjects: [
      { code: '08BVOCAE303', name: 'Values and Ethics', semester: 3, credits: 3, weeklyHours: 3 },
      { code: 'AG-303', name: 'Sustainable Crop Ecology', semester: 3, credits: 3, weeklyHours: 4 },
    ],
  },
  {
    id: 'fac_ramdevsinh_gohil',
    name: 'Mr. Ramdevsinh Gohil',
    employeeId: 'LBU-FAC-107',
    designation: 'Assistant Professor',
    qualification: 'MRS',
    department: 'Department of Animal Husbandry and Dairy Science – School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_ahds',
    email: 'ramdevsinh.gohil@lokbharatiuniversity.edu.in',
    phone: '9428994780',
    avatar: AVATAR_RAMDEVSINH_GOHIL,
    subjects: [
      { code: 'AHDS-301', name: 'Livestock Care & Management', semester: 3, credits: 4, weeklyHours: 5 },
      { code: 'AHDS-302', name: 'Dairy Processing & Technology', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_mayur_solanki',
    name: 'Dr. Mayur Solanki',
    employeeId: 'LBU-FAC-108',
    designation: 'Assistant Professor',
    qualification: 'MRS (Horticulture & Foresty)',
    department: 'School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_horti',
    email: 'mayur.solanki@lokbharatiuniversity.edu.in',
    phone: '9723173774',
    avatar: AVATAR_MAYUR_SOLANKI,
    subjects: [
      { code: 'HORT-301', name: 'Pomology & Fruit Production', semester: 3, credits: 4, weeklyHours: 5 },
      { code: 'HORT-302', name: 'Forestry & Nursery Operations', semester: 3, credits: 3, weeklyHours: 4 },
    ],
  },
  {
    id: 'fac_paresh_zinzala',
    name: 'Dr. Paresh Zinzala',
    employeeId: 'LBU-FAC-109',
    designation: 'Assistant Professor',
    qualification: 'Ph.D.',
    department: 'Department of Agro-Processing – School of Skills and Entrepreneurship',
    departmentId: 'dept_bvoc_afp',
    email: 'paresh.zinzala@lokbharatiuniversity.edu.in',
    phone: '9537583109',
    avatar: AVATAR_PARESH_ZINZALA,
    subjects: [
      { code: 'AFP-201', name: 'Agro-Commodity Processing', semester: 2, credits: 4, weeklyHours: 5 },
      { code: 'AFP-303', name: 'Packaging and Storage Tech', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_rishu_raj',
    name: 'Mr. Rishu Raj',
    employeeId: 'LBU-FAC-100',
    designation: 'Assistant Professor & Head',
    qualification: 'MCA',
    department: 'B. Voc. IT',
    departmentId: 'dept_it',
    email: 'rishu.raj@lokbharatiuniversity.edu.in',
    phone: '8789287630',
    avatar: AVATAR_RISHU_RAJ,
    subjects: [
      { code: '08BVOCMJ306', name: 'Software Engineering', semester: 3, credits: 4, weeklyHours: 6 },
    ],
  },
  {
    id: 'fac_vijay_padhariya',
    name: 'Mr. Vijay Padhariya',
    employeeId: 'LBU-FAC-110',
    designation: 'Teacher Assistant',
    qualification: 'BRS (Animal Husbandry and Dairy Science) + MSW',
    department: 'School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_ahds',
    email: 'vijay.padhariya@lokbharatiuniversity.edu.in',
    phone: '9558613134',
    avatar: AVATAR_VIJAY_PADHARIYA,
    subjects: [
      { code: 'AHDS-LAB', name: 'Dairy Field Practicals & Extension', semester: 3, credits: 3, weeklyHours: 6 },
    ],
  },
  {
    id: 'fac_shraddha_vegda',
    name: 'Ms. Shraddha Vegda',
    employeeId: 'LBU-FAC-111',
    designation: 'Assistant Professor',
    qualification: 'M.Sc. (Agri.) Agronomy',
    department: 'School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_agronomy',
    email: 'shraddha.vegda@lokbharatiuniversity.edu.in',
    phone: '6354893134',
    avatar: AVATAR_SHRADDHA_VEGDA,
    subjects: [
      { code: 'AG-304', name: 'Organic Seed Multiplication', semester: 3, credits: 4, weeklyHours: 5 },
      { code: 'AG-305', name: 'Weed Management & Crop Rotation', semester: 3, credits: 3, weeklyHours: 4 },
    ],
  },
  {
    id: 'fac_kalaria_rajvee',
    name: 'Miss. Kalaria Rajvee',
    employeeId: 'LBU-FAC-112',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. Agronomy',
    department: 'Natural Farming',
    departmentId: 'dept_bvoc_nf',
    email: 'rajvee.kalaria@lokbharatiuniversity.edu.in',
    phone: '8511563809',
    avatar: AVATAR_KALARIA_RAJVEE,
    subjects: [
      { code: 'NF-301', name: 'Zero Budget Natural Farming (ZBNF)', semester: 3, credits: 4, weeklyHours: 5 },
      { code: 'NF-302', name: 'Bio-formulations and Microbial Inputs', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_himanshi_parmar',
    name: 'Miss. Himanshi Parmar',
    employeeId: 'LBU-FAC-113',
    designation: 'Assistant Professor',
    qualification: 'M.A. (English)',
    department: 'Department of English – School of Humanities and Social Science',
    departmentId: 'dept_ba_english',
    email: 'himanshi.parmar@lokbharatiuniversity.edu.in',
    phone: '9537824655',
    avatar: AVATAR_HIMANSHI_PARMAR,
    subjects: [
      { code: 'ENG-101', name: 'Communication Skills & Phonetics', semester: 1, credits: 4, weeklyHours: 5 },
      { code: 'ENG-301', name: 'Modern English Literature', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_vala_femi',
    name: 'Dr. Vala Femi',
    employeeId: 'LBU-FAC-114',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. (Agronomy)',
    department: 'Department of Agronomy – School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_agronomy',
    email: 'femi.vala@lokbharatiuniversity.edu.in',
    phone: '8530785635',
    avatar: AVATAR_VALA_FEMI,
    subjects: [
      { code: '08BVOCSE303', name: 'Google Tools & Cloud Suite', semester: 3, credits: 3, weeklyHours: 4 },
      { code: 'AG-306', name: 'Agronomy Specialization Practicum', semester: 3, credits: 3, weeklyHours: 4 },
    ],
  },
  {
    id: 'fac_dhyan_patel',
    name: 'Mr. Dhyan Patel',
    employeeId: 'LBU-FAC-115',
    designation: 'Assistant Professor',
    qualification: 'M.R.S (Agronomy)',
    department: 'Department of Agronomy – School of Skills and Entrepreneurship',
    departmentId: 'dept_brs_agronomy',
    email: 'dhyan.patel@lokbharatiuniversity.edu.in',
    phone: '9316029801',
    avatar: AVATAR_DHYAN_PATEL,
    subjects: [
      { code: 'AG-307', name: 'Crop Nutrition & Foliar Sprays', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_mitulgiri_gauswami',
    name: 'Mr. Mitulgiri Gauswami',
    employeeId: 'LBU-FAC-101',
    designation: 'Assistant Professor',
    qualification: 'M.E., B.E.',
    department: 'Information Technology, School of Skills and Entrepreneurship',
    departmentId: 'dept_it',
    email: 'mitulgiri.gauswami@lokbharatiuniversity.edu.in',
    phone: '9537777998',
    avatar: AVATAR_MITULGIRI_GAUSWAMI,
    subjects: [
      { code: '08BVOCMJ305', name: 'Oops – using C++', semester: 3, credits: 4, weeklyHours: 6 },
    ],
  },
  {
    id: 'fac_mahavirsinh_parmar',
    name: 'Mr. Mahavirsinh Parmar',
    employeeId: 'LBU-FAC-116',
    designation: 'Assistant Professor',
    qualification: 'MBA Marketing',
    department: 'Department of BBA',
    departmentId: 'dept_bba',
    email: 'mahavirsinh.parmar@lokbharatiuniversity.edu.in',
    phone: '8000258008',
    avatar: AVATAR_MAHAVIRSINH_PARMAR,
    subjects: [
      { code: 'BBA-101', name: 'Principles of Management', semester: 1, credits: 4, weeklyHours: 5 },
      { code: 'BBA-301', name: 'Marketing Management & Agribusiness', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_mukund_kalsariya',
    name: 'Mr. Mukund Kalsariya',
    employeeId: 'LBU-FAC-117',
    designation: 'Sports Director & Physical Education Instructor',
    qualification: 'M.P.Ed, NIS Coach',
    department: 'Sports & Physical Education Cell',
    departmentId: 'dept_bba',
    email: 'mukund.kalsariya@lokbharatiuniversity.edu.in',
    phone: '+91 98251 99001',
    avatar: AVATAR_MUKUND_KALSARIYA,
    subjects: [
      { code: 'PED-101', name: 'Physical Fitness & Sports Science', semester: 1, credits: 2, weeklyHours: 4 },
      { code: 'PED-301', name: 'Athletics & Sports Leadership', semester: 3, credits: 3, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_bhautik_limbani',
    name: 'Dr. Bhautik Limbani',
    employeeId: 'LBU-FAC-118',
    designation: 'Assistant Professor (English)',
    qualification: 'Ph.D. (English Literature)',
    department: 'Department of English – School of Humanities and Social Science',
    departmentId: 'dept_ba_english',
    email: 'bhautik.limbani@lokbharatiuniversity.edu.in',
    phone: '+91 98254 77123',
    avatar: AVATAR_BHAUTIK_LIMBANI,
    subjects: [
      { code: 'ENG-201', name: 'British Literature & Drama', semester: 2, credits: 4, weeklyHours: 5 },
      { code: 'ENG-302', name: 'Literary Criticism & Theory', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
  {
    id: 'fac_vishal_bhadani',
    name: 'Dr. Vishal Bhadani',
    employeeId: 'LBU-FAC-119',
    designation: 'Assistant Professor (Comparative Literature)',
    qualification: 'Ph.D. (Comparative Literature & Linguistics)',
    department: 'Department of English – School of Humanities and Social Science',
    departmentId: 'dept_ba_english',
    email: 'vishal.bhadani@lokbharatiuniversity.edu.in',
    phone: '+91 94280 11984',
    avatar: AVATAR_VISHAL_BHADANI,
    subjects: [
      { code: 'ENG-202', name: 'Comparative World Literature', semester: 2, credits: 4, weeklyHours: 5 },
      { code: 'ENG-303', name: 'Linguistics & Phonetics Seminar', semester: 3, credits: 4, weeklyHours: 5 },
    ],
  },
];

export const UniversityDirectoryModule: React.FC<UniversityDirectoryModuleProps> = ({
  currentUser,
  onNavigateTab,
  onSendMessageToUser
}) => {
  const isStudent = currentUser.role === 'student';
  const studentDeptId = currentUser.departmentId || 'dept_it';

  const [activeTab, setActiveTab] = useState<'gallery' | 'depts' | 'hods' | 'faculty' | 'students'>('gallery');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<'all' | 'admin' | 'faculty'>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [studentSemFilter, setStudentSemFilter] = useState<string>('all');
  const [selectedStudentForTimetable, setSelectedStudentForTimetable] = useState<StudentRosterItem | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);

  const [studentsRoster, setStudentsRoster] = useState<StudentRosterItem[]>(() => getInitialStudentsRoster());
  const [dataVersion, setDataVersion] = useState<number>(0);

  // Listen for database student/faculty updates
  useEffect(() => {
    const handleUserUpdated = () => {
      setStudentsRoster(getInitialStudentsRoster());
      setDataVersion((v) => v + 1);
    };
    window.addEventListener('lbu_user_updated', handleUserUpdated);
    return () => {
      window.removeEventListener('lbu_user_updated', handleUserUpdated);
    };
  }, []);

  // Central university directory provides full transparency across all divisions
  const storedUsersList = getStoredUsers();
  const displayDepartments = DEPARTMENTS;

  const displayAdmins = ADMIN_LIST.map((admin) => {
    const cleanE = admin.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const matched = storedUsersList.find(
      (u) =>
        u.id === admin.id ||
        (u.employeeId && u.employeeId === admin.employeeId) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (matched) {
      return {
        ...admin,
        name: matched.name || admin.name,
        avatar: matched.avatar || admin.avatar,
        phone: matched.phone || admin.phone,
        designation: matched.designation || admin.designation,
      };
    }
    return admin;
  });

  const displayHODs = HOD_DETAILS.map((hod) => {
    const cleanE = hod.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const matched = storedUsersList.find(
      (u) =>
        u.id === hod.id ||
        (u.employeeId && u.employeeId === hod.employeeId) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (matched) {
      return {
        ...hod,
        name: matched.name || hod.name,
        avatar: matched.avatar || hod.avatar,
        phone: matched.phone || hod.phone,
        title: matched.designation || hod.title,
      };
    }
    return hod;
  });

  const displayFaculty = FACULTY_LIST.map((fac) => {
    const cleanE = fac.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const matched = storedUsersList.find(
      (u) =>
        u.id === fac.id ||
        (u.employeeId && u.employeeId === fac.employeeId) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (matched) {
      return {
        ...fac,
        name: matched.name || fac.name,
        avatar: matched.avatar || fac.avatar,
        phone: matched.phone || fac.phone,
        designation: matched.designation || fac.designation,
        qualification: matched.qualification || fac.qualification,
      };
    }
    return fac;
  });

  const displayStudentsRoster = studentsRoster;

  // Total statistics calculations
  const totalStudents = displayDepartments.reduce((sum, d) => sum + d.studentCount, 0);
  const totalFaculty = displayFaculty.length;
  const totalHODs = displayHODs.length;
  const totalDepts = displayDepartments.length;

  const filteredAdmins = displayAdmins.filter((a) => {
    if (!gallerySearch) return true;
    return matchUserSmart(a, gallerySearch);
  });

  const filteredFacultyCards = displayFaculty.filter((f) => {
    if (!gallerySearch) return true;
    return matchUserSmart(f, gallerySearch);
  });

  const filteredStudents = displayStudentsRoster.filter((s) => {
    const matchesSearch = !studentSearch || matchUserSmart(s, studentSearch);
    const matchesDept = deptFilter === 'all' || s.departmentId === deptFilter;
    const matchesSem = studentSemFilter === 'all' || s.semester === parseInt(studentSemFilter);
    return matchesSearch && matchesDept && matchesSem;
  });

  const handleOpenAdminProfile = (admin: typeof ADMIN_LIST[0]) => {
    const storedUsers = getStoredUsers();
    const cleanE = admin.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const existing = storedUsers.find(
      (u) =>
        u.id === admin.id ||
        (u.employeeId && u.employeeId === admin.employeeId) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (existing) {
      setSelectedUserForProfile(existing);
    } else {
      const tempUser: User = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        departmentId: admin.departmentId,
        departmentName: admin.department,
        employeeId: admin.employeeId,
        phone: admin.phone,
        designation: admin.designation,
        qualification: admin.qualification,
        officeLocation: admin.room,
        avatar: admin.avatar,
        status: 'active',
        bio: `${admin.name} serves as ${admin.title} at Lokbharti University. Specialization: ${admin.specialization}. Office: ${admin.room}. Office Hours: ${admin.officeHours}.`,
      };
      setSelectedUserForProfile(tempUser);
    }
  };

  const handleOpenStudentProfile = (student: StudentRosterItem) => {
    const storedUsers = getStoredUsers();
    const cleanE = student.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const existing = storedUsers.find(
      (u) =>
        u.id === student.id ||
        (u.enrollmentNo && u.enrollmentNo === student.enrollmentNo) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (existing) {
      setSelectedUserForProfile(existing);
    } else {
      const tempUser: User = {
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        departmentId: student.departmentId,
        departmentName: student.department,
        enrollmentNo: student.enrollmentNo,
        semester: student.semester,
        phone: student.phone,
        designation: 'Enrolled Student',
        avatar: student.avatar,
        status: 'active',
        bio: `${student.name} is an active student in ${student.department} (Semester ${student.semester}) at Lokbharti University.`
      };
      setSelectedUserForProfile(tempUser);
    }
  };

  const handleOpenHODProfile = (hod: typeof HOD_DETAILS[0]) => {
    const storedUsers = getStoredUsers();
    const cleanE = hod.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const existing = storedUsers.find(
      (u) =>
        u.id === hod.id ||
        (u.employeeId && u.employeeId === hod.employeeId) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (existing) {
      setSelectedUserForProfile(existing);
    } else {
      const tempUser: User = {
        id: hod.id,
        name: hod.name,
        email: hod.email,
        role: 'hod',
        departmentId: hod.deptCode,
        departmentName: hod.deptName,
        employeeId: hod.employeeId,
        phone: hod.phone,
        designation: hod.title,
        qualification: hod.qualification,
        officeLocation: hod.room,
        avatar: hod.avatar,
        status: 'active',
        bio: `${hod.name} serves as ${hod.title}. Specialization: ${hod.specialization}. Office Hours: ${hod.officeHours}.`
      };
      setSelectedUserForProfile(tempUser);
    }
  };

  const handleOpenFacultyProfile = (fac: typeof FACULTY_LIST[0]) => {
    const storedUsers = getStoredUsers();
    const cleanE = fac.email?.toLowerCase().trim();
    const altE = cleanE?.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const existing = storedUsers.find(
      (u) =>
        u.id === fac.id ||
        (u.employeeId && u.employeeId === fac.employeeId) ||
        (cleanE && u.email && u.email.toLowerCase().trim() === cleanE) ||
        (altE && u.email && u.email.toLowerCase().trim() === altE)
    );
    if (existing) {
      setSelectedUserForProfile(existing);
    } else {
      const tempUser: User = {
        id: fac.id,
        name: fac.name,
        email: fac.email,
        role: 'teacher',
        departmentId: fac.departmentId,
        departmentName: fac.department,
        employeeId: fac.employeeId,
        phone: fac.phone,
        designation: fac.designation,
        qualification: fac.qualification,
        avatar: (fac as any).avatar,
        status: 'active',
        bio: `${fac.name} is ${fac.designation} at Lokbharti University (${fac.department}), teaching ${fac.subjects.map(s => s.name).join(', ')}.`
      };
      setSelectedUserForProfile(tempUser);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl border border-slate-700/60 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 ring-2 ring-emerald-500/30">
            <img
              src={LOKBHARTI_LOGO}
              alt="Lokbharti University Seal"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Central University Directory
              </span>
              <span className="text-xs text-slate-300 font-medium">Lokbharti Gramvidyapith • Sanosara</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              University Structure, Faculty & Profiles
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Authentic photo directory of University Administration, Department Heads, Academic Faculty, and Student Rosters.
            </p>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'gallery' ? 'bg-[#E5A729] text-slate-950 shadow-md' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Photo Directory
          </button>
          <button
            onClick={() => setActiveTab('depts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'depts' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Departments ({totalDepts})
          </button>
          <button
            onClick={() => setActiveTab('hods')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hods' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            HODs Info ({totalHODs})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'faculty' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Teachers & Subjects ({totalFaculty})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'students' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Student Roster ({totalStudents})
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Departments</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalDepts}</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Under SSE & Rural Arts</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled Students</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalStudents.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Across All Semesters</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teaching Faculty</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalFaculty}</div>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">1:13 Student Ratio</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department Heads (HODs)</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalHODs}</div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Academic Leaders</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 0: PHOTO DIRECTORY GALLERY (Matching Exact Visual Layout) */}
      {activeTab === 'gallery' && (
        <div className="space-y-8">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGalleryCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  galleryCategory === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All Directory ({displayAdmins.length + displayFaculty.length})
              </button>
              <button
                onClick={() => setGalleryCategory('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  galleryCategory === 'admin'
                    ? 'bg-[#E5A729] text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Administration ({displayAdmins.length})
              </button>
              <button
                onClick={() => setGalleryCategory('faculty')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  galleryCategory === 'faculty'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Faculty Members ({displayFaculty.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, dept..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
              />
              {gallerySearch && (
                <button
                  onClick={() => setGallerySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SECTION 1: ADMINISTRATION */}
          {(galleryCategory === 'all' || galleryCategory === 'admin') && filteredAdmins.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/30">
                <h2 className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB438] tracking-tight flex items-center gap-2">
                  <span>Administration</span>
                </h2>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  Leadership Council ({filteredAdmins.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                {filteredAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    onClick={() => handleOpenAdminProfile(admin)}
                    className="relative group bg-slate-900 rounded-2xl overflow-hidden border-2 border-[#E5A729] shadow-lg hover:shadow-2xl hover:border-amber-300 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {/* Portrait Photo Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      <UserAvatar
                        name={admin.name}
                        avatar={admin.avatar}
                        role="admin"
                        size="custom"
                        className="w-full h-full text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-500 rounded-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                      {/* Top Role Badge */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-bold text-amber-300 shadow">
                        {admin.employeeId}
                      </div>

                      {/* Signature Gold Nameplate Bar at the bottom */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] bg-[#E5A729] text-slate-950 font-black text-xs sm:text-sm py-1.5 px-3 rounded shadow-md text-center uppercase tracking-tight group-hover:bg-[#F2B635] transition-colors">
                        {admin.name}
                      </div>
                    </div>

                    {/* Quick Info Drawer under photo */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2 text-white">
                      <div className="text-xs font-bold text-amber-400 line-clamp-1">{admin.title}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-1">{admin.department}</div>
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAdminProfile(admin);
                          }}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                        {onSendMessageToUser && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const userObj = displayAdmins.find((u) => u.id === admin.id);
                              if (userObj) {
                                handleOpenAdminProfile(admin);
                              }
                            }}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200"
                            title="Direct Communication"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: FACULTY & ACADEMIC STAFF */}
          {(galleryCategory === 'all' || galleryCategory === 'faculty') && filteredFacultyCards.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/30">
                <h2 className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB438] tracking-tight flex items-center gap-2">
                  <span>Faculty & Academic Staff</span>
                </h2>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {filteredFacultyCards.length} Teaching Professors
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5 pt-2">
                {filteredFacultyCards.map((fac) => (
                  <div
                    key={fac.id}
                    onClick={() => handleOpenFacultyProfile(fac)}
                    className="relative group bg-slate-900 rounded-2xl overflow-hidden border-2 border-[#E5A729] shadow-md hover:shadow-2xl hover:border-amber-300 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {/* Portrait Photo Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      <UserAvatar
                        name={fac.name}
                        avatar={fac.avatar}
                        role="teacher"
                        size="custom"
                        className="w-full h-full text-3xl sm:text-4xl group-hover:scale-105 transition-transform duration-500 rounded-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                      {/* Top Role Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-bold text-emerald-300 shadow">
                        {fac.employeeId}
                      </div>

                      {/* Signature Gold Nameplate Bar at the bottom */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[90%] bg-[#E5A729] text-slate-950 font-black text-[11px] sm:text-xs py-1 px-2.5 rounded shadow-md text-center uppercase tracking-tight truncate group-hover:bg-[#F2B635] transition-colors">
                        {fac.name}
                      </div>
                    </div>

                    {/* Quick Info Drawer under photo */}
                    <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-1 text-white">
                      <div className="text-[11px] font-bold text-amber-400 line-clamp-1">{fac.designation}</div>
                      <div className="text-[10px] text-slate-300 line-clamp-1">{fac.qualification}</div>
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFacultyProfile(fac);
                          }}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Profile
                        </button>
                        <span className="text-[10px] text-slate-400">{fac.subjects.length} Subjects</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: DEPARTMENTS & STUDENT BREAKDOWN */}
      {activeTab === 'depts' && (
        <div className="space-y-6">
          {/* Main Parent Departments Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-slate-700/50 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-black tracking-tight text-white">University Academic Architecture</h3>
                <p className="text-xs text-slate-300">
                  Four Main Degree Programs & Sub-Department Specializations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
              {/* BRS Card */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950 font-mono">
                      BRS
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono font-bold">3 Sub-Depts</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Bachelor of Rural Studies</h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Focuses on sustainable rural ecology, livestock sciences, and crop engineering.
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
                  <div className="text-[11px] font-bold text-emerald-300">1. Agronomy</div>
                  <div className="text-[11px] font-bold text-emerald-300">2. Animal Husbandry & Dairy Science</div>
                  <div className="text-[11px] font-bold text-emerald-300">3. Horticulture</div>
                </div>
              </div>

              {/* B.Voc Card */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-400 text-slate-950 font-mono">
                      B.Voc
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono font-bold">3 Sub-Depts</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Bachelor of Vocation (B.Voc)</h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Industry-oriented skill development, digital technologies, and organic food processing.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="text-[11px] font-bold text-cyan-300">
                    <div>1. Information Technology</div>
                    <span className="block text-[10px] text-cyan-200/90 font-normal pl-3 leading-tight">
                      (Python & Django Web Framework)
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-cyan-300">2. Natural Farming</div>
                  <div className="text-[11px] font-bold text-cyan-300">3. Agro-Food Processing</div>
                </div>
              </div>

              {/* BBA Card */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-slate-950 font-mono">
                      BBA
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">Standalone</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Bachelor of Business Administration</h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Comprehensive management education in agri-business, corporate finance, and enterprise leadership.
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
                  <div className="text-[11px] font-bold text-amber-300">1. Bachelor of Business Administration (BBA)</div>
                </div>
              </div>

              {/* BA English Card */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-400 text-slate-950 font-mono">
                      B.A.
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono font-bold">Literature & Arts</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Bachelor of Arts (BA English)</h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    English literature, linguistics, communication skills, world classics, and creative writing.
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
                  <div className="text-[11px] font-bold text-purple-300">1. Department of English (BA-ENG)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Breakdown Visualizer Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Distribution Breakdown by Sub-Department</h3>
                <p className="text-xs text-slate-500">Visual percentage comparison of {totalStudents} enrolled students across university departments</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
                100% Enrolled
              </span>
            </div>

            <div className="space-y-3">
              {displayDepartments.map((dept) => {
                const percentage = totalStudents > 0 ? ((dept.studentCount / totalStudents) * 100).toFixed(1) : '100';
                return (
                  <button
                    key={dept.id}
                    onClick={() => onNavigateTab && onNavigateTab('students', dept.id)}
                    className="w-full space-y-1 text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">[{dept.degreeCode}]</span> {dept.name} ({dept.code})
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <strong className="text-slate-900 dark:text-white">{dept.studentCount}</strong> students ({percentage}%)
                        <span className="text-[10px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Data &rarr;</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDepartments.map((dept) => {
              const deptHod = HOD_DETAILS.find((h) => h.deptCode === dept.code || h.deptName.includes(dept.code));
              return (
                <div
                  key={dept.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                            DEGREE: {dept.degreeCode}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
                            {dept.code}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-emerald-600 transition-colors">
                          {dept.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {dept.degreeFullName}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>

                    {dept.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {dept.description}
                      </p>
                    )}

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                      <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-semibold">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        HOD: {dept.hodName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                        <div className="text-base font-black text-emerald-700 dark:text-emerald-300">{dept.studentCount}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Enrolled Students</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                        <div className="text-base font-black text-purple-700 dark:text-purple-300">{dept.facultyCount}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Faculty Staff</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('students', dept.id)}
                        className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>View Students</span>
                      </button>
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('timetable')}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-950 dark:text-slate-300 dark:hover:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Timetable</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: HODs INFORMATION */}
      {activeTab === 'hods' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Departmental Heads (HODs) Directory
              </h3>
              <p className="text-xs text-slate-500">Full details of all 8 Head of Departments managing university academic divisions</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl">
              8 Active HODs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayHODs.map((hod) => (
              <div
                key={hod.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => handleOpenHODProfile(hod)}
                      className="cursor-pointer hover:scale-105 transition-transform shrink-0"
                      title="Click to view full profile"
                    >
                      <UserAvatar
                        name={hod.name}
                        avatar={hod.avatar}
                        role="hod"
                        size="lg"
                        className="w-16 h-16 rounded-2xl border-2 border-amber-500/30 shadow-md"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
                        EMP ID: {hod.employeeId}
                      </span>
                      <h4
                        onClick={() => handleOpenHODProfile(hod)}
                        className="text-lg font-black text-slate-900 dark:text-white truncate cursor-pointer hover:text-amber-500 transition-colors"
                      >
                        {hod.name}
                      </h4>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{hod.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{hod.deptName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Contact</span>
                      <p className="font-mono text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {hod.phone}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Office Location</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {hod.room}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Office Hours</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {hod.officeHours}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Qualifications & Research Focus</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{hod.qualification}</p>
                    <p className="text-slate-500 text-[11px]">{hod.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleOpenHODProfile(hod)}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-500" /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      if (onSendMessageToUser) {
                        const stored = getStoredUsers().find(u => u.id === hod.id || u.email === hod.email);
                        if (stored) onSendMessageToUser(stored);
                        else onNavigateTab && onNavigateTab('messaging');
                      } else {
                        onNavigateTab && onNavigateTab('messaging');
                      }
                    }}
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEACHERS & SUBJECTS TAUGHT */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Teaching Faculty & Assigned Subjects
              </h3>
              <p className="text-xs text-slate-500">Official list of all university professors and the exact subject modules they teach</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-xl">
              {displayFaculty.length} Faculty Members
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayFaculty.map((fac) => (
              <div
                key={fac.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3.5">
                      <div
                        onClick={() => handleOpenFacultyProfile(fac)}
                        className="cursor-pointer hover:scale-105 transition-transform shrink-0"
                        title="Click to view full profile"
                      >
                        <UserAvatar
                          name={fac.name}
                          avatar={fac.avatar}
                          role="teacher"
                          size="md"
                          className="w-12 h-12 rounded-2xl border-2 border-purple-500/30 shadow-sm"
                        />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono">
                          EMP: {fac.employeeId}
                        </span>
                        <h4
                          onClick={() => handleOpenFacultyProfile(fac)}
                          className="text-base font-bold text-slate-900 dark:text-white mt-1 cursor-pointer hover:text-purple-500 transition-colors"
                        >
                          {fac.name}
                        </h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{fac.designation}</p>
                        <p className="text-xs text-slate-500 font-medium">{fac.department}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center shrink-0 text-purple-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {fac.phone}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Assigned Teaching Subjects ({fac.subjects.length}):
                    </span>
                    <div className="space-y-2">
                      {fac.subjects.map((sub) => (
                        <div
                          key={sub.code}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {sub.code}: {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Semester {sub.semester} • {sub.credits} Credits
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                            {sub.weeklyHours} Hrs/Wk
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => handleOpenFacultyProfile(fac)}
                    className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      if (onSendMessageToUser) {
                        const stored = getStoredUsers().find(u => u.id === fac.id || u.email === fac.email);
                        if (stored) onSendMessageToUser(stored);
                        else onNavigateTab && onNavigateTab('messaging');
                      } else {
                        onNavigateTab && onNavigateTab('messaging');
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT ROSTER & INDIVIDUAL TIMETABLE */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student name, enrollment no, email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                id="student-roster-search"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                id="student-roster-dept-filter"
              >
                <option value="all">All Departments</option>
                {displayDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={studentSemFilter}
                onChange={(e) => setStudentSemFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                id="student-roster-sem-filter"
              >
                <option value="all">All Semesters (1–6)</option>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>

              <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">
                Showing {filteredStudents.length} Students
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="p-3.5 pl-6">Student Name</th>
                    <th className="p-3.5">Enrollment No</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Sem</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-6">Account & Schedule Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                          <Users className="w-8 h-8 text-slate-400" />
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            No registered students found
                          </p>
                          <p className="text-xs text-slate-500">
                            {studentSemFilter !== 'all' ? `Semester ${studentSemFilter}` : 'Selected criteria'} has 0 active students for this academic session.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const studentDisplayName =
                        currentUser.role === 'student' && currentUser.id !== student.id
                          ? formatStudentDisplayName(student.name)
                          : student.name;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 pl-6 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <div
                            onClick={() => handleOpenStudentProfile(student)}
                            className="cursor-pointer hover:scale-110 transition-transform shrink-0"
                            title="Click to view student profile"
                          >
                            <UserAvatar
                              name={studentDisplayName}
                              avatar={student.avatar}
                              role="student"
                              size="sm"
                              className="w-8 h-8 rounded-full ring-1 ring-emerald-500/30 shadow-xs"
                            />
                          </div>
                          <div>
                            <div
                              onClick={() => handleOpenStudentProfile(student)}
                              className="cursor-pointer hover:text-emerald-500 transition-colors"
                            >
                              {studentDisplayName}
                            </div>
                            {currentUser.role === 'student' && currentUser.id !== student.id ? (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <span className="text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-sans font-bold">Contact Protected</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">{student.phone}</span>
                            )}
                          </div>
                        </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{student.enrollmentNo}</td>
                      <td className="p-3.5 font-medium max-w-xs truncate">{student.department}</td>
                      <td className="p-3.5 font-bold font-mono">Sem {student.semester}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            student.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-6">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleOpenStudentProfile(student)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="View Student Profile"
                          >
                            <Eye className="w-3.5 h-3.5" /> Profile
                          </button>
                          <button
                            onClick={() => setSelectedStudentForTimetable(student)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="View Timetable"
                          >
                            <Clock className="w-3.5 h-3.5" /> Timetable
                          </button>
                          {canCommunicate(currentUser.role, 'student') && onSendMessageToUser && (
                            <button
                              id={`btn-directory-student-msg-${student.id}`}
                              onClick={() => {
                                const stored = getStoredUsers().find(u => u.id === student.id || u.email === student.email);
                                if (stored) {
                                  onSendMessageToUser(stored);
                                } else {
                                  onSendMessageToUser({
                                    id: student.id,
                                    name: student.name,
                                    email: student.email,
                                    role: 'student',
                                    departmentId: student.departmentId || 'dept_it',
                                    departmentName: student.department,
                                    semester: student.semester,
                                    enrollmentNo: student.enrollmentNo,
                                    phone: student.phone,
                                  });
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title={`Send direct message to ${student.name}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Message</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL STUDENT TIMETABLE MODAL */}
      {selectedStudentForTimetable && (() => {
        const timetableStudentName =
          isStudent && currentUser.id !== selectedStudentForTimetable.id
            ? formatStudentDisplayName(selectedStudentForTimetable.name)
            : selectedStudentForTimetable.name;

        return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  {timetableStudentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      {selectedStudentForTimetable.enrollmentNo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Semester {selectedStudentForTimetable.semester}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{timetableStudentName}'s Personalized Timetable</h3>
                  <p className="text-xs text-slate-500">{selectedStudentForTimetable.department}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForTimetable(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Individual Student Weekly Slots */}
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Official weekly class schedule generated for {timetableStudentName}:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const studentSlots = TIMETABLES.filter(
                    (t) =>
                      t.dayOfWeek === day &&
                      t.departmentId === selectedStudentForTimetable.departmentId &&
                      t.semester === selectedStudentForTimetable.semester
                  );

                  return (
                    <div
                      key={day}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {day}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{studentSlots.length} Lectures</span>
                      </div>

                      {studentSlots.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-2">No lectures scheduled</p>
                      ) : (
                        studentSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">{slot.subjectName}</span>
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center justify-between">
                              <span>Faculty: {slot.teacherName}</span>
                              <span className="font-medium text-slate-400">{slot.classroom}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudentForTimetable(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md"
              >
                Close Timetable Window
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Cross-Account User Profile Modal */}
      {selectedUserForProfile && (
        <UserProfileModal
          user={selectedUserForProfile}
          currentUser={currentUser}
          onClose={() => setSelectedUserForProfile(null)}
          onSendMessage={(u) => {
            if (onSendMessageToUser) {
              onSendMessageToUser(u);
            } else if (onNavigateTab) {
              onNavigateTab('messaging');
            }
          }}
        />
      )}
    </div>
  );
};
