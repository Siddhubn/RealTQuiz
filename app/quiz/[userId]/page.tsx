"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

export default function QuizPage() {
  const params = useParams();
  const userId=params.userId as string;
  const router = useRouter();

  const quizData = useQuery(
    api.questions.getCurrentQuestion,
    {
      userId: userId as any,
    }
  );

  const submitAnswer = useMutation(
    api.questions.submitAnswer
  );

  const [timeLeft,setTimeLeft]=useState(30);

  const [selected, setSelected] =
    useState(false);

  const [feedback, setFeedback]=useState<null | boolean>(null);

  useEffect(()=>{
    const savedUser = localStorage.getItem("quizUserId");
    if (
        savedUser &&
        savedUser !== userId
    ) {
        router.push("/")
    }

    if(!quizData?.question) return;

    if(selected) return;

    if(timeLeft<=0){
        handleTimeOut();
        return;
    }

    const timer=setTimeout(()=>{
        setTimeLeft((prev)=>prev-1);
    },1000);

    return () => clearTimeout(timer);
  },[timeLeft,selected,quizData]);

  const handleTimeOut =async () => {
    if(
        selected ||
        !quizData?.question
    ) return;
    setSelected(true);

    const result=
        await submitAnswer({
            userId: userId as any,
            questionId:
                quizData.question._id,
            selectedAnswer: "TIMEOUT",
        });

    setFeedback(result.correct);

    setTimeout(()=>{
        setSelected(false);
    },1500);
  };

  if (!quizData) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
      <div className="animate-pulse text-2xl">
        Loading Quiz...
      </div>
    </main>
  );
  }

  if (quizData.completed) {
    router.push(
        `/result/${userId}`
    );
  } 

  return (
  <main className="min-h-screen flex items-center justify-center px-4 bg-[#050816] text-white">
    <motion.div
        key={quizData.currentQuestionIndex}
        initial={{
            opacity: 0,
            y: 30,
        }}
        animate={{
            opacity: 1,
            y: 0,
        }}
        transition={{
            duration: 0.4,
        }}
        className="w-full max-w-2xl bg-white/10 p-8 rounded-2xl"
        >
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">
          Question {quizData.currentQuestionIndex + 1}/10
        </h2>

        <p>Score: {quizData.score}</p>
      </div>

      {/* STEP 8 — TIMER UI */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Time Left</span>

          <span>{timeLeft}s</span>
        </div>

        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-1000"
            style={{
              width: `${(timeLeft / 30) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* STEP 9 — PROGRESS BAR */}
      <div className="mb-8">
        <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{
              width: `${
                ((quizData.currentQuestionIndex + 1) / 10) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* STEP 7 — FEEDBACK UI */}
      {feedback !== null && (
        <div
          className={`mb-6 p-4 rounded-xl text-center font-bold ${
            feedback
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {feedback
            ? "Correct Answer"
            : "Wrong Answer"}
        </div>
      )}

      {/* QUESTION */}
      <h1 className="text-2xl font-semibold mb-8">
        {quizData.question?.question}
      </h1>

      {/* OPTIONS */}
      <div className="space-y-4">
        {quizData.question?.options.map(
          (option, index) => (
            <button
              key={index}
              disabled={selected}
              onClick={async () => {
                if (selected) return;

                setSelected(true);

                const result =
                  await submitAnswer({
                    userId: userId as any,
                    questionId:
                      quizData.question._id,
                    selectedAnswer: option,
                  });

                setFeedback(result.correct);

                setTimeout(() => {
                  setSelected(false);
                }, 1500);
              }}
              className={`
              w-full
              text-left
              p-4
              rounded-xl
              transition-all
              border

              ${
                selected
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-[1.02] hover:bg-black/50"
                }

              bg-black/30
              border-white/10
`               }
            >
              {option}
            </button>
          )
        )}
      </div>

    </motion.div>
  </main>
)};