export interface CollegeCommunity {
  slug: string;
  name: string;
  students_active: number;
  students_total: number;
  avg_health_score: number;
  high_risk_alerts: number;
  avg_response_time_min: number;
}

export const COLLEGES: CollegeCommunity[] = [
  {
    slug: "iit-madras",
    name: "IIT Madras",
    students_active: 127,
    students_total: 500,
    avg_health_score: 72,
    high_risk_alerts: 3,
    avg_response_time_min: 2.4,
  },
  {
    slug: "anna-university",
    name: "Anna University",
    students_active: 89,
    students_total: 400,
    avg_health_score: 68,
    high_risk_alerts: 5,
    avg_response_time_min: 3.1,
  },
  {
    slug: "vit-vellore",
    name: "VIT Vellore",
    students_active: 156,
    students_total: 600,
    avg_health_score: 75,
    high_risk_alerts: 2,
    avg_response_time_min: 1.8,
  },
  {
    slug: "srm-institute",
    name: "SRM Institute",
    students_active: 98,
    students_total: 450,
    avg_health_score: 70,
    high_risk_alerts: 4,
    avg_response_time_min: 2.7,
  },
  {
    slug: "nit-trichy",
    name: "NIT Trichy",
    students_active: 112,
    students_total: 480,
    avg_health_score: 73,
    high_risk_alerts: 3,
    avg_response_time_min: 2.2,
  },
  {
    slug: "amity-university",
    name: "Amity University",
    students_active: 76,
    students_total: 350,
    avg_health_score: 69,
    high_risk_alerts: 6,
    avg_response_time_min: 3.5,
  },
  {
    slug: "bits-pilani",
    name: "BITS Pilani",
    students_active: 134,
    students_total: 520,
    avg_health_score: 74,
    high_risk_alerts: 2,
    avg_response_time_min: 2.0,
  },
  {
    slug: "delhi-university",
    name: "Delhi University",
    students_active: 201,
    students_total: 800,
    avg_health_score: 71,
    high_risk_alerts: 7,
    avg_response_time_min: 2.8,
  },
  {
    slug: "iit-bombay",
    name: "IIT Bombay",
    students_active: 145,
    students_total: 550,
    avg_health_score: 76,
    high_risk_alerts: 1,
    avg_response_time_min: 1.5,
  },
  {
    slug: "iit-delhi",
    name: "IIT Delhi",
    students_active: 138,
    students_total: 530,
    avg_health_score: 75,
    high_risk_alerts: 2,
    avg_response_time_min: 1.9,
  },
];

export function getCollegeBySlug(slug: string): CollegeCommunity | undefined {
  return COLLEGES.find((c) => c.slug === slug);
}

export function getCollegeByName(name: string): CollegeCommunity | undefined {
  return COLLEGES.find((c) => c.name === name);
}

