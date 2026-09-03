export interface WaterAnswerTypes {
  value: string;
  weight: number;
  answerNumber: number;
}

export interface WaterResponseTypes {
  studentName: string;
  pin: string;
  answerOne: WaterAnswerTypes;
  answerTwo: WaterAnswerTypes;
  score: number;
}