import type { ScoreBreakdown } from "./types";

export function computeScore(opts: {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  passingScore: number;
}): ScoreBreakdown {
  const { totalQuestions, correctCount, wrongCount, blankCount, passingScore } = opts;
  const score =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  return {
    score,
    correct_count: correctCount,
    wrong_count: wrongCount,
    blank_count: blankCount,
    total_questions: totalQuestions,
    passed: score >= passingScore,
  };
}
