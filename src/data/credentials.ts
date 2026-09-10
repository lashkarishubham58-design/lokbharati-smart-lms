import { User, UserRole } from '../types';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

export interface UserCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  enrollmentNo?: string;
  employeeId?: string;
  departmentId?: string;
  departmentName?: string;
  phone?: string;
}

/**
 * Centralized Store for all Lokbharti University User Accounts, Emails, and Passwords.
 * Contains credentials across Administration, HODs, Faculty, and Students.
 */
export const AUTH_CREDENTIALS: UserCredential[] = [
  {
    "id": "usr_provost_khimani",
    "name": "Dr. Rajendra Khimani",
    "email": "provost@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "admin",
    "employeeId": "LBU-ADM-000",
    "departmentId": "dept_it",
    "departmentName": "Lokbharati University Administration",
    "phone": "9054863117"
  },
  {
    "id": "usr_admin_vishal_bhadani",
    "name": "Dr. Vishal Bhadani",
    "email": "academicdirector@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "admin",
    "employeeId": "LBU-ADM-002",
    "departmentId": "dept_it",
    "departmentName": "Academic Directorate & Administration",
    "phone": "+91 94268 85387"
  },
  {
    "id": "usr_admin_bhautik_limbani",
    "name": "Dr. Bhautik Limbani",
    "email": "registrar@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "admin",
    "employeeId": "LBU-ADM-003",
    "departmentId": "dept_humanities",
    "departmentName": "Department of English - School of Humanities and Social Science",
    "phone": "+91 98243 89739"
  },
  {
    "id": "usr_hod_cs",
    "name": "Mr. Rishu Raj (HOD)",
    "email": "hod.it@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "hod",
    "employeeId": "LBU-FAC-100",
    "departmentId": "dept_it",
    "departmentName": "Information Technology (B.Voc IT)",
    "phone": "+91 87892 87630"
  },
  {
    "id": "usr_teacher_rishu",
    "name": "Mr. Rishu Raj",
    "email": "rishu.raj@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-100",
    "departmentId": "dept_it",
    "departmentName": "B. Voc. IT",
    "phone": "8789287630"
  },
  {
    "id": "usr_fac_sachin_dhokiya",
    "name": "Mr. Sachin Dhokiya",
    "email": "sachin.dhokiya@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-104",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "School of Skills and Entrepreneurship",
    "phone": "7698150835"
  },
  {
    "id": "usr_fac_chirag_kantariya",
    "name": "Mr. Chirag Kantariya",
    "email": "chirag.kantariya@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-105",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "School of Skills and Entrepreneurship",
    "phone": "09429381942"
  },
  {
    "id": "usr_fac_ghanshyam_hirani",
    "name": "Mr. Ghanshyam Hirani",
    "email": "ghanshyam.hirani@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-106",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "School of Skills and Entrepreneurship",
    "phone": "7096779672"
  },
  {
    "id": "usr_fac_ramdevsinh_gohil",
    "name": "Mr. Ramdevsinh Gohil",
    "email": "ramdevsinh.gohil@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-107",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Department of Animal Husbandry and Dairy Science – School of Skills and Entrepreneurship",
    "phone": "9428994780"
  },
  {
    "id": "usr_fac_mayur_solanki",
    "name": "Dr. Mayur Solanki",
    "email": "mayur.solanki@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-108",
    "departmentId": "dept_brs_horti",
    "departmentName": "School of Skills and Entrepreneurship",
    "phone": "9723173774"
  },
  {
    "id": "usr_fac_paresh_zinzala",
    "name": "Dr. Paresh Zinzala",
    "email": "paresh.zinzala@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-109",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Department of Agro-Processing – School of Skills and Entrepreneurship",
    "phone": "9537583109"
  },
  {
    "id": "usr_fac_vijay_padhariya",
    "name": "Mr. Vijay Padhariya",
    "email": "vijay.padhariya@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-110",
    "departmentId": "dept_brs_ahds",
    "departmentName": "School of Skills and Entrepreneurship",
    "phone": "9558613134"
  },
  {
    "id": "usr_fac_shraddha_vegda",
    "name": "Ms. Shraddha Vegda",
    "email": "shraddha.vegda@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-111",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "School of Skills and Entrepreneurship",
    "phone": "6354893134"
  },
  {
    "id": "usr_fac_kalaria_rajvee",
    "name": "Miss. Kalaria Rajvee",
    "email": "rajvee.kalaria@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-112",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming",
    "phone": "8511563809"
  },
  {
    "id": "usr_fac_himanshi_parmar",
    "name": "Miss. Himanshi Parmar",
    "email": "himanshi.parmar@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-113",
    "departmentId": "dept_ba_english",
    "departmentName": "Department of English – School of Humanities and Social Science",
    "phone": "9537824655"
  },
  {
    "id": "usr_fac_vala_femi",
    "name": "Dr. Vala Femi",
    "email": "femi.vala@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-114",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Department of Agronomy – School of Skills and Entrepreneurship",
    "phone": "8530785635"
  },
  {
    "id": "usr_fac_dhyan_patel",
    "name": "Mr. Dhyan Patel",
    "email": "dhyan.patel@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-115",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Department of Agronomy – School of Skills and Entrepreneurship",
    "phone": "9316029801"
  },
  {
    "id": "usr_fac_mitulgiri_gauswami",
    "name": "Mr. Mitulgiri Gauswami",
    "email": "mitulgiri.gauswami@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-101",
    "departmentId": "dept_it",
    "departmentName": "Information Technology, School of Skills and Entrepreneurship",
    "phone": "9537777998"
  },
  {
    "id": "usr_fac_mahavirsinh_parmar",
    "name": "Mr. Mahavirsinh Parmar",
    "email": "mahavirsinh.parmar@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-116",
    "departmentId": "dept_bba",
    "departmentName": "Department of BBA",
    "phone": "8000258008"
  },
  {
    "id": "usr_fac_bhautik_limbani",
    "name": "Dr. Bhautik Limbani",
    "email": "bhautik.limbani@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-118",
    "departmentId": "dept_ba_english",
    "departmentName": "Department of English – School of Humanities and Social Science",
    "phone": "+91 98254 77123"
  },
  {
    "id": "usr_fac_vishal_bhadani",
    "name": "Dr. Vishal Bhadani",
    "email": "vishal.bhadani@lokbharatiuniversity.edu.in",
    "password": "Luri@123",
    "role": "teacher",
    "employeeId": "LBU-FAC-119",
    "departmentId": "dept_ba_english",
    "departmentName": "Department of English – School of Humanities and Social Science",
    "phone": "+91 94280 11984"
  },
  {
    "id": "usr_st_it_301",
    "name": "Arpit Pratapbhai Makvana",
    "email": "Arpit.Makvana@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221103001",
    "departmentId": "dept_it",
    "departmentName": "Information Technology"
  },
  {
    "id": "usr_st_it_302",
    "name": "Hardik Hareshbhai Chauhan",
    "email": "Hardik.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221103002",
    "departmentId": "dept_it",
    "departmentName": "Information Technology"
  },
  {
    "id": "usr_st_it_304",
    "name": "Harshitaben Ketanbhai Kava",
    "email": "Harshitaben.Kava@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221103004",
    "departmentId": "dept_it",
    "departmentName": "Information Technology"
  },
  {
    "id": "usr_st_it_306",
    "name": "Nachiketa Hareshbhai Kargar",
    "email": "Nachiketa.Kargar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221103006",
    "departmentId": "dept_it",
    "departmentName": "Information Technology"
  },
  {
    "id": "usr_st_it_307",
    "name": "Naimish Vikrambhai Kerashiya",
    "email": "Naimish.Kerashiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221103007",
    "departmentId": "dept_it",
    "departmentName": "Information Technology"
  },
  {
    "id": "usr_st_it_310",
    "name": "Shubham Manojbhai Lashkari",
    "email": "Shubham.Lashkari@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221103010",
    "departmentId": "dept_it",
    "departmentName": "Information Technology"
  },
  {
    "id": "usr_st_afp_301",
    "name": "Akashbhai Bhupatbhai Dhapa",
    "email": "Akashbhai.Dhapa@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102001",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_302",
    "name": "Ankitbhai Mukeshbhai Zapadiya",
    "email": "Ankitbhai.Zapadiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102002",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_303",
    "name": "Arjunsinh Sureshbhai Rathod",
    "email": "Arjunsinh.Rathod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102003",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_304",
    "name": "Army Kamleshbhai Patel",
    "email": "Army.Patel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102004",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_305",
    "name": "Avleshbhai Rasikbhai Vala",
    "email": "Avleshbhai.Vala@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102005",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_306",
    "name": "Dev Manojbhai Dankhara",
    "email": "Dev.Dankhara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102006",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_307",
    "name": "Devvratsinh Jagdishbhai Chauhan",
    "email": "Devvratsinh.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102007",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_308",
    "name": "Jeet Pareshkumar Kotecha",
    "email": "Jeet.Kotecha@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102008",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_309",
    "name": "Kashyapkumar Vallabhbhai Ramani",
    "email": "Kashyapkumar.Ramani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102009",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_310",
    "name": "Krishaben Bhaveshbhai Limbani",
    "email": "Krishaben.Limbani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102010",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_311",
    "name": "Krutarthkumar Manjibhai Dihora",
    "email": "Krutarthkumar.Dihora@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102011",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_312",
    "name": "Mohamadfaraz Najmudin Badi",
    "email": "Mohamadfaraz.Badi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102012",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_313",
    "name": "Mufijhushen Ikbal Badi",
    "email": "Mufijhushen.Badi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102013",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_314",
    "name": "Pratham Mukeshbhai Shakoriya",
    "email": "Pratham.Shakoriya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102014",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_315",
    "name": "Prince Bhagavanji Khambhala",
    "email": "Prince.Khambhala@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102015",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_316",
    "name": "Prince Shaileshbhai Parmar",
    "email": "Prince.Parmar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102016",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_317",
    "name": "Rajubhai Kanabhai Kamaliya",
    "email": "Rajubhai.Kamaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102017",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_318",
    "name": "Rushitaben Kanjibhai Baraiya",
    "email": "Rushitaben.Baraiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102018",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_319",
    "name": "Safvan Nayarazak Badi",
    "email": "Safvan.Badi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102019",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_320",
    "name": "Sahil Gulammustufa Badi",
    "email": "Sahil.Badi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102020",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_321",
    "name": "Sajjadhushen Yunus Sherasiya",
    "email": "Sajjadhushen.Sherasiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102021",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_322",
    "name": "Seema Dhirubhai Jalondhara",
    "email": "Seema.Jalondhara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102022",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_323",
    "name": "Shubham Manishbhai Rathod",
    "email": "Shubham.Rathod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102023",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_324",
    "name": "Takshkumar Chaturbhai Zampadiya",
    "email": "Takshkumar.Zampadiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102024",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_325",
    "name": "Tirth Jitubhai Vaghani",
    "email": "Tirth.Vaghani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102025",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_326",
    "name": "Vishal Kalubhai Dekani",
    "email": "Vishal.Dekani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102026",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_327",
    "name": "Yug Vijaybhai Tarapara",
    "email": "Yug.Tarapara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102027",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_328",
    "name": "Bhagirath Nagbhai Faga",
    "email": "Bhagirath.Faga@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221102028",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_nf_301",
    "name": "Arjunsinh Khodubha Gohil",
    "email": "Arjunsinh.Gohil@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101001",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_302",
    "name": "Akshay Dalsukhbhai Jamod",
    "email": "Akshay.Jamod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101002",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_304",
    "name": "Jaydattsinh Jaydipsinh Rana",
    "email": "Jaydattsinh.Rana@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101004",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_305",
    "name": "Kuldip Bhurabhai Humbal",
    "email": "Kuldip.Humbal@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101005",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_306",
    "name": "Parth Jethurbhai Bhukan",
    "email": "Parth.Bhukan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101006",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_307",
    "name": "Rajvir Kanubhai Mobh",
    "email": "Rajvir.Mobh@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101007",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_308",
    "name": "Ruturaj Bhupatbhai Rathod",
    "email": "Ruturaj.Rathod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101008",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_309",
    "name": "Smit Aniruddhbhai Malani",
    "email": "Smit.Malani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101009",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_310",
    "name": "Smit Kishorbhai Ranva",
    "email": "Smit.Ranva@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101010",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_311",
    "name": "Sunil Ashokbhai Dabhi",
    "email": "Sunil.Dabhi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101011",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_314",
    "name": "Jayvirbhai Hanubhai Khuman",
    "email": "Jayvirbhai.Khuman@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25221101014",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_ahds_302",
    "name": "Jaykrishna Ramabalakdasji Sadhu",
    "email": "Jaykrishna.Sadhu@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202002",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_303",
    "name": "Jenilbhai Govindbhai Sambad",
    "email": "Jenilbhai.Sambad@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202003",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_304",
    "name": "Milan Ghanshyambhai Mankoliya",
    "email": "Milan.Mankoliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202004",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_305",
    "name": "Om Alpansubhai Dave",
    "email": "Om.Dave@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202005",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_306",
    "name": "Piyushkumar Shambhubhai Goyal",
    "email": "Piyushkumar.Goyal@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202006",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_307",
    "name": "Vijay Bhaveshbhai Dekani",
    "email": "Vijay.Dekani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202007",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_308",
    "name": "Hardikbhai Arajanbhai Ragya",
    "email": "Hardikbhai.Ragya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222202008",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_agro_301",
    "name": "Amit Bholabhai Gohel",
    "email": "Amit.Gohel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201001",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_302",
    "name": "Anil Mukeshbhai Pancholiya",
    "email": "Anil.Pancholiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201002",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_303",
    "name": "Anirudhdh Sureshbhai Chauhan",
    "email": "Anirudhdh.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201003",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_304",
    "name": "Darshankumar Devarajbhai Solamiya",
    "email": "Darshankumar.Solamiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201004",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_306",
    "name": "Dhruvkumar Hareshbhai Patel",
    "email": "Dhruvkumar.Patel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201006",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_307",
    "name": "Dhruvrajsinh Jitendrasinh Jadeja",
    "email": "Dhruvrajsinh.Jadeja@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201007",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_308",
    "name": "Digvijay Hasmukhbhai Kateshiya",
    "email": "Digvijay.Kateshiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201008",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_310",
    "name": "Hinaben Amrutbhai Parmar",
    "email": "Hinaben.Parmar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201010",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_311",
    "name": "Jaydipbhai Arvindbhai Dharajiya",
    "email": "Jaydipbhai.Dharajiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201011",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_312",
    "name": "Jeetkumar Chetanbhai Bhatt",
    "email": "Jeetkumar.Bhatt@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201012",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_313",
    "name": "Jitkumar Prakashbhai Ramani",
    "email": "Jitkumar.Ramani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201013",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_314",
    "name": "Khushiben Amrutbhai Vankar",
    "email": "Khushiben.Vankar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201014",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_315",
    "name": "Kundan Dineshbhai Vaghela",
    "email": "Kundan.Vaghela@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201015",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_316",
    "name": "Manav Ghelabhai Dangar",
    "email": "Manav.Dangar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201016",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_317",
    "name": "Mayankkumar Bharatbhai Sartanpara",
    "email": "Mayankkumar.Sartanpara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201017",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_318",
    "name": "Meetbhai Rameshbhai Katariya",
    "email": "Meetbhai.Katariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201018",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_319",
    "name": "Meetkumar Ishvarbhai Bhuva",
    "email": "Meetkumar.Bhuva@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201019",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_320",
    "name": "Mehul Dhirubhai Dharajiya",
    "email": "Mehul.Dharajiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201020",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_321",
    "name": "Mekaranbhai Boghabhai Dharajiya",
    "email": "Mekaranbhai.Dharajiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201021",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_322",
    "name": "Mit Kalubhai Malaviya",
    "email": "Mit.Malaviya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201022",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_323",
    "name": "Namradipsinh Mahavirsinh Gohil",
    "email": "Namradipsinh.Gohil@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201023",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_324",
    "name": "Nikunj Pravinbhai Rajapara",
    "email": "Nikunj.Rajapara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201024",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_325",
    "name": "Nitin Harjibhai Sankaliya",
    "email": "Nitin.Sankaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201025",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_326",
    "name": "Rajvir Dilipbhai Gohil",
    "email": "Rajvir.Gohil@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201026",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_327",
    "name": "Rehan Bhayjibhai Mahetar",
    "email": "Rehan.Mahetar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201027",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_328",
    "name": "Satyajit Mahipatbhai Chauhan",
    "email": "Satyajit.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201028",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_329",
    "name": "Sejalben Sureshbhai Makavana",
    "email": "Sejalben.Makavana@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201029",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_330",
    "name": "Sunilbhai Jayeshbhai Rathod",
    "email": "Sunilbhai.rathod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201030",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_331",
    "name": "Tirth Nileshbhai Vavaliya",
    "email": "Tirth.Vavaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201031",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_332",
    "name": "Tushar Laljibhai Rathod",
    "email": "Tushar.Rathod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201032",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_333",
    "name": "Vaibhav Alpeshbhai Patel",
    "email": "Vaibhav.Patel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201033",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_334",
    "name": "Yashrajsinh Baldevsinh Jadeja",
    "email": "Yashrajsinh.Jadeja@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201034",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_335",
    "name": "Jaydip Bharatbhai Zapadiya",
    "email": "Jaydip.Zapadiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201035",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_336",
    "name": "Parthbhai Ghanshyambhai Makwana",
    "email": "Parthbhai.Makwana@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201036",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_337",
    "name": "Rushibhai Ashokbhai Ambaliya",
    "email": "Rushibhai.Ambaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201037",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_338",
    "name": "Nikunj Bharatbhai Pavra",
    "email": "Nikunj.Pavra@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222201038",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_horti_301",
    "name": "Jainamkumar Pareshbhai Kanzariya",
    "email": "Jainamkumar.Kanzariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222203001",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_horti_302",
    "name": "Monikaben Bakulbhai Kantariya",
    "email": "Monikaben.Kantariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222203002",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_horti_303",
    "name": "Dhrumil Balubhai Katariya",
    "email": "Dhrumil.Katariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25222203003",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_bba_301",
    "name": "Khilan Bharatbhai Dudhagara",
    "email": "Khilan.Dudhagara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25231101001",
    "departmentId": "dept_bba",
    "departmentName": "Bachelor of Business Administration"
  },
  {
    "id": "usr_st_bba_303",
    "name": "Nikunj Hareshbhai Solanki",
    "email": "Nikunj.Solanki@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25231101003",
    "departmentId": "dept_bba",
    "departmentName": "Bachelor of Business Administration"
  },
  {
    "id": "usr_st_bba_304",
    "name": "Rohit Dhirubhai Gohil",
    "email": "Rohit.Gohil@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25231101004",
    "departmentId": "dept_bba",
    "departmentName": "Bachelor of Business Administration"
  },
  {
    "id": "usr_st_bba_306",
    "name": "Tanvi Bhavesh Jamod",
    "email": "Tanvi.Jamod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25231101006",
    "departmentId": "dept_bba",
    "departmentName": "Bachelor of Business Administration"
  },
  {
    "id": "usr_st_bba_307",
    "name": "Utsav Kaushikbhai Dudhagara",
    "email": "Utsav.Dudhagara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25231101007",
    "departmentId": "dept_bba",
    "departmentName": "Bachelor of Business Administration"
  },
  {
    "id": "usr_st_bba_308",
    "name": "Vishva Shaileshbhai Jamod",
    "email": "Vishva.Jamod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25231101008",
    "departmentId": "dept_bba",
    "departmentName": "Bachelor of Business Administration"
  },
  {
    "id": "usr_st_eng_301",
    "name": "Janvi Jilubhai Jebaliya",
    "email": "Janvi.Jebaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25211101001",
    "departmentId": "dept_ba_english",
    "departmentName": "B.A. English"
  },
  {
    "id": "usr_st_eng_302",
    "name": "Yenshita Bharatbhai Savani",
    "email": "Yenshita.Savani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25211101002",
    "departmentId": "dept_ba_english",
    "departmentName": "B.A. English"
  },
  {
    "id": "usr_st_eng_303",
    "name": "Aayushi Narendrabhai Sojitra",
    "email": "Aayushi.Sojitra@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "25211101003",
    "departmentId": "dept_ba_english",
    "departmentName": "B.A. English"
  },
  {
    "id": "usr_st_afp_502",
    "name": "Chintan Hirabhai Sambad",
    "email": "Chintan.Sambad@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102002",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_503",
    "name": "Foram Nileshbhai Metaliya",
    "email": "Foram.Metaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102003",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_505",
    "name": "Harerambhai Dhirabhai Shiyaliya",
    "email": "Harerambhai.Shiyaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102005",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_507",
    "name": "Jalpesh Dalsukhbhai Nakiya",
    "email": "Jalpesh.Nakiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102007",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_508",
    "name": "Jenil Jaysukhbhai Chovatiya",
    "email": "Jenil.Chovatiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102008",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_509",
    "name": "Kaushik Mulubhai Nandaniya",
    "email": "Kaushik.Nandaniya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102009",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_510",
    "name": "Krish Kalubhai Dangar",
    "email": "Krish.Dangar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102010",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_511",
    "name": "Krushang Hasmukhbhai Gami",
    "email": "Krushang.Gami@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102011",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_512",
    "name": "Mandip Naranbhai Gujjar",
    "email": "Mandip.Gujjar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102012",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_514",
    "name": "Nayan Rajubhai Khamal",
    "email": "Nayan.Khamal@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102014",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_515",
    "name": "Parth Hareshbhai Lathiya",
    "email": "Parth.Lathiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102015",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_516",
    "name": "Pradipbhai Mukeshbhai Meniya",
    "email": "Pradipbhai.Meniya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102016",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_517",
    "name": "Rohit Kanubhai Gujariya",
    "email": "Rohit.Gujariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102017",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_518",
    "name": "Roshankumar Veniram Devthala",
    "email": "Roshankumar.Devthala@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102018",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_519",
    "name": "Rudra Viralbhai Halvadiya",
    "email": "Rudra.Halvadiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102019",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_520",
    "name": "Rudrabhai Satishbhai Chauhan",
    "email": "Rudrabhai.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102020",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_521",
    "name": "Rushit Pankajbhai Chauhan",
    "email": "Rushit.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102021",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_522",
    "name": "Rutumbhara Kamleshkumar Dixit",
    "email": "Rutumbhara.Dixit@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102022",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_523",
    "name": "Samarth Narendrakumar Patel",
    "email": "Samarth.Patel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102023",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_524",
    "name": "Satish Arjanbhai Pithiya",
    "email": "Satish.Pithiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102024",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_525",
    "name": "Shivamkumar Dilipbhai Jasoliya",
    "email": "Shivamkumar.Jasoliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102025",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_527",
    "name": "Tanvi Dipakbhai Bagda",
    "email": "Tanvi.Bagda@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102027",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_528",
    "name": "Varshaben Bharatbhai Dabhi",
    "email": "Varshaben.Dabhi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102028",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_afp_529",
    "name": "Vrajkumar Ajaykumar Patel",
    "email": "Vrajkumar.Patel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221102029",
    "departmentId": "dept_bvoc_afp",
    "departmentName": "Agro-Food Processing"
  },
  {
    "id": "usr_st_nf_501",
    "name": "Bhagyeshbhai Nareshbhai Talpada",
    "email": "Bhagyeshbhai.Talpada@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101001",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_502",
    "name": "Ghanshyambhai Rajeshbhai Baraiya",
    "email": "Ghanshyambhai.Baraiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101002",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_503",
    "name": "Jaydipbhai Mukeshbhai Dabhi",
    "email": "Jaydipbhai.Dabhi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101003",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_504",
    "name": "Jaymin Jagdish Talpada",
    "email": "Jaymin.Talpada@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101004",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_505",
    "name": "Ketanbhai Bhayabhai Dabhi",
    "email": "Ketanbhai.Dabhi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101005",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_506",
    "name": "Krishna Hasmukhbhai Patel",
    "email": "Krishna.Patel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101006",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_508",
    "name": "Raviraj Rajabhai Mobh",
    "email": "Raviraj.Mobh@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101008",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_nf_511",
    "name": "Vipulbhai Rajubhai Vaja",
    "email": "Vipulbhai.Vaja@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24221101011",
    "departmentId": "dept_bvoc_nf",
    "departmentName": "Natural Farming"
  },
  {
    "id": "usr_st_ahds_501",
    "name": "Dhruvin Ashokbhai Dhameliya",
    "email": "Dhruvin.Dhameliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202001",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_503",
    "name": "Dipesh Manubhai Bhaliya",
    "email": "Dipesh.Bhaliya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202003",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_505",
    "name": "Kalpesh Mansukbhai Sisa",
    "email": "Kalpesh.Sisa@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202005",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_506",
    "name": "Ketan Mohan Vaghela",
    "email": "Ketan.Vaghela@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202006",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_507",
    "name": "Maheksinh Vijaysinh Zala",
    "email": "Maheksinh.Zala@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202007",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_509",
    "name": "Nalin Maganbhai Luhar",
    "email": "Nalin.Luhar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202009",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_510",
    "name": "Rohit Vinubhai Parmar",
    "email": "Rohit.Parmar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202010",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_511",
    "name": "Umesh Virambhai Khambhla",
    "email": "Umesh.Khambhla@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202011",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_512",
    "name": "Vaibhav Vinodbhai Gohil",
    "email": "Vaibhav.Gohil@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202012",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_ahds_513",
    "name": "Vishvash Sureshbhai Parmar",
    "email": "Vishvash.Parmar@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222202013",
    "departmentId": "dept_brs_ahds",
    "departmentName": "Animal Husbandry & Dairy Science"
  },
  {
    "id": "usr_st_agro_501",
    "name": "Anilkumar Babubhai Vanani",
    "email": "Anilkumar.Vanani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201001",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_502",
    "name": "Anuj Sanjaykumar Ramkabir",
    "email": "Anuj.Ramkabir@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201002",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_503",
    "name": "Bhumikaben Natvarbhai Tadavi",
    "email": "Bhumikaben.Tadavi@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201003",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_504",
    "name": "Chavda Anilkumar Maharibhai",
    "email": "Anilkumar.Chavda@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201004",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_505",
    "name": "Chirag Manojbhai Zezariya",
    "email": "Chirag.Zezariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201005",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_506",
    "name": "Dharmesh Ghanshyambhai Zalavadiya",
    "email": "Dharmesh.Zalavadiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201006",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_507",
    "name": "Gautambhai Kantibhai Virash",
    "email": "Gautambhai.Virash@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201007",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_508",
    "name": "Gautamkumar Pravinbhai Kashela",
    "email": "Gautamkumar.Kashela@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201008",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_509",
    "name": "Gopal Bharatbhai Jani",
    "email": "Gopal.Jani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201009",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_510",
    "name": "Hemanshuni Mahendrabhai Rathod",
    "email": "Hemanshuni.Rathod@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201010",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_511",
    "name": "Hemil Rajnikantbhai Sanghani",
    "email": "Hemil.Sanghani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201011",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_512",
    "name": "Jayraj Ashvinbhai Chavda",
    "email": "Jayraj.Chavda@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201012",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_513",
    "name": "Kishan Hothibhai Talavadiya",
    "email": "Kishan.Talavadiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201013",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_514",
    "name": "Kishan Maheshbhai Bhadka",
    "email": "Kishan.Bhadka@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201014",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_515",
    "name": "Maheshbhai Dajibhai Kanotara",
    "email": "Maheshbhai.Kanotara@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201015",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_516",
    "name": "Manthan Bharatbhai Solanki",
    "email": "Manthan.Solanki@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201016",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_517",
    "name": "Mitrajsinh Mahadevbhai Pavra",
    "email": "Mitrajsinh.Pavra@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201017",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_518",
    "name": "Mitraj Maheshbhai Chavda",
    "email": "Mitraj.Chavda@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201018",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_519",
    "name": "Mohit Gopalbhai Sanghani",
    "email": "Mohit.Sanghani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201019",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_520",
    "name": "Palak Balvantray Baraiya",
    "email": "Palak.Baraiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201020",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_521",
    "name": "Parthiv Bharatbhai Hariyani",
    "email": "Parthiv.Hariyani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201021",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_523",
    "name": "Rajanibhai Bharatbhai Vala",
    "email": "Rajanibhai.Vala@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201023",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_524",
    "name": "Rajnishbhai Bhurabhai Vaja",
    "email": "Rajnishbhai.Vaja@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201024",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_525",
    "name": "Rudra Raghavbhai Navdiya",
    "email": "Rudra.Navdiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201025",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_526",
    "name": "Sagar Janakbhai Nagadukiya",
    "email": "Sagar.Nagadukiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201026",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_527",
    "name": "Sagar Mahipatbhai Chauhan",
    "email": "Sagar.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201027",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_528",
    "name": "Sahil Farukbhai Solanki",
    "email": "Sahil.Solanki@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201028",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_529",
    "name": "Shaktibhai Ramajibhai Govindiya",
    "email": "Shaktibhai.Govindiya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201029",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_530",
    "name": "Shravankumar Ganpatbhai Vaghela",
    "email": "Shravankumar.Vaghela@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201030",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_531",
    "name": "Tirth Dhirubhai Gajera",
    "email": "Tirth.Gajera@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201031",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_532",
    "name": "Utsavkumar Ashvinbhai Vadhel",
    "email": "Utsavkumar.Vadhel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201032",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_533",
    "name": "Kuldipsinh Balbhadrasinh Vaja",
    "email": "Kuldipsinh.Vaja@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201033",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_534",
    "name": "Vikas Dolubhai Makwana",
    "email": "Vikas.Makwana@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201034",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_535",
    "name": "Vishvas Dineshbhai Kalsariya",
    "email": "Vishvas.Kalsariya@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201035",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_536",
    "name": "Yuvrajsinh Ajitbhai Chavda",
    "email": "Yuvrajsinh.Chavda@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201036",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_537",
    "name": "Arjun Parsottambhai Solanki",
    "email": "Arjun.Solanki@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201037",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_agro_538",
    "name": "Jaysukh Jagubhai Vadhel",
    "email": "Jaysukh.Vadhel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222201038",
    "departmentId": "dept_brs_agronomy",
    "departmentName": "Agronomy"
  },
  {
    "id": "usr_st_horti_501",
    "name": "Abhi Amarsinh Gohil",
    "email": "Abhi.Gohil@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222203001",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_horti_502",
    "name": "Pruthaviraj Jesingbhai Vadhel",
    "email": "Pruthaviraj.Vadhel@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222203002",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_horti_503",
    "name": "Rajdipsinh Ranchodbhai Chauhan",
    "email": "Rajdipsinh.Chauhan@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222203003",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_horti_504",
    "name": "Ved Jayeshbhai Rangani",
    "email": "Ved.Rangani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24222203004",
    "departmentId": "dept_brs_horti",
    "departmentName": "Horticulture"
  },
  {
    "id": "usr_st_eng_501",
    "name": "Janvi Khodabhai Desai",
    "email": "Janvi.Desai@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24211101001",
    "departmentId": "dept_ba_english",
    "departmentName": "B.A. English"
  },
  {
    "id": "usr_st_eng_502",
    "name": "Manasvi Jagadishbhai Limbani",
    "email": "Manasvi.Limbani@lokbhartiuniversity.edu.in",
    "password": "Luri@123",
    "role": "student",
    "enrollmentNo": "24211101002",
    "departmentId": "dept_ba_english",
    "departmentName": "B.A. English"
  }
];

/**
 * Clean & normalize any user input string (trims, lowercase, removes zero-width and unwanted spaces).
 */
export function cleanIdentifier(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .trim();
}

/**
 * Normalizes university email domains and variations.
 * E.g. handles lokbharati vs lokbharti, extra dashes/dots, or common domain typos.
 */
export function normalizeEmailDomain(email: string): string {
  let cleaned = cleanIdentifier(email);
  if (!cleaned) return '';

  // If user entered only username without @domain, we keep username for fuzzy matching
  if (!cleaned.includes('@')) {
    return cleaned;
  }

  // Standardize university domain variations and common typos
  cleaned = cleaned
    .replace(/@lokbharatiuniversity\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbhartiuniversity\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbharati\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbharti\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbharatiuniversity\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbhartiuniversity\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbharati\.ac\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbharti\.ac\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbhratiuniversity\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbhartiuniv\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbharatiuniv\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbahratiuniversity\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lokbhartyuniversity\.edu\.in$/, '@lokbhartiuniversity.edu.in')
    .replace(/@lbu\.edu\.in$/, '@lokbhartiuniversity.edu.in');

  return cleaned;
}

/**
 * Standard Levenshtein distance between two strings for typo tolerance.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (!a && !b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates normalized similarity ratio between 0.0 (completely different) and 1.0 (exact match).
 */
export function calculateSimilarity(a: string, b: string): number {
  const s1 = cleanIdentifier(a);
  const s2 = cleanIdentifier(b);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

export interface MatchResult {
  credential: UserCredential | null;
  matchedUser: User | null;
  matchType: 'exact' | 'case_insensitive' | 'domain_normalized' | 'enrollment_no' | 'employee_id' | 'username_alias' | 'fuzzy_match' | 'name_match' | 'none';
  matchedEmail: string;
  confidence: number;
}

/**
 * Intelligent & Typo-Tolerant User Resolver.
 * Resolves user credentials regardless of:
 * - Capital letters (SHUBHAM.LASHKARI@LOKBHARTIUNIVERSITY.EDU.IN)
 * - Domain spelling variations (lokbharati vs lokbharti vs lokbhrati)
 * - Username spelling mistakes (e.g. subham.lashkari, shubham.laskari, rajendr.khimani, rishuraj)
 * - Enrollment numbers or Employee IDs entered in email field
 * - Full names or username-only prefixes
 */
export function findUserCredential(identifier: string, dynamicUsers?: User[]): MatchResult {
  if (!identifier || !identifier.trim()) {
    return { credential: null, matchedUser: null, matchType: 'none', matchedEmail: '', confidence: 0 };
  }

  const raw = identifier.trim().toLowerCase();
  const userList: Array<User | UserCredential> = dynamicUsers && dynamicUsers.length > 0 ? dynamicUsers : AUTH_CREDENTIALS;

  // 1. Strict Exact Full Email Match (in lowercase)
  for (const u of userList) {
    if (u.email && u.email.toLowerCase().trim() === raw) {
      const cred = AUTH_CREDENTIALS.find((c) => c.id === u.id || (c.email && c.email.toLowerCase().trim() === raw)) || (u as UserCredential);
      return { credential: cred, matchedUser: u as User, matchType: 'exact', matchedEmail: u.email, confidence: 1.0 };
    }
  }

  // 2. Strict Exact Domain Variation (lokbharatiuniversity.edu.in <-> lokbhartiuniversity.edu.in only with exact username)
  const normRaw = normalizeEmailDomain(raw);
  for (const u of userList) {
    if (u.email) {
      const uNorm = normalizeEmailDomain(u.email.toLowerCase().trim());
      if (uNorm === normRaw && raw.includes('@') && u.email.includes('@')) {
        const uPrefix = u.email.toLowerCase().trim().split('@')[0];
        const rawPrefix = raw.split('@')[0];
        if (uPrefix === rawPrefix) {
          const cred = AUTH_CREDENTIALS.find((c) => c.id === u.id || (c.email && c.email.toLowerCase().trim() === u.email.toLowerCase().trim())) || (u as UserCredential);
          return { credential: cred, matchedUser: u as User, matchType: 'domain_normalized', matchedEmail: u.email, confidence: 1.0 };
        }
      }
    }
  }

  // 3. Strict Exact Match by Enrollment Number (e.g. 25221103010)
  for (const u of userList) {
    if (u.enrollmentNo && u.enrollmentNo.trim() === raw) {
      const cred = AUTH_CREDENTIALS.find((c) => c.id === u.id) || (u as UserCredential);
      return { credential: cred, matchedUser: u as User, matchType: 'enrollment_no', matchedEmail: u.email, confidence: 1.0 };
    }
  }

  // 4. Strict Exact Match by Employee ID (e.g. LBU-ADM-001, LBU-FAC-100)
  for (const u of userList) {
    if (u.employeeId && u.employeeId.toLowerCase().trim() === raw) {
      const cred = AUTH_CREDENTIALS.find((c) => c.id === u.id) || (u as UserCredential);
      return { credential: cred, matchedUser: u as User, matchType: 'employee_id', matchedEmail: u.email, confidence: 1.0 };
    }
  }

  // No fuzzy or guessed matches allowed. Any minor spelling error fails validation.
  return { credential: null, matchedUser: null, matchType: 'none', matchedEmail: '', confidence: 0 };
}

/**
 * Gets the active password for a user, respecting any custom password changed by user.
 */
export function getActiveUserPassword(userOrIdentifier: string | { id?: string; email?: string; password?: string; enrollmentNo?: string; employeeId?: string }): string {
  const passMap = safeStorageGet<Record<string, string>>('lbu_user_passwords', {});
  const profilesMap = safeStorageGet<Record<string, Partial<User>>>('lbu_user_profiles', {});

  if (typeof userOrIdentifier === 'string') {
    const raw = userOrIdentifier.toLowerCase().trim();
    const cleanId = cleanIdentifier(raw);
    const normEmail1 = raw.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const normEmail2 = raw.replace('lokbhartiuniversity', 'lokbharatiuniversity');

    if (passMap[raw]) return passMap[raw];
    if (passMap[cleanId]) return passMap[cleanId];
    if (passMap[normEmail1]) return passMap[normEmail1];
    if (passMap[normEmail2]) return passMap[normEmail2];

    if (profilesMap[raw]?.password) return profilesMap[raw]!.password!;
    if (profilesMap[cleanId]?.password) return profilesMap[cleanId]!.password!;
    if (profilesMap[normEmail1]?.password) return profilesMap[normEmail1]!.password!;
    if (profilesMap[normEmail2]?.password) return profilesMap[normEmail2]!.password!;

    const match = findUserCredential(userOrIdentifier);
    if (match.credential || match.matchedUser) {
      const cred = match.credential || (match.matchedUser as unknown as UserCredential);
      const cId = cred.id ? cred.id.trim() : '';
      const cEmail = cred.email ? cred.email.toLowerCase().trim() : '';
      const cEmailNorm1 = cEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
      const cEmailNorm2 = cEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');

      if (cId && passMap[cId]) return passMap[cId];
      if (cEmail && passMap[cEmail]) return passMap[cEmail];
      if (cEmailNorm1 && passMap[cEmailNorm1]) return passMap[cEmailNorm1];
      if (cEmailNorm2 && passMap[cEmailNorm2]) return passMap[cEmailNorm2];

      if (cId && profilesMap[cId]?.password) return profilesMap[cId]!.password!;
      if (cEmail && profilesMap[cEmail]?.password) return profilesMap[cEmail]!.password!;
      if (cEmailNorm1 && profilesMap[cEmailNorm1]?.password) return profilesMap[cEmailNorm1]!.password!;

      return cred.password || 'Luri@123';
    }
    return 'Luri@123';
  }

  const u = userOrIdentifier;
  const cleanId = u.id ? u.id.trim() : '';
  const cleanEmail = u.email ? u.email.toLowerCase().trim() : '';
  const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');
  const enroll = u.enrollmentNo ? u.enrollmentNo.trim() : '';
  const emp = u.employeeId ? u.employeeId.trim() : '';

  if (cleanId && passMap[cleanId]) return passMap[cleanId];
  if (cleanEmail && passMap[cleanEmail]) return passMap[cleanEmail];
  if (normEmail1 && passMap[normEmail1]) return passMap[normEmail1];
  if (normEmail2 && passMap[normEmail2]) return passMap[normEmail2];
  if (enroll && passMap[enroll]) return passMap[enroll];
  if (emp && passMap[emp]) return passMap[emp];

  if (cleanId && profilesMap[cleanId]?.password) return profilesMap[cleanId]!.password!;
  if (cleanEmail && profilesMap[cleanEmail]?.password) return profilesMap[cleanEmail]!.password!;
  if (normEmail1 && profilesMap[normEmail1]?.password) return profilesMap[normEmail1]!.password!;

  return u.password || 'Luri@123';
}

/**
 * Saves a new password for a user into persistent client storage.
 */
export function saveActiveUserPassword(userIdOrEmail: string, newPassword: string): void {
  if (!userIdOrEmail || !newPassword) return;
  const passMap = safeStorageGet<Record<string, string>>('lbu_user_passwords', {});
  const raw = userIdOrEmail.toLowerCase().trim();
  const cleanId = cleanIdentifier(raw);
  const normEmail1 = raw.replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const normEmail2 = raw.replace('lokbhartiuniversity', 'lokbharatiuniversity');

  passMap[raw] = newPassword;
  passMap[cleanId] = newPassword;
  passMap[normEmail1] = newPassword;
  passMap[normEmail2] = newPassword;

  const match = findUserCredential(userIdOrEmail);
  if (match.credential || match.matchedUser) {
    const cred = match.credential || (match.matchedUser as unknown as UserCredential);
    if (cred.id) passMap[cred.id.trim()] = newPassword;
    if (cred.email) {
      const cEmail = cred.email.toLowerCase().trim();
      passMap[cEmail] = newPassword;
      passMap[cEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity')] = newPassword;
      passMap[cEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity')] = newPassword;
    }
    const enroll = (cred as any).enrollmentNo || (match.matchedUser as any)?.enrollmentNo;
    if (enroll) {
      passMap[String(enroll).trim()] = newPassword;
    }
    const emp = (cred as any).employeeId || (match.matchedUser as any)?.employeeId;
    if (emp) {
      passMap[String(emp).trim()] = newPassword;
    }
  }

  safeStorageSet('lbu_user_passwords', passMap);
}

/**
 * Full credential validation function used during login.
 * Handles capital letters, spelling mistakes, domain variations, and password verification.
 */
export function validateLogin(
  identifier: string,
  enteredPassword?: string,
  dynamicUsers?: User[]
): {
  success: boolean;
  user: User | null;
  error?: string;
  matchedEmail?: string;
  matchType?: string;
} {
  if (!identifier || !identifier.trim()) {
    return { success: false, user: null, error: 'Please enter your email ID or University ID.' };
  }

  const match = findUserCredential(identifier, dynamicUsers);
  if (!match.matchedUser && !match.credential) {
    return {
      success: false,
      user: null,
      error: "Account not found. No university account matches '" + identifier + "'. Please check your spelling."
    };
  }

  const user = match.matchedUser || (match.credential as unknown as User);
  const expectedPassword = getActiveUserPassword(user);

  if (enteredPassword !== undefined) {
    const isPasswordCorrect = enteredPassword.trim() === expectedPassword.trim();
    if (!isPasswordCorrect) {
      return {
        success: false,
        user: null,
        error: 'Incorrect password. Please enter your active password or use Forgot Password to reset it.',
        matchedEmail: user.email,
        matchType: match.matchType
      };
    }
  }

  return {
    success: true,
    user,
    matchedEmail: user.email,
    matchType: match.matchType
  };
}
