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

  const user = useQuery(api.users.getUser, { userId: userId as any });

  const roomMembers = useQuery(
    api.rooms.getRoomMembers,
    user?.roomId ? { roomId: user.roomId } : "skip"
  );

  const submitAnswer = useMutation(api.questions.submitAnswer);
  const markFinished = useMutation(api.users.markFinished);

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selected, setSelected] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { correct: boolean; correctAnswer: string }>(null);

  const selectedRef = useRef(false);
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  const showingFeedbackRef = useRef(false);
  const lastQuestionIndexRef = useRef<number | undefined>(undefined);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!quizData?.completed || finishedRef.current) return;
    finishedRef.current = true;

    const finish = async () => {
      await markFinished({ userId: userId as any });

      if (user?.mode === "multi") {
        const roomCode = localStorage.getItem("quizRoomCode");
        if (roomCode) {
          router.push(`/room/${roomCode}/result`);
        } else {
          router.push("/");
        }
      } else {
        router.push(`/result/${userId}`);
      }
    };

    finish();
  }, [quizData?.completed, userId, user?.mode, markFinished, router]);

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

  if (quizData.waiting) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="animate-pulse text-2xl">Preparing questions...</div>
      </main>
    );
  }

  const timerColor =
    timeLeft > 10 ? "bg-blue-500" : timeLeft > 5 ? "bg-yellow-500" : "bg-red-500";

  const isMulti = user?.mode === "multi";

  return (
    <main className="min-h-screen bg-[#050816] text-white px-4 py-8">
      <div className={`max-w-5xl mx-auto flex gap-6 ${isMulti ? "flex-row items-start" : "flex-col items-center"}`}>

        <motion.div
          key={quizData.currentQuestionIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-white/10 p-8 rounded-2xl flex-shrink-0"
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
                style={{ width: `${((quizData.currentQuestionIndex + 1) / 10) * 100}%` }}
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

        {isMulti && roomMembers && roomMembers.length > 0 && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white/10 p-5 rounded-2xl sticky top-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>🏆</span> Live Leaderboard
              </h3>
              <div className="space-y-2">
                {roomMembers.map((member, i) => {
                  const isMe = member._id === userId;
                  const progress = Math.round((member.currentQuestion / 10) * 100);
                  return (
                    <div
                      key={member._id}
                      className={`p-3 rounded-xl border transition-all ${
                        isMe
                          ? "bg-purple-600/30 border-purple-400/50"
                          : "bg-black/30 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold w-5 ${i === 0 ? "text-yellow-400" : "text-white/40"}`}>
                          {i === 0 ? "👑" : `${i + 1}.`}
                        </span>
                        <span className="flex-1 text-sm font-medium truncate">
                          {member.name}{isMe && <span className="text-purple-300 text-xs ml-1">(you)</span>}
                        </span>
                        <span className="text-sm font-bold">{member.score}</span>
                      </div>
                      <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden ml-7">
                        <div
                          className="h-full bg-purple-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-white/30 text-xs mt-4 text-center">Updates after each answer</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
