"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState({ theories: [], exams: [] });
  const [activeTab, setActiveTab] = useState("theory"); 
  const [selectedTheory, setSelectedTheory] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`/exam_db.json?v=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  const chapterExams = data.exams.filter((exam: any) => exam.type === "chapter");
  const finalExams = data.exams.filter((exam: any) => exam.type === "final");

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedTheory(null);
    setIsMobileMenuOpen(false); 
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`w-64 bg-white border-r border-gray-100 z-50 flex-col h-full transition-transform duration-300 fixed md:relative ${isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0 md:flex"}`}>
        <div className="absolute top-2 right-2 md:hidden">
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-[15px] tracking-tight">Tâm Lý Học GD</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Hệ thống ôn tập</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-1">
          <p className="px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Học tập</p>
          <button onClick={() => switchTab('theory')} className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${activeTab === 'theory' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <span>Kiến thức trọng tâm</span>
          </button>
          <button onClick={() => switchTab('chapter-quiz')} className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${activeTab === 'chapter-quiz' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <span>Trắc nghiệm Chương</span>
          </button>

          <p className="px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Kiểm tra</p>
          <button onClick={() => switchTab('final-exam')} className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${activeTab === 'final-exam' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6" /></svg>
            <span>Thi thử Cuối kỳ</span>
          </button>
        </nav>
      </aside>

      {/* BACKGROUND OVERLAY FOR MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-6 md:px-8 z-10 sticky top-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 p-2 -ml-2 mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 className="font-medium text-gray-800 text-sm">
            {activeTab === 'theory' && (selectedTheory ? 'Chi tiết Lý thuyết' : 'Tổng quan kiến thức')}
            {activeTab === 'chapter-quiz' && 'Luyện tập theo chương'}
            {activeTab === 'final-exam' && 'Đề thi cuối học phần'}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            
            {/* --- TAB LÝ THUYẾT --- */}
            {activeTab === "theory" && !selectedTheory && (
              <div className="animate-fade-in">
                <div className="bg-[#c83021] rounded-2xl p-8 md:p-10 text-white shadow-sm mb-10 relative overflow-hidden">
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2 opacity-10">
                    <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/></svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-3 relative z-10">Xin chào!</h2>
                  <p className="text-white/90 max-w-xl text-sm leading-relaxed relative z-10">
                    Học phần Tâm Lý Học Giáo Dục gồm 5 chương lý thuyết cốt lõi. Hãy nắm chắc các nguyên lý để vận dụng tốt vào đề thi và thực tiễn sư phạm nhé.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.theories.map((th: any, index: number) => (
                    <div key={th.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 hover:shadow-md transition flex flex-col h-full">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-5">
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <h3 className="font-bold text-base text-gray-900 mb-2">{th.chapter}</h3>
                      <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">
                        Nhấn vào chi tiết để xem đầy đủ nội dung lý thuyết trọng tâm.
                      </p>
                      <button onClick={() => setSelectedTheory(th)} className="text-indigo-600 font-medium text-sm hover:text-indigo-800 flex items-center w-fit transition-colors">
                        Chi tiết <span className="ml-1.5 font-bold">→</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- CHI TIẾT LÝ THUYẾT --- */}
            {activeTab === "theory" && selectedTheory && (
              <div className="animate-fade-in">
                <button onClick={() => setSelectedTheory(null)} className="mb-6 text-gray-500 hover:text-indigo-600 text-sm font-medium flex items-center transition">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Quay lại danh sách
                </button>
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-10 border-b border-gray-100 pb-6 uppercase">
                    {selectedTheory.chapter}
                  </h2>
                  <div className="space-y-12">
                    {selectedTheory.sections && selectedTheory.sections.map((sec: any, idx: number) => (
                      <section key={idx} className="mb-8">
                        <h3 className="flex items-center text-xl font-bold text-red-700 mb-5">
                          <span className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shrink-0">
                            {idx + 1}
                          </span>
                          {sec.title}
                        </h3>
                        <div 
                          className="text-gray-700 leading-relaxed" 
                          dangerouslySetInnerHTML={{ __html: sec.content }} 
                        />
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB TRẮC NGHIỆM THEO CHƯƠNG --- */}
            {activeTab === "chapter-quiz" && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Trắc nghiệm theo chương</h3>
                  <p className="text-gray-500 text-sm">Hệ thống câu hỏi giúp củng cố kiến thức từng phần.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chapterExams.map((exam: any) => (
                    <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 flex flex-col h-full">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-sm uppercase tracking-wide w-fit">{exam.chapter}</span>
                      <h3 className="font-bold text-base text-gray-900 mt-4 mb-2">{exam.title}</h3>
                      <p className="text-gray-500 text-sm mb-6 flex-1">Thời gian: {exam.time / 60} phút • {exam.questions.length} câu</p>
                      <Link href={`/exam/${exam.id}`} className="mt-auto">
                        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-1.5 border border-gray-200">
                          Ôn tập ngay <span>→</span>
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB THI THỬ CUỐI KỲ --- */}
            {activeTab === "final-exam" && (
              <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">ĐỀ THI KẾT THÚC HỌC PHẦN</h2>
                  <p className="text-gray-500 text-sm">Môn: Tâm Lý Học Giáo Dục</p>
                </div>
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Nội dung</th>
                        <th className="px-6 py-4 font-medium text-center">Số câu</th>
                        <th className="px-6 py-4 font-medium text-center">Thời gian</th>
                        <th className="px-6 py-4 font-medium text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* HIỂN THỊ CÁC ĐỀ CỐ ĐỊNH TRONG JSON (NẾU CÓ) */}
                      {finalExams.map((exam: any) => (
                        <tr key={exam.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{exam.title}</td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">{exam.questions.length} Câu</td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">{exam.time / 60} Phút</td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/exam/${exam.id}`}>
                              <button className="bg-[#c83021] hover:bg-red-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors shadow-sm">
                                Bắt đầu thi
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      
                      {/* DÒNG TẠO ĐỀ THI NGẪU NHIÊN 40 CÂU */}
                      <tr className="hover:bg-indigo-50/50 bg-indigo-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-indigo-700 block">Đề Thi Thử Ngẫu Nhiên</span>
                          <span className="text-xs text-indigo-500">Hệ thống trộn câu hỏi từ tất cả các chương</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">45 Câu</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">40 Phút</td>
                        <td className="px-6 py-4 text-center">
                          {/* Đường link trỏ tới ID đặc biệt là 'random' */}
                          <Link href={`/exam/random`}>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors shadow-sm">
                              Tạo đề & Thi ngay
                            </button>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}