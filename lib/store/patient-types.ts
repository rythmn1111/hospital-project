export interface Patient {
  id: string;
  nfc_card_id: string | null;
  name: string;
  age: number | null;
  gender: "Male" | "Female" | "Other" | null;
  phone: string | null;
  address: string | null;
  blood_group: string | null;
  abha_number: string | null;
  registered_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  consulted_at: string;
}

export interface TestOrder {
  id: string;
  consultation_id: string;
  patient_id: string;
  test_name: string;
  status: "ordered" | "sample_collected" | "completed";
  ordered_at: string;
  sample_collected_at: string | null;
  completed_at: string | null;
}

export interface TestResult {
  id: string;
  test_order_id: string;
  result_text: string;
  posted_by: string | null;
  posted_at: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  status: "prescribed" | "dispensed";
  prescribed_at: string;
  dispensed_at: string | null;
}

export interface SupabaseAdmission {
  id: string;
  patient_id: string;
  department: string | null;
  doctor: string | null;
  bed_number: string | null;
  diagnosis: string | null;
  admitted_at: string;
  discharged_at: string | null;
  discharge_summary: string | null;
  status: "admitted" | "discharged";
}
