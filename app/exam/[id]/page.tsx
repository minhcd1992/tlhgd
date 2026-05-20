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
        // --- LOGIC TRỘN ĐỀ NGẪU NHIÊN ---
        if (params.id === "random") {
          let allQuestions: any[] = [];
          
          data.exams.forEach((e: any) => {
            if (e.type === "chapter") {
              allQuestions = [...allQuestions, ...e.questions];
            }
          });

          // Shuffle - Fisher-Yates
          for (let i = allQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
          }

          const randomQuestions = allQuestions.slice(0, 40);
          
          const randomExam = {
            id: "random",
            title: "Đề Thi Thử Tổng Hợp Ngẫu Nhiên",
            chapter: "Kiểm tra kiến thức",
            time: 3600, // 60 phút
            questions: randomQuestions
          };
          
          setExam(randomExam);
          setTimeLeft(randomExam.time);
        } 
        // --- LOGIC LẤY ĐỀ CỐ ĐỊNH ---
        else {
          const currentExam = data.exams.find((e: any) => e.id === params.id || e.id === Number(params.id));
          if (currentExam) {
            setExam(currentExam);
            setTimeLeft(currentExam.time);
          }
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
    const element = document.getElementById(`q-${index}`);
    if (element) {
      // Trừ đi chiều cao của thanh header (nếu có) để tránh bị che lấp
      const yOffset = -50; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
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

  if (!exam) return <div className="text-center mt-20 text-gray-500 font-medium">Đang tải dữ liệu...</div>;

  const progressPercent = Math.round((Object.keys(answers).length / exam.questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Main Content (Questions) */}
      <div className="flex-1 p-6 md:p-10 md:mr-80 relative">
        <button onClick={() => router.push("/")} className="text-blue-600 mb-6 font-semibold hover:underline flex items-center transition-colors">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Quay lại danh sách
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
            <p className="mt-6 text-gray-500 italic bg-gray-50 p-3 rounded-lg inline-block">Chế độ Review: Kéo xuống dưới để xem chi tiết đáp án và lời giải.</p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{exam.title}</h1>
            <p className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mt-3">{exam.chapter}</p>
          </div>
        )}

        <div className="space-y-8 pb-32 md:pb-10">
          {exam.questions.map((q: any, qIndex: number) => (
            <div key={q.id} id={`q-${qIndex}`} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <h3 className="font-bold text-lg mb-5 text-gray-800 leading-relaxed">
                <span className="text-blue-600 mr-1.5">Câu {qIndex + 1}:</span> 
                {q.text}
              </h3>
              
              <div className="space-y-3">
                {q.options.map((opt: string, optIndex: number) => {
                  const isSelected = answers[qIndex] === optIndex;
                  const isCorrectAnswer = q.correctIndex === optIndex;
                  let bgClass = "bg-white hover:bg-blue-50/50 border-gray-200 hover:border-blue-300";
                  
                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      bgClass = "bg-green-50 border-green-500 text-green-800 font-semibold shadow-sm";
                    } else if (isSelected && !isCorrectAnswer) {
                      bgClass = "bg-red-50 border-red-300 text-red-600 line-through opacity-90";
                    } else {
                      bgClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                    }
                  } else if (isSelected) {
                    bgClass = "bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm";
                  }

                  return (
                    <label key={optIndex} className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${bgClass}`}>
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={isSelected}
                        onChange={() => handleSelect(qIndex, optIndex)}
                        disabled={isSubmitted}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
                      />
                      <span className="ml-3 text-[15px] leading-relaxed">
                        <span className="font-bold mr-1">{String.fromCharCode(65 + optIndex)}.</span>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* KHỐI HIỂN THỊ LỜI GIẢI (CHỈ XUẤT HIỆN KHI ĐÃ NỘP BÀI) */}
              {isSubmitted && q.explain && (
                <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl text-[15px] text-gray-800 animate-fade-in shadow-inner">
                  <p className="font-bold text-amber-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                    Giải thích chi tiết:
                  </p>
                  <p className="leading-relaxed whitespace-pre-line">{q.explain}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Sidebar */}
      <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-200 p-6 fixed bottom-0 md:h-screen md:sticky md:top-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] md:shadow-none z-10 flex flex-col transition-all">
        {!isSubmitted && (
          <div className={`text-4xl font-mono font-black text-center mb-6 transition-colors ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-800"}`}>
            {formatTime(timeLeft)}
          </div>
        )}

        <div className="mb-6 hidden md:block">
          <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
            <span>Tiến độ làm bài</span>
            <span className="text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Khung số câu hỏi - Cho phép cuộn */}
        <div className="flex-1 overflow-y-auto mb-4 md:mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((_: any, i: number) => {
              let btnColor = "bg-gray-100 text-gray-600 hover:bg-gray-200";
              if (isSubmitted) {
                if (answers[i] === exam.questions[i].correctIndex) btnColor = "bg-green-500 text-white shadow-md shadow-green-200";
                else if (answers[i] !== undefined) btnColor = "bg-red-500 text-white shadow-md shadow-red-200";
                else btnColor = "bg-gray-300 text-white opacity-50";
              } else if (answers[i] !== undefined) {
                btnColor = "bg-blue-500 text-white shadow-md shadow-blue-200";
              }
              
              return (
                <button
                  key={i}
                  onClick={() => scrollToQuestion(i)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${btnColor}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-auto">
          {!isSubmitted ? (
            <button 
              onClick={checkBeforeSubmit} 
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              NỘP BÀI
            </button>
          ) : (
             <div className="space-y-3">
                {params.id === "random" && (
                   <button 
                     onClick={() => window.location.reload()} 
                     className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
                   >
                     Tạo đề ngẫu nhiên mới
                   </button>
                )}
                <button 
                  onClick={() => router.push("/")} 
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all border border-gray-200 active:scale-[0.98]"
                >
                  Về trang chủ
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Modal Cảnh báo Nộp bài */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa hoàn thành!</h3>
            <p className="text-gray-600 mb-8 text-base">
              Bạn còn <span className="text-red-600 font-bold text-xl px-1">{exam.questions.length - Object.keys(answers).length}</span> câu chưa làm.<br/>Bạn có chắc chắn muốn nộp bài?
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Làm tiếp
              </button>
              <button onClick={submitExam} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                Nộp luôn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}