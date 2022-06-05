export interface Question {
  id: number;
  number: string;
  image: string;
  correct_answer: Options;
  origin_test_name: string;
}

export enum Options {
  A = "a", B = "b", C = "c", D = "d"
}
