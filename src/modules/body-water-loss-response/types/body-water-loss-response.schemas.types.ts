export interface BodyWaterLossAnswerTypes {
  value: string;
  weight: number;
}

export interface BodyWaterLossResponseTypes {
  studentName: string;
  pin: string;
  answerOne: BodyWaterLossAnswerTypes;
  answerTwo: BodyWaterLossAnswerTypes;
  score: number;
}

export type BodyWaterLossChartScore = 0 | 20 | 80 | 100;

export interface BodyWaterLossChartDataTypes {
  students: number;
  score: BodyWaterLossChartScore;
  label: string;
}