"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState({ theories: [], exams: [] });
  const [activeTab, setActiveTab] = useState("theory");

  useEffect(() => {
    // Tự động xóa cache (Cache buster) để luôn lấy dữ liệu mới nhất
    fetch(`/exam_db.json?v=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Nền Tảng Ôn Tập Trực Tuyến</h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 space-x-4">
          <button 
            onClick={() => setActiveTab("theory")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === "theory" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
          >
            Sổ tay Lý thuyết
          </button>
          <button 
            onClick={() => setActiveTab("exam")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === "exam" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
          >
            Luyện Thi & Ôn Tập
          </button>
        </div>

        {/* Nội dung Tab */}
        {activeTab === "theory" && (
          <div className="grid gap-6">
            {data.theories.map((th: any) => (
              <div key={th.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{th.chapter}</h2>
                <div className="prose prose-blue max-w-none whitespace-pre-line text-gray-700">
                  {th.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "exam" && (
          <div>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              <p className="font-bold">Lưu ý trước khi thi:</p>
              <p className="text-sm">Chuẩn bị sẵn giấy nháp và máy tính cầm tay. Bài làm sẽ tự động nộp khi hết thời gian.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.exams.map((exam: any) => (
                <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{exam.chapter}</span>
                    <h3 className="text-xl font-bold mt-4 mb-2">{exam.title}</h3>
                    <p className="text-gray-500 text-sm">Thời gian: {exam.time / 60} phút</p>
                    <p className="text-gray-500 text-sm">Số câu: {exam.questions.length} câu</p>
                  </div>
                  <Link href={`/exam/${exam.id}`}>
                    <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Bắt đầu làm bài
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}