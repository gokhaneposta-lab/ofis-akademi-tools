/**
 * Smoke: start → answer → finish; ensure attempt GET has no is_correct.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import {
  finishAttempt,
  getExamBySlug,
  loadPublicAttemptQuestions,
  startExamAttempt,
  upsertAnswer,
} from "../lib/exam/queries";

async function main() {
  const exam = await getExamBySlug("tfrs-17");
  if (!exam) throw new Error("exam missing");
  const attempt = await startExamAttempt(exam);
  console.log("attempt", attempt.id, "q", attempt.total_questions, "expires", attempt.expires_at);
  if (attempt.total_questions !== 50) throw new Error("expected 50 questions");

  const qs = await loadPublicAttemptQuestions(attempt.id);
  const raw = JSON.stringify(qs);
  if (raw.includes("is_correct") || raw.includes("explanation")) {
    throw new Error("LEAK: public payload contains secrets");
  }
  console.log("public questions", qs.length, "no leak ok");

  const first = qs[0]!;
  await upsertAnswer({
    attemptId: attempt.id,
    questionId: first.id,
    selectedOptionId: first.options[0]!.id,
  });

  const { breakdown } = await finishAttempt(attempt, exam);
  console.log("score", breakdown);
  console.log("OK smoke");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
