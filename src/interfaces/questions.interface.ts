export interface Questions {
  id?: number;
  number: number;
  image: string;
  correct_answer: OptionsEnum;
  type: TypeEnum;
  public_code: string;
  test_code: string;
}

export enum OptionsEnum {
  A = "a", B = "b", C = "c", D = "d"
}

export enum TypeEnum {
  PAID = "paid", SAMPLE = "sample", FREE = "free"
}
