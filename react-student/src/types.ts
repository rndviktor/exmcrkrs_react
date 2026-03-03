export interface PaymentConfirmationSubmission {
    ExamId: string;
    PaymentMethodId?: string;
    AccessCode?: string;
}

export interface ExamType {
    ExamId: string;
    AuthorId: string;
    Title: string;
    Version: number;
    ComposeKey: string;
    Questions?: QuestionType[]
}

export interface QuestionScore {
    QuestionId: string;
    Score: number;
    ScoreString?: string;
}

export interface AnswerCorrectness {
    AnswerId: string;
    IsCorrect: boolean;
}

export interface QuestionCorrectness {
    QuestionId: string;
    Answers: AnswerCorrectness[];
}

export interface QuestionViewModel {
    Questions: QuestionCorrectness[],
    Submissions: QuestionScore[]
}

export interface AnswerType {
    AnswerId?: string | null;
    Content: string;
}
export interface QuestionType {
    QuestionId?: string | null;
    ContentUrl?: string | null;
    NextQuestionId?: string | null;
    PrevQuestionId?: string | null;
    Answers?: AnswerType[];
}

export interface QuestionSubmissionSelection {
    StudentId: string;
    QuestionId: string;
    Score?: number;
    ScoreString?: string;
    SelectedAnswers: string[],
}
export interface ExamSubmissionType {
    ExamId?: string;
    ExamSubmissionId?: string;
    ExamVersion?: number;
    FinishDate?: string;
    QuestionsSubmissions?: QuestionSubmissionSelection[];
    EndDate?: Date
    IsShown?: boolean;
    Score?: number;
    ScoreString?: string;
}

export interface ExamSubmissionsViewModel {
    Exam: ExamType;
    ExamSubmission: ExamSubmissionType;
}