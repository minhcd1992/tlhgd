"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, correct: 0, wrong: 0, skipped: 0 });

  useEffect(() => {
    fetch(`/exam_db.json?v=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => {
        const currentExam = data.exams.find((e: any) => e.id === params.id);
        if (currentExam) {
          setExam(currentExam);
          setTimeLeft(currentExam.time);
        }
      });
  }, [params.id]);

  // Xử lý đồng hồ đếm ngược
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && exam && !isSubmitted) {
      submitExam(); // Tự động nộp khi hết giờ
    }
  }, [timeLeft, isSubmitted, exam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const scrollToQuestion = (index: number) => {
    document.getElementById(`q-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const checkBeforeSubmit = () => {
    const unanswered = exam.questions.length - Object.keys(answers).length;
    if (unanswered > 0) setShowModal(true);
    else submitExam();
  };

  const submitExam = () => {
    setShowModal(false);
    setIsSubmitted(true);
    let correct = 0;
    exam.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const total = exam.questions.length;
    const answered = Object.keys(answers).length;
    setScoreData({
      correct,
      wrong: answered - correct,
      skipped: total - answered,
      score: (correct / total) * 10,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!exam) return <div className="text-center mt-20">Đang tải dữ liệu...</div>;

  const progressPercent = Math.round((Object.keys(answers).length / exam.questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Main Content (Questions) */}
      <div className="flex-1 p-6 md:p-10 md:mr-80">
        <button onClick={() => router.push("/")} className="text-blue-500 mb-6 font-semibold hover:underline">
          &larr; Quay lại danh sách
        </button>
        
        {isSubmitted ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">Kết quả bài làm</h2>
            <div className="text-7xl font-black text-blue-600 my-6">{scoreData.score.toFixed(2)}</div>
            <div className="flex justify-center space-x-6 text-lg font-medium">
              <span className="text-green-600">Đúng: {scoreData.correct}</span>
              <span className="text-red-500">Sai: {scoreData.wrong}</span>
              <span className="text-gray-500">Bỏ trống: {scoreData.skipped}</span>
            </div>
            <p className="mt-6 text-gray-500 italic">Chế độ Review: Xem lại chi tiết đáp án bên dưới.</p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{exam.title}</h1>
            <p className="text-gray-500 mt-2">{exam.chapter}</p>
          </div>
        )}

        <div className="space-y-8">
          {exam.questions.map((q: any, qIndex: number) => (
            <div key={q.id} id={`q-${qIndex}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Câu {qIndex + 1}: {q.text}</h3>
              <div className="space-y-3">
                {q.options.map((opt: string, optIndex: number) => {
                  const isSelected = answers[qIndex] === optIndex;
                  const isCorrectAnswer = q.correctIndex === optIndex;
                  let bgClass = "bg-gray-50 hover:bg-blue-50 border-gray-200";
                  
                  if (isSubmitted) {
                    if (isCorrectAnswer) bgClass = "bg-green-100 border-green-500 text-green-800";
                    else if (isSelected && !isCorrectAnswer) bgClass = "bg-red-100 border-red-500 text-red-800";
                    else bgClass = "bg-gray-50 opacity-50";
                  } else if (isSelected) {
                    bgClass = "bg-blue-100 border-blue-500 text-blue-800";
                  }

                  return (
                    <label key={optIndex} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${bgClass}`}>
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={isSelected}
                        onChange={() => handleSelect(qIndex, optIndex)}
                        disabled={isSubmitted}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 font-medium">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Sidebar */}
      <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 fixed bottom-0 md:h-screen md:sticky md:top-0 shadow-lg md:shadow-none z-10 flex flex-col">
        {!isSubmitted && (
          <div className={`text-4xl font-mono font-black text-center mb-6 transition-colors ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-800"}`}>
            {formatTime(timeLeft)}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Tiến độ</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((_: any, i: number) => {
              let btnColor = "bg-gray-100 text-gray-600 hover:bg-gray-200";
              if (isSubmitted) {
                if (answers[i] === exam.questions[i].correctIndex) btnColor = "bg-green-500 text-white";
                else if (answers[i] !== undefined) btnColor = "bg-red-500 text-white";
                else btnColor = "bg-gray-300 text-white";
              } else if (answers[i] !== undefined) {
                btnColor = "bg-blue-500 text-white";
              }
              return (
                <button
                  key={i}
                  onClick={() => scrollToQuestion(i)}
                  className={`w-10 h-10 rounded font-bold transition-colors ${btnColor}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {!isSubmitted && (
          <button onClick={checkBeforeSubmit} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg">
            NỘP BÀI
          </button>
        )}
      </div>

      {/* Modal Cảnh báo Nộp bài */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Cảnh báo!</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Bạn còn <span className="text-red-600 font-bold text-2xl">{exam.questions.length - Object.keys(answers).length}</span> câu chưa làm.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300">
                Làm tiếp
              </button>
              <button onClick={submitExam} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">
                Nộp luôn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}