"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ExamPage() {
  const params = useParams();
  const id = params?.id as string; // ← fix: cast rõ ràng thay vì dùng trực tiếp
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null); // ← thêm state lỗi
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!id) return; // ← guard: chờ id có giá trị mới fetch
    
    fetch(`/exam_db.json?v=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Không tìm thấy file: HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const foundExam = data.exams.find((e: any) => e.id === id);
        if (foundExam) {
          setExam(foundExam);
        } else {
          console.warn("Không tìm thấy exam id:", id, "| Các id hiện có:", data.exams.map((e:any) => e.id));
          setError(`Không tìm thấy đề thi với id: "${id}"`);
        }
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setError(err.message);
      });
  }, [id]); // ← bỏ router ra khỏi dependency

  // Màn hình lỗi (thay vì treo mãi)
  if (error) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-red-500 font-medium">{error}</p>
      <Link href="/" className="text-indigo-600 text-sm underline">← Quay về trang chủ</Link>
    </div>
  );

  if (!exam) return (
    <div className="flex h-screen items-center justify-center text-gray-500 font-medium">
      Đang tải dữ liệu đề thi...
    </div>
  );

  const currentQuestion = exam.questions[currentQIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQIndex]: optionIndex });
  };

  const handleSubmit = () => {
    if (window.confirm("Bạn có chắc chắn muốn nộp bài không?")) {
      let correctCount = 0;
      exam.questions.forEach((q: any, index: number) => {
        if (selectedAnswers[index] === q.correctIndex) correctCount++;
      });
      setScore(correctCount);
      setIsSubmitted(true);
      setCurrentQIndex(0);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-sm md:text-base">{exam.title}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{exam.chapter}</p>
          </div>
        </div>
        <div>
          {!isSubmitted ? (
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
              Nộp bài ngay
            </button>
          ) : (
            <div className="px-5 py-2 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Hoàn thành: {score}/{exam.questions.length}
            </div>
          )}
        </div>
      </header>

      {!isSubmitted && (
        <div className="w-full bg-gray-200 h-1.5">
          <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${(Object.keys(selectedAnswers).length / exam.questions.length) * 100}%` }}></div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        
        <div className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto hidden md:block">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            {isSubmitted ? "Bảng kết quả" : "Danh sách câu hỏi"}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {exam.questions.map((_: any, idx: number) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              let btnClass = "w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center border transition-colors ";
              if (!isSubmitted) {
                if (idx === currentQIndex) btnClass += "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold";
                else if (isAnswered) btnClass += "bg-gray-100 border-gray-300 text-gray-700";
                else btnClass += "bg-white border-gray-200 text-gray-500 hover:bg-gray-50";
              } else {
                const isCorrect = selectedAnswers[idx] === exam.questions[idx].correctIndex;
                const isUnanswered = selectedAnswers[idx] === undefined;
                if (idx === currentQIndex) btnClass += "ring-2 ring-offset-2 ring-indigo-500 ";
                if (isUnanswered) btnClass += "bg-gray-100 border-gray-300 text-gray-400";
                else if (isCorrect) btnClass += "bg-green-100 border-green-500 text-green-700 font-bold";
                else btnClass += "bg-red-100 border-red-500 text-red-700 font-bold";
              }
              return (
                <button key={idx} onClick={() => setCurrentQIndex(idx)} className={btnClass}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Câu hỏi {currentQIndex + 1} / {exam.questions.length}
              </span>
              {isSubmitted && selectedAnswers[currentQIndex] === undefined && (
                <span className="text-sm font-medium text-red-500">Chưa trả lời</span>
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-8 leading-relaxed">
                {currentQuestion.text}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((opt: string, optIdx: number) => {
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  let optionClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ";
                  let icon = <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />;
                  
                  if (!isSubmitted) {
                    if (isSelected) {
                      optionClass += "border-indigo-600 bg-indigo-50 text-indigo-900 font-medium shadow-sm";
                      icon = <div className="w-5 h-5 rounded-full border-4 border-indigo-600 shrink-0 mt-0.5 bg-white" />;
                    } else {
                      optionClass += "border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50";
                    }
                  } else {
                    const isCorrectOption = optIdx === currentQuestion.correctIndex;
                    if (isCorrectOption) {
                      optionClass += "border-green-500 bg-green-50 text-green-900 font-bold";
                      icon = <svg className="w-6 h-6 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += "border-red-400 bg-red-50 text-red-800 font-medium";
                      icon = <svg className="w-6 h-6 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
                    } else {
                      optionClass += "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button key={optIdx} onClick={() => handleSelectOption(optIdx)} disabled={isSubmitted} className={optionClass}>
                      {icon}
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* EXPLAIN: chỉ hiện khi đã nộp bài VÀ câu đó có explain */}
              {isSubmitted && currentQuestion.explain && (
                <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wider">Giải thích</h4>
                  </div>
                  <p className="text-sm text-blue-900 leading-relaxed ml-7">{currentQuestion.explain}</p>
                </div>
              )}

              {/* Thông báo khi câu không có explain */}
              {isSubmitted && !currentQuestion.explain && (
                <div className="mt-8 bg-gray-50 border border-gray-200 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-400">Câu này chưa có giải thích chi tiết.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pb-10">
              <button onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0}
                className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition ${currentQIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Câu trước
              </button>
              <button onClick={() => setCurrentQIndex(Math.min(exam.questions.length - 1, currentQIndex + 1))} disabled={currentQIndex === exam.questions.length - 1}
                className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition ${currentQIndex === exam.questions.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}>
                Câu tiếp
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}