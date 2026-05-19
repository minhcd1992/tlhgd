"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState({ theories: [], exams: [] });
  const [activeTab, setActiveTab] = useState("theory");

  useEffect(() => {
    fetch(`/exam_db.json?v=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  // Phân loại đề thi
  const chapterExams = data.exams.filter((exam: any) => exam.type === "chapter");
  const finalExams = data.exams.filter((exam: any) => exam.type === "final");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4 tracking-tight">
            Tâm Lý Học Giáo Dục
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Nền tảng ôn tập hướng tới triết lý nâng sàn kiến thức, đảm bảo không người học nào bị bỏ lại phía sau.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-10 space-x-2 md:space-x-4">
          <button 
            onClick={() => setActiveTab("theory")}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === "theory" ? "bg-indigo-600 text-white scale-105" : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            📚 5 Chương Lý Thuyết
          </button>
          <button 
            onClick={() => setActiveTab("exam")}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === "exam" ? "bg-indigo-600 text-white scale-105" : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            📝 Ôn Tập & Thi Thử
          </button>
        </div>

        {/* --- PHẦN LÝ THUYẾT --- */}
        {activeTab === "theory" && (
          <div className="grid gap-8">
            {data.theories.map((th: any) => (
              <div key={th.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-100 p-6">
                  <h2 className="text-2xl font-bold text-indigo-900">{th.chapter}</h2>
                </div>
                <div className="p-6">
                  {th.sections && th.sections.length > 0 ? (
                    <div className="space-y-6">
                      {th.sections.map((sec: any, idx: number) => (
                        <div key={idx}>
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{sec.title}</h3>
                          <div className="prose prose-indigo max-w-none text-slate-600">
                            {/* Kích hoạt typography ở đây */}
                            <p>{sec.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Đang cập nhật nội dung chương này...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- PHẦN ÔN TẬP VÀ THI THỬ --- */}
        {activeTab === "exam" && (
          <div className="space-y-12">
            
            {/* Mục 1: Trắc nghiệm theo chương */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center mr-3">🔖</span>
                Trắc nghiệm theo chương
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapterExams.map((exam: any) => (
                  <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">{exam.chapter}</span>
                    <h3 className="text-lg font-bold mt-4 mb-2 text-slate-800">{exam.title}</h3>
                    <p className="text-slate-500 text-sm">Thời gian: {exam.time / 60} phút • {exam.questions.length} câu</p>
                    <Link href={`/exam/${exam.id}`}>
                      <button className="mt-6 w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                        Làm bài ngay
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Mục 2: Đề thi thử kết thúc học phần */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-red-100 text-red-700 w-10 h-10 rounded-lg flex items-center justify-center mr-3">🏆</span>
                Đề thi thử kết thúc học phần
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalExams.map((exam: any) => (
                  <div key={exam.id} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-white">
                    <span className="text-xs font-bold text-indigo-100 bg-white/20 px-3 py-1 rounded-full uppercase tracking-wide">Thi Tổng Hợp</span>
                    <h3 className="text-xl font-bold mt-4 mb-2">{exam.title}</h3>
                    <p className="text-indigo-100 text-sm mb-6">Thời gian: {exam.time / 60} phút • {exam.questions.length} câu</p>
                    <Link href={`/exam/${exam.id}`}>
                      <button className="w-full bg-white text-indigo-700 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm">
                        Bắt đầu thi thử
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}