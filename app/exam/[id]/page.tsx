"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params; // Lấy ID từ URL

  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States cho bài làm
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch(`/exam_db.json?v=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => {
        if (id === "random") {
          // --- LOGIC TẠO ĐỀ THI NGẪU NHIÊN ---
          let allQuestions: any[] = [];
          
          // Gom câu hỏi từ tất cả các chương
          data.exams.forEach((exam: any) => {
            if (exam.type === "chapter") {
              allQuestions = [...allQuestions, ...exam.questions];
            }
          });

          // Trộn ngẫu nhiên mảng câu hỏi (Thuật toán Fisher-Yates)
          for (let i = allQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
          }

          // Cắt lấy 40 câu
          const selectedQuestions = allQuestions.slice(0, 40);
          
          setExamData({
            id: "random",
            title: "Đề Thi Thử Tổng Hợp Ngẫu Nhiên",
            chapter: "Thi Thử",
            time: 3600, // 60 phút
            questions: selectedQuestions,
          });
        } else {
          // --- LOGIC LẤY ĐỀ THI CỐ ĐỊNH THEO ID ---
          const foundExam = data.exams.find((e: any) => e.id === id || e.id === Number(id));
          setExamData(foundExam);
        }
        setLoading(false);
      });
  }, [id]);

  // Xử lý khi chọn đáp án
  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return; // Đã nộp bài thì khóa, không cho chọn lại
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Xử lý khi nộp bài
  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < examData.questions.length) {
      const confirm = window.confirm("Bạn chưa làm hết các câu hỏi. Vẫn muốn nộp bài?");
      if (!confirm) return;
    }

    // Tính điểm
    let correctCount = 0;
    examData.questions.forEach((q: any) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu xem điểm
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500 mt-20">Đang tải đề thi...</div>;
  if (!examData) return <div className="p-10 text-center text-red-500 mt-20">Không tìm thấy đề thi!</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto">
        
        {/* THANH ĐIỀU HƯỚNG & THÔNG TIN ĐỀ THI */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại trang chủ
          </Link>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-200 px-3 py-1 rounded-full">
            {examData.chapter}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{examData.title}</h1>
          <p className="text-gray-500">Số lượng: <span className="font-bold text-indigo-600">{examData.questions.length} câu</span> | Thời gian: <span className="font-bold text-indigo-600">{examData.time / 60} phút</span></p>
          
          {/* HIỂN THỊ ĐIỂM NẾU ĐÃ NỘP BÀI */}
          {isSubmitted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h2 className="text-lg font-bold text-green-800">Kết quả bài làm</h2>
              <p className="text-3xl font-black text-green-600 mt-1">{score} / {examData.questions.length}</p>
              <p className="text-sm text-green-700 mt-2">Bạn có thể lướt xuống để xem chi tiết đáp án đúng sai và phần giải thích.</p>
            </div>
          )}
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-8">
          {examData.questions.map((q: any, index: number) => {
            const userAnswer = userAnswers[q.id];

            return (
              <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  <span className="text-indigo-600 mr-2">Câu {index + 1}:</span> 
                  {q.text}
                </h3>

                <div className="space-y-3">
                  {q.options.map((opt: string, optIndex: number) => {
                    // LOGIC TÔ MÀU ĐÁP ÁN ĐÚNG SAI
                    let optionStyle = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm md:text-base ";
                    
                    if (isSubmitted) {
                      if (optIndex === q.correctIndex) {
                        // Màu xanh cho đáp án đúng
                        optionStyle += "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm";
                      } else if (optIndex === userAnswer && userAnswer !== q.correctIndex) {
                        // Màu đỏ gạch ngang cho đáp án sai mà học sinh đã chọn
                        optionStyle += "bg-red-50 border-red-300 text-red-500 line-through opacity-80";
                      } else {
                        // Làm mờ các phương án sai không được chọn
                        optionStyle += "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                      }
                    } else {
                      // Đang làm bài
                      optionStyle += userAnswer === optIndex 
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold" 
                        : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700";
                    }

                    return (
                      <button 
                        key={optIndex} 
                        className={optionStyle}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        disabled={isSubmitted}
                      >
                        <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + optIndex)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* KHUNG GIẢI THÍCH CHỈ HIỆN KHI ĐÃ NỘP BÀI */}
                {isSubmitted && q.explain && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-gray-700 animate-fade-in">
                    <p className="font-bold text-amber-800 mb-1 flex items-center">
                      <span className="mr-1.5">💡</span> Lời giải chi tiết:
                    </p>
                    <p className="leading-relaxed">{q.explain}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* NÚT THAO TÁC Ở CUỐI TRANG */}
        <div className="mt-10 mb-20 flex justify-center">
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              className="bg-[#c83021] hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 text-lg w-full md:w-auto"
            >
              Nộp bài thi
            </button>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
               <button 
                onClick={() => { 
                  setIsSubmitted(false); 
                  setUserAnswers({}); 
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow transition-transform active:scale-95"
              >
                Làm lại đề này
              </button>
              <Link href="/">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-xl font-bold shadow transition-transform active:scale-95 w-full">
                  Về trang chủ
                </button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}