export interface Questions {
  id: number;
  number: number;
  image: string;
  correct_answer: OptionsEnum;
  type: TypeEnum;
  origin_test_name: string;
}

export enum OptionsEnum {
  A = "a", B = "b", C = "c", D = "d"
}

export enum TypeEnum {
  PAID = "paid", SAMPLE = "sample", FREE = "free"
}
