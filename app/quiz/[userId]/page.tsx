"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

const TIMER_SECONDS = 20;
const FEEDBACK_DURATION = 3000;

export default function QuizPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const quizData = useQuery(api.questions.getCurrentQuestion, {
    userId: userId as any,
  });

  const submitAnswer = useMutation(api.questions.submitAnswer);

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selected, setSelected] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { correct: boolean; correctAnswer: string }>(null);

  const selectedRef = useRef(false);
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  const showingFeedbackRef = useRef(false);
  const lastQuestionIndexRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const savedUser = localStorage.getItem("quizUserId");
    if (savedUser && savedUser !== userId) {
      router.push("/");
    }
  }, [userId, router]);

  useEffect(() => {
    if (quizData?.completed) {
      router.push(`/result/${userId}`);
    }
  }, [quizData?.completed, userId, router]);

  useEffect(() => {
    const currentIndex = quizData?.currentQuestionIndex;
    if (currentIndex === undefined) return;
    if (showingFeedbackRef.current) return;
    if (currentIndex === lastQuestionIndexRef.current) return;

    lastQuestionIndexRef.current = currentIndex;
    setTimeLeft(TIMER_SECONDS);
    setSelected(false);
    setSelectedOption(null);
    selectedRef.current = false;
    setFeedback(null);
  }, [quizData?.currentQuestionIndex]);

  useEffect(() => {
    if (!quizData?.question) return;
    if (selected) return;
    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selected, quizData?.question]);

  const showFeedbackThenAdvance = (result: { correct: boolean; correctAnswer: string }) => {
    showingFeedbackRef.current = true;
    setFeedback(result);

    setTimeout(() => {
      showingFeedbackRef.current = false;
      setSelected(false);
      setSelectedOption(null);
      selectedRef.current = false;
      setFeedback(null);
      setTimeLeft(TIMER_SECONDS);
      lastQuestionIndexRef.current = quizDataRef.current?.currentQuestionIndex;
    }, FEEDBACK_DURATION);
  };

  const handleTimeOut = async () => {
    if (selectedRef.current || !quizDataRef.current?.question) return;
    selectedRef.current = true;
    setSelected(true);
    setSelectedOption("TIMEOUT");

    const result = await submitAnswer({
      userId: userId as any,
      questionId: quizDataRef.current.question._id,
      selectedAnswer: "TIMEOUT",
    });

    showFeedbackThenAdvance({ correct: result.correct, correctAnswer: result.correctAnswer });
  };

  const handleAnswer = async (option: string) => {
    if (selected || !quizData?.question) return;
    selectedRef.current = true;
    setSelected(true);
    setSelectedOption(option);

    const result = await submitAnswer({
      userId: userId as any,
      questionId: quizData.question._id,
      selectedAnswer: option,
    });

    showFeedbackThenAdvance({ correct: result.correct, correctAnswer: result.correctAnswer });
  };

  if (!quizData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="animate-pulse text-2xl">Loading Quiz...</div>
      </main>
    );
  }

  const timerColor =
    timeLeft > 10 ? "bg-blue-500" : timeLeft > 5 ? "bg-yellow-500" : "bg-red-500";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#050816] text-white">
      <motion.div
        key={quizData.currentQuestionIndex}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white/10 p-8 rounded-2xl"
      >
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">
            Question {quizData.currentQuestionIndex + 1}/10
          </h2>
          <p>Score: {quizData.score}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Time Left</span>
            <span className={timeLeft <= 5 ? "text-red-400 font-bold" : ""}>{timeLeft}s</span>
          </div>
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full ${timerColor} transition-all duration-1000`}
              style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{
                width: `${((quizData.currentQuestionIndex + 1) / 10) * 100}%`,
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {feedback !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`mb-6 p-4 rounded-xl text-center font-bold text-lg ${
                feedback.correct ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {feedback.correct ? (
                "✓ Correct!"
              ) : (
                <span>
                  ✗ Wrong!{" "}
                  <span className="font-normal">
                    Correct answer:{" "}
                    <span className="font-bold underline">{feedback.correctAnswer}</span>
                  </span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-xl font-semibold mb-6 leading-snug">
          {quizData.question?.question}
        </h1>

        <div className="space-y-3">
          {quizData.question?.options.map((option, index) => {
            let optionStyle = "bg-black/30 border-white/10";

            if (feedback !== null) {
              if (option === feedback.correctAnswer) {
                optionStyle = "bg-green-700 border-green-400 text-white";
              } else if (option === selectedOption) {
                optionStyle = "bg-red-700 border-red-400 text-white opacity-80";
              } else {
                optionStyle = "bg-black/20 border-white/5 opacity-40";
              }
            }

            return (
              <button
                key={index}
                disabled={selected}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 border text-sm
                  ${!selected ? "hover:scale-[1.02] hover:bg-black/50" : "cursor-not-allowed"}
                  ${optionStyle}
                `}
              >
                {option}
              </button>
            );
          })}
        </div>
      </motion.div>
    </main>
  );
}
