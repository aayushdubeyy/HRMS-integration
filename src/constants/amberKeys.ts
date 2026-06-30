export type AmberKeyDefinition = {
  key: string;
  default_label: string;
  pascal_case: string;
  is_date_field: boolean;
};

const DATE_AMBER_KEYS = new Set([
  'manager_change_date',
  'leaving_date',
  'project_change_date',
  'role_change_date',
  'joining_date',
  'appraisal_date',
  'resignation_date',
  'location_change_date',
  'birthdate',
  'wedding',
]);

const PASCAL_CASE_OVERRIDES: Record<string, string> = {
  birthdate: 'DoB',
  manager_change_date: 'DateOfManagerChange',
  joining_date: 'JoiningDate',
  leaving_date: 'LeavingDate',
  resignation_date: 'ResignationDate',
  appraisal_date: 'AppraisalDate',
  project_change_date: 'ProjectChangeDate',
  role_change_date: 'RoleChangeDate',
  location_change_date: 'LocationChangeDate',
  wedding: 'Wedding',
  l_team: 'LTeam',
  hrbp: 'HRBP',
  hrbp1: 'HRBP1',
  hrbp2: 'HRBP2',
  hrbp3: 'HRBP3',
  hrbp4: 'HRBP4',
  hrbp5: 'HRBP5',
  hrbp_email: 'HRBPEmail',
};

export const DEFAULT_MANDATORY_FIELDS = [
  'employee_code',
  'full_name',
  'email',
  'joining_date',
];

const AMBER_KEY_LABELS: Record<string, string> = {
  manager_change_date: 'Date Of Manager Change (DD-MMM-YYYY) (Optional)',
  gender: 'Gender (Optional)',
  employee_grade: 'Employee Grade (Optional)',
  department: 'Department',
  email_sender: 'Email Sender',
  designation: 'Designation (Optional)',
  manager5: 'Manager 5 (Optional)',
  vertical: 'Vertical (Optional)',
  custom_company: 'Custom Company Name',
  preset_language: 'Preferred Language (Optional)',
  country: 'Country',
  manager1: 'Skip-level TL',
  hrbp5: 'HRBP 5 (Optional)',
  marital_status: 'Marital Status (Optional)',
  manager2: 'Matrix TL',
  city: 'City',
  manager4: 'Manager 4 (Optional)',
  leaving_date: 'Leaving Date (DD-MMM-YYYY)',
  email: 'Email ID',
  manager3: 'Manager 3 (Optional)',
  division: 'Division (Optional)',
  manager: 'Direct TL',
  hrbp1: 'HRBP 1 (Optional)',
  employee_type: 'Employee Type (Optional)',
  hrbp: 'HRBP (Optional)',
  full_name: 'Full Name',
  sub_function: 'Sub Function (Optional)',
  business: 'Business (Optional)',
  personal_email: 'Personal Email ID (Optional)',
  l_team: 'L-Team (Optional)',
  project_change_date: 'Date Of Project Change (DD-MMM-YYYY) (Optional)',
  cohort: 'Cohort (Only if you have segmentation of audience)',
  team: 'Team (Optional)',
  hrbp2: 'HRBP 2 (Optional)',
  role_change_date: 'Date Of Role Change (DD-MMM-YYYY) (Optional)',
  employee_code: 'Employee Code',
  location: 'Location',
  manager_email: 'Manager Email (Optional)',
  region: 'Region (Optional)',
  joining_date: 'DoJ (Date of Joining) (DD-MMM-YYYY)',
  given_name: 'Given Name',
  appraisal_date: 'DoA (Date of Appraisal) (DD-MMM-YYYY)',
  nationality: 'Nationality (Optional)',
  work_experience: 'Work Experience (Optional)',
  resignation_date: 'Resignation Date (Optional) (DD-MMM-YYYY)',
  email_sender_designation: 'Email Sender Designation',
  phone: 'Phone Number (Important, if you want to enable SMS reminders)',
  office_phone: 'Office Phone (Optional)',
  location_change_date: 'Date Of Location Change (DD-MMM-YYYY) (Optional)',
  birthdate: 'DoB (Date of Birth) (Optional) (DD-MMM-YYYY)',
  wedding: 'DoW (Date of Wedding) (Optional) (DD-MMM-YYYY)',
  hrbp_email: 'HRBP Email (Optional)',
  hrbp3: 'HRBP 3 (Optional)',
  hrbp4: 'HRBP 4 (Optional)',
  function: 'Cohort (Only if you have segmentation of audience)',
  sub_department: 'Sub Department (Optional)',
  email_sender_email: 'Email Sender Email',
};

export function amberKeyToPascalCase(amber_key: string): string {
  if (PASCAL_CASE_OVERRIDES[amber_key]) {
    return PASCAL_CASE_OVERRIDES[amber_key];
  }

  return amber_key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export const AMBER_KEYS: AmberKeyDefinition[] = Object.entries(AMBER_KEY_LABELS)
  .map(([key, default_label]) => ({
    key,
    default_label,
    pascal_case: amberKeyToPascalCase(key),
    is_date_field: DATE_AMBER_KEYS.has(key),
  }))
  .sort((left, right) => left.key.localeCompare(right.key));

export const AMBER_KEY_MAP = Object.fromEntries(
  AMBER_KEYS.map((definition) => [definition.key, definition]),
);
