import { Results } from "@interfaces/results.interface";
import { User } from "@interfaces/users.interface";
import resultsService from "@services/results.service";
import { Questions } from "@interfaces/questions.interface";
import { Tests } from "@interfaces/test.interface";

class ResultsBotController {
  public testService = new resultsService();

  public saveOptionToResultQuestion = async (test: Tests, question: Questions, selectedOption: string): Promise<void> => {
    console.log("saveOptionToResultQuestion -- ", {
      testId: test.id,
      questionId: question.id,
      number: question.number,
      selectedOption
    });
    await this.testService.saveByQuestion(test.id, question.id, selectedOption);
  };
}

export default ResultsBotController;
