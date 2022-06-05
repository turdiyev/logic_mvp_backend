export interface Questions {
  id: number;
  number: number;
  image: string;
  correct_answer: Options;
  origin_test_name: string;
}

export enum Options {
  A = "a", B = "b", C = "c", D = "d"
}
