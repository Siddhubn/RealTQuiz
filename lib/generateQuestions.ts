export async function generateQuestions(age: number) {
  const res = await fetch("/api/generate-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age }),
  });

  if (!res.ok) throw new Error("Failed to generate questions");

  const data = await res.json();
  return data.questions as {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}
