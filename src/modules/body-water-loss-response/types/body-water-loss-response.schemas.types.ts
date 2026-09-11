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