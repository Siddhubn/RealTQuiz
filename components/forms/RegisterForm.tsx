"use client";
import {useState} from "react";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useRouter} from "next/navigation";
import {generateQuestions} from "@/lib/generateQuestions"

export default function RegisterForm() {
    const router=useRouter();
    const createUser=useMutation(api.users.createUser);
    const [name, setName]=useState("");
    const [age, setAge]=useState("");
    const [loading, setLoading]=useState(false);

    const handleStartQuiz = async() => {
        if(!name.trim()){
            alert("Enter your name");
            return;
        }
        if(!age || Number(age)<5){
            alert("Enter valid age");
            return;
        }
        try {
            setLoading(true);
            const userId = await createUser({
                name,
                age: Number(age),
            });

            const questions = await generateQuestions(
                Number(age)
            );

            await generateQuiz({
                userId,
                questions,
            });

            localStorage.setItem("quizUserId",userId);

            router.push(`/quiz/${userId}`);
        }
        catch (error){
            console.error(error);
            alert("Something went wrong");
        }
        finally{
            setLoading(false);
        }
    };

    const generateQuiz=useMutation(api.questions.generateQuizQuestions);

    return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Realtime Quiz App
      </h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/20 outline-none"
        />

        <input
          type="number"
          placeholder="Enter Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/20 outline-none"
        />

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold"
        >
          {loading ? "Creating Quiz..." : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
