export function calculateScore(questions, answers) {
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  const details = [];

  questions.forEach((q, i) => {
    const userAnswer = answers[i];
    const isBlank = userAnswer === null || userAnswer === undefined;
    const isCorrect = !isBlank && userAnswer === q.answer;
    const isWrong = !isBlank && !isCorrect;

    if (isBlank) blank++;
    else if (isCorrect) correct++;
    else wrong++;

    details.push({
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
      userAnswer,
      isCorrect,
      isBlank,
      explanation: q.explanation || null,
      category: q.category,
      tags: q.tags,
      visualType: q.visualType || null,
    });
  });

  const totalQuestions = questions.length;
  const rawScore = correct - wrong * 0.33;
  const maxScore = totalQuestions;
  const grade = Math.max(0, (rawScore / maxScore) * 10);

  return {
    correct,
    wrong,
    blank,
    totalQuestions,
    rawScore: Math.round(rawScore * 100) / 100,
    grade: Math.round(grade * 100) / 100,
    details,
  };
}
