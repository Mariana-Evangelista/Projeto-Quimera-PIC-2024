export interface GlycemicControlAnswerTypes {
  question: number;
  answer: string;
  weight: number;
}

export interface GlycemicControlResponseTypes {
  studentName: string;
  pin: string;
  answers: GlycemicControlAnswerTypes[];
  score: number;
}

export interface GlycemicControlResponseInput {
  studentName: string;
  pin: string;
  answers: { question: number; answer: string; weight?: number }[];
}

export interface GlycemicControlChartDataTypes {
  students: number;
  question: number;
}

export interface GlycemicControlKPIs {
  totalResponses: number;
  averageScore: number;
}

export interface GlycemicControlAnalyticsResponse {
  chart: GlycemicControlChartDataTypes[];
  kpis: GlycemicControlKPIs;
}