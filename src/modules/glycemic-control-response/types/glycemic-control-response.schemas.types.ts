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

export interface GlycemicControlChartDataTypes {
  students: number;
  question: number;
}