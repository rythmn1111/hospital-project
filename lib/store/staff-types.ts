export interface Staff {
  id: string;
  name: string;
  qualification: string | null;
  birthdate: string | null;
  is_doctor: boolean;
  phone: string | null;
  username: string | null;
  password: string | null;
  abha_number: string | null;
  created_at: string;
}

export interface Section {
  id: string;
  name: string;
  slug: string;
}

export interface SectionField {
  id: string;
  section_id: string;
  name: string;
  slug: string;
}

export interface StaffSectionAccess {
  id: string;
  staff_id: string;
  section_id: string;
  field_slugs: string[];
}
