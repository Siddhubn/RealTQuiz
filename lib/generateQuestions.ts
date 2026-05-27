import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY!
);

export async function generateQuestions(
  age: number
) {
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

  const randomDomain =
    domains[
      Math.floor(
        Math.random() * domains.length
      )
    ];

  try {
    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType:
            "application/json",
        },
      });

    const prompt = `
Generate exactly 10 unique multiple choice quiz questions.

Requirements:
- Domain: ${randomDomain}
- Age Level: ${age}
- Medium difficulty
- 4 options per question
- One correct answer only
- No explanations
- No markdown
- No extra text

Return ONLY valid JSON array.

Required format:

[
  {
    "question": "Question text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "correctAnswer": "Correct option"
  }
]
`;

    const result =
      await model.generateContent(
        prompt
      );

    const response =
      result.response.text();

    console.log(
      "RAW GEMINI RESPONSE:",
      response
    );

    const parsed =
      JSON.parse(response);

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error(
        "Invalid quiz format"
      );
    }

    return parsed;
  } catch (error) {
    console.error(
      "Gemini Generation Error:",
      error
    );

    return fallbackQuestions();
  }
}

function fallbackQuestions() {
  return [
    {
      question:
        "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Control Processing User",
      ],
      correctAnswer:
        "Central Processing Unit",
    },

    {
      question:
        "Which language is used for web apps?",
      options: [
        "Python",
        "JavaScript",
        "C++",
        "Assembly",
      ],
      correctAnswer:
        "JavaScript",
    },

    {
      question:
        "What is Linux?",
      options: [
        "Operating System",
        "Browser",
        "Database",
        "Cloud Service",
      ],
      correctAnswer:
        "Operating System",
    },

    {
      question:
        "Which is a cloud platform?",
      options: [
        "AWS",
        "Photoshop",
        "Figma",
        "Blender",
      ],
      correctAnswer:
        "AWS",
    },

    {
      question:
        "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Transfer Machine Language",
        "Hyperlink Transfer Markup Language",
        "Home Tool Markup Language",
      ],
      correctAnswer:
        "Hyper Text Markup Language",
    },

    {
      question:
        "Which protocol is secure?",
      options: [
        "HTTP",
        "FTP",
        "HTTPS",
        "TELNET",
      ],
      correctAnswer:
        "HTTPS",
    },

    {
      question:
        "Which company created React?",
      options: [
        "Google",
        "Facebook",
        "Amazon",
        "Netflix",
      ],
      correctAnswer:
        "Facebook",
    },

    {
      question:
        "What is Git used for?",
      options: [
        "Version Control",
        "Video Editing",
        "Gaming",
        "Animation",
      ],
      correctAnswer:
        "Version Control",
    },

    {
      question:
        "Which database is NoSQL?",
      options: [
        "MongoDB",
        "PostgreSQL",
        "MySQL",
        "SQLite",
      ],
      correctAnswer:
        "MongoDB",
    },

    {
      question:
        "What does AI stand for?",
      options: [
        "Artificial Intelligence",
        "Automatic Internet",
        "Advanced Interface",
        "Applied Integration",
      ],
      correctAnswer:
        "Artificial Intelligence",
    },
  ];
}