import React, { useState } from 'react';
import {
  FolderLock,
  Download,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  FileDown
} from 'lucide-react';
import { User } from '../../types';

interface DocumentVaultModuleProps {
  user: User;
}

interface VaultItem {
  id: string;
  category: 'official' | 'marksheet' | 'assignment' | 'notes';
  title: string;
  description: string;
  fileSize: string;
  issuedDate: string;
  verifiedBy: string;
  format: 'PDF' | 'ZIP' | 'DOCX';
}

export const DocumentVaultModule: React.FC<DocumentVaultModuleProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [downloadSuccessItem, setDownloadSuccessItem] = useState<string | null>(null);

  const vaultItems: VaultItem[] = [
    {
      id: 'doc_1',
      category: 'official',
      title: 'Bonafide Student Certificate',
      description: 'Official Lokbharti University bonafide verification certificate for passport & bank applications.',
      fileSize: '1.2 MB',
      issuedDate: '2026-01-10',
      verifiedBy: 'Registrar Office',
      format: 'PDF',
    },
    {
      id: 'doc_2',
      category: 'marksheet',
      title: 'Semester 3 Grade & SGPA Marksheet',
      description: 'Authenticated Grade Card for Fall 2025 examinations with QR digital signature.',
      fileSize: '2.4 MB',
      issuedDate: '2026-01-15',
      verifiedBy: 'Controller of Examinations',
      format: 'PDF',
    },
    {
      id: 'doc_3',
      category: 'official',
      title: 'University Fee Payment Receipt 2025-26',
      description: 'Receipt for Tuition, Library, ERP, and Laboratory fees payment.',
      fileSize: '850 KB',
      issuedDate: '2025-08-01',
      verifiedBy: 'Accounts Department',
      format: 'PDF',
    },
    {
      id: 'doc_4',
      category: 'notes',
      title: 'Database Systems Complete Lecture Notes (Modules 1-5)',
      description: 'Comprehensive SQL, Normalization, ER Modeling and Query Optimization study bundle.',
      fileSize: '14.5 MB',
      issuedDate: '2026-02-12',
      verifiedBy: 'Prof. Rajesh Mehta',
      format: 'PDF',
    },
    {
      id: 'doc_5',
      category: 'assignment',
      title: 'Operating Systems Virtual Memory Lab Solution',
      description: 'Submitted assignment solution with instructor evaluation and grade feedback.',
      fileSize: '3.1 MB',
      issuedDate: '2026-03-02',
      verifiedBy: 'Department of Computer Science',
      format: 'PDF',
    },
    {
      id: 'doc_6',
      category: 'official',
      title: 'University Admission & Honor Code Letter',
      description: 'Signed admission letter confirming enrollment in B.Tech CSE.',
      fileSize: '1.8 MB',
      issuedDate: '2024-07-20',
      verifiedBy: 'Dean of Academics',
      format: 'PDF',
    },
  ];

  const filteredItems = vaultItems.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (doc: VaultItem) => {
    setDownloadSuccessItem(doc.title);
    setTimeout(() => setDownloadSuccessItem(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <FolderLock className="w-3.5 h-3.5 text-teal-400" />
            <span>Document Vault & Download Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Encrypted Academic Document Storage
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Access verified marksheets, bonafide certificates, official receipts, and course notes anytime.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shrink-0">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Vault Protection</div>
            <div className="text-xs font-extrabold text-white">256-Bit SSL Encrypted</div>
          </div>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccessItem && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Started download: <strong>{downloadSuccessItem}</strong></span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-700 px-2 py-1 rounded">VERIFIED_HASH_OK</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificates, marksheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'official', 'marksheet', 'notes', 'assignment'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Documents' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{doc.format} • {doc.fileSize}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {doc.description}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Verified: <strong>{doc.verifiedBy}</strong></span>
                <span>{doc.issuedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Previewing official document: ${doc.title}`)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
