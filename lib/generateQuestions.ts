import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY!
);

export async function generateQuestions(age: number) {
  const domains = [
    "Cybersecurity",
    "Cloud Computing",
    "Programming",
    "Linux",
    "Artificial Intelligence",
    "Networking",
    "Web Development",
    "DevOps",
    "AWS",
    "Data Science",
  ];

  const randomDomain = domains[Math.floor(Math.random() * domains.length)];

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Generate exactly 10 unique multiple choice quiz questions.

Requirements:
- Domain: ${randomDomain}
- Age Level: ${age}
- Medium difficulty
- 4 options per question
- One correct answer only
- No explanations, no markdown, no extra text
- Each question must be SHORT: maximum 12 words
- Each option must be SHORT: maximum 6 words
- Questions must be clear and readable at a glance

Return ONLY a valid JSON array with no extra text before or after.

Required format:
[
  {
    "question": "Short question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const parsed = JSON.parse(response);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid quiz format");
    }

    const validQuestions = parsed
      .filter(
        (q: any) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.correctAnswer
      )
      .map((q: any) => ({
        question:
          q.question.length > 120
            ? q.question.slice(0, 117) + "..."
            : q.question,
        options: q.options.map((o: string) =>
          o.length > 60 ? o.slice(0, 57) + "..." : o
        ),
        correctAnswer:
          q.correctAnswer.length > 60
            ? q.correctAnswer.slice(0, 57) + "..."
            : q.correctAnswer,
      }));

    if (validQuestions.length < 10) {
      throw new Error("Not enough valid questions");
    }

    return validQuestions.slice(0, 10);
  } catch {
    return fallbackQuestions();
  }
}

function fallbackQuestions() {
  return [
    {
      question: "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Control Processing User",
      ],
      correctAnswer: "Central Processing Unit",
    },
    {
      question: "Which language is used for web apps?",
      options: ["Python", "JavaScript", "C++", "Assembly"],
      correctAnswer: "JavaScript",
    },
    {
      question: "What is Linux?",
      options: ["Operating System", "Browser", "Database", "Cloud Service"],
      correctAnswer: "Operating System",
    },
    {
      question: "Which is a cloud platform?",
      options: ["AWS", "Photoshop", "Figma", "Blender"],
      correctAnswer: "AWS",
    },
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Transfer Machine Language",
        "Hyperlink Transfer Markup Language",
        "Home Tool Markup Language",
      ],
      correctAnswer: "Hyper Text Markup Language",
    },
    {
      question: "Which protocol is secure?",
      options: ["HTTP", "FTP", "HTTPS", "TELNET"],
      correctAnswer: "HTTPS",
    },
    {
      question: "Which company created React?",
      options: ["Google", "Facebook", "Amazon", "Netflix"],
      correctAnswer: "Facebook",
    },
    {
      question: "What is Git used for?",
      options: ["Version Control", "Video Editing", "Gaming", "Animation"],
      correctAnswer: "Version Control",
    },
    {
      question: "Which database is NoSQL?",
      options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"],
      correctAnswer: "MongoDB",
    },
    {
      question: "What does AI stand for?",
      options: [
        "Artificial Intelligence",
        "Automatic Internet",
        "Advanced Interface",
        "Applied Integration",
      ],
      correctAnswer: "Artificial Intelligence",
    },
  ];
}
