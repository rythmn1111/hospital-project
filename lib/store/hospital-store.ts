export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  address: string;
  bloodGroup: string;
  registeredAt: string;
}

export interface Admission {
  id: string;
  patientId: string;
  department: string;
  doctor: string;
  bedNumber: string;
  diagnosis: string;
  admittedAt: string;
  dischargedAt: string | null;
  dischargeSummary: string;
  status: "admitted" | "discharged";
}

export const initialPatients: Patient[] = [
  {
    id: "P001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    phone: "9876543210",
    address: "12, MG Road, Delhi",
    bloodGroup: "B+",
    registeredAt: "2026-02-10T09:30:00",
  },
  {
    id: "P002",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    phone: "9123456789",
    address: "45, Park Street, Mumbai",
    bloodGroup: "A+",
    registeredAt: "2026-02-11T11:00:00",
  },
  {
    id: "P003",
    name: "Amit Patel",
    age: 58,
    gender: "Male",
    phone: "9988776655",
    address: "78, Lake View, Ahmedabad",
    bloodGroup: "O+",
    registeredAt: "2026-02-12T14:15:00",
  },
  {
    id: "P004",
    name: "Sneha Reddy",
    age: 27,
    gender: "Female",
    phone: "9654321098",
    address: "23, Jubilee Hills, Hyderabad",
    bloodGroup: "AB+",
    registeredAt: "2026-02-13T08:45:00",
  },
  {
    id: "P005",
    name: "Mohammed Ali",
    age: 63,
    gender: "Male",
    phone: "9012345678",
    address: "56, Residency Road, Bangalore",
    bloodGroup: "O-",
    registeredAt: "2026-02-14T10:20:00",
  },
];

export const initialAdmissions: Admission[] = [
  {
    id: "A001",
    patientId: "P001",
    department: "Cardiology",
    doctor: "Dr. Mehra",
    bedNumber: "ICU-03",
    diagnosis: "Acute Myocardial Infarction",
    admittedAt: "2026-02-10T10:00:00",
    dischargedAt: null,
    dischargeSummary: "",
    status: "admitted",
  },
  {
    id: "A002",
    patientId: "P003",
    department: "Orthopedics",
    doctor: "Dr. Kapoor",
    bedNumber: "W2-12",
    diagnosis: "Fractured Femur",
    admittedAt: "2026-02-12T15:00:00",
    dischargedAt: "2026-02-14T11:00:00",
    dischargeSummary: "Patient recovered well post surgery. Follow-up in 2 weeks.",
    status: "discharged",
  },
  {
    id: "A003",
    patientId: "P005",
    department: "Pulmonology",
    doctor: "Dr. Singh",
    bedNumber: "W1-05",
    diagnosis: "Severe Pneumonia",
    admittedAt: "2026-02-14T11:00:00",
    dischargedAt: null,
    dischargeSummary: "",
    status: "admitted",
  },
];

const TOTAL_BEDS = 50;

export function getAvailableBeds(admissions: Admission[]): number {
  const occupied = admissions.filter((a) => a.status === "admitted").length;
  return TOTAL_BEDS - occupied;
}

export function getDischargedToday(admissions: Admission[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return admissions.filter(
    (a) => a.status === "discharged" && a.dischargedAt?.slice(0, 10) === today
  ).length;
}
