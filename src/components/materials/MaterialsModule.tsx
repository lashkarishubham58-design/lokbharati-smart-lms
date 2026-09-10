import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Search,
  Plus,
  X,
  Upload,
  Trash2,
  CheckCircle2,
  Building2,
  GraduationCap
} from 'lucide-react';
import { User, StudyMaterial } from '../../types';

interface MaterialsModuleProps {
  user: User;
  materials: StudyMaterial[];
  onAddMaterial?: (material: StudyMaterial) => void;
  onDeleteMaterial?: (id: string) => void;
}

export const MaterialsModule: React.FC<MaterialsModuleProps> = ({
  user,
  materials = [],
  onAddMaterial,
  onDeleteMaterial,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'pdf' | 'ppt' | 'video' | 'link' | 'doc'>('pdf');
  const [subjectName, setSubjectName] = useState('Software Engineering');
  const [departmentId, setDepartmentId] = useState(user.departmentId || 'dept_it');
  const [semester, setSemester] = useState<number>(3);
  const [fileUrl, setFileUrl] = useState('#');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canUpload = user.role === 'teacher' || user.role === 'hod' || user.role === 'admin';

  const filtered = (materials || []).filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (mType: string) => {
    switch (mType) {
      case 'pdf':
      case 'doc':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'ppt':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      default:
        return <LinkIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      // Auto infer file type
      if (file.name.endsWith('.pdf')) setType('pdf');
      else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) setType('ppt');
      else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) setType('doc');
      else if (file.name.endsWith('.mp4') || file.name.endsWith('.mkv')) setType('video');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectName.trim()) return;

    const newMat: StudyMaterial = {
      id: `mat_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      type,
      fileUrl: fileUrl || '#',
      fileName: fileName.trim() || `${title.replace(/\s+/g, '_')}.${type === 'ppt' ? 'pptx' : type}`,
      subjectId: `sub_${Date.now()}`,
      subjectName: subjectName.trim(),
      departmentId: departmentId || 'dept_it',
      semester: Number(semester) || 1,
      uploadedBy: user.id,
      uploadedByName: user.name,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      downloadCount: 0,
    };

    if (onAddMaterial) {
      onAddMaterial(newMat);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setFileName('');
    setSelectedFile(null);
    setIsUploadOpen(false);

    setToastMessage('Study material uploaded successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Course Study Materials & Digital Library
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lecture notes, slides, recorded sessions, and digital reference vault
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials or subjects..."
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none w-full sm:w-52 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="ppt">PPT Presentations</option>
            <option value="doc">Word Files</option>
            <option value="video">Video Lectures</option>
            <option value="link">Web Links</option>
          </select>

          {canUpload && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Material</span>
            </button>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No study materials found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || filterType !== 'all'
              ? 'Try adjusting your search query or file type filter.'
              : 'There are currently no uploaded study materials available.'}
          </p>
          {canUpload && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" /> Upload First Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800/60 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(mat.type)}
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {mat.subjectName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{mat.downloadCount} downloads</span>
                    {onDeleteMaterial && (user.role === 'admin' || user.role === 'hod' || mat.uploadedBy === user.id) && (
                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {mat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    By {mat.uploadedByName}
                  </span>
                  <span className="text-[9px] text-slate-400">{mat.uploadedAt}</span>
                </div>

                <a
                  href={mat.fileUrl || '#'}
                  download={mat.fileName || 'study_material'}
                  onClick={() => {
                    mat.downloadCount = (mat.downloadCount || 0) + 1;
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal for Faculty / Admins */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload Study Material
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Software Architecture Patterns & UML Diagrams"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Software Engineering"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Format / Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PPT Presentation</option>
                    <option value="doc">Word Document</option>
                    <option value="video">Video Recording</option>
                    <option value="link">Web Reference / Link</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="dept_it">Information Technology (IT)</option>
                    <option value="dept_brs_agronomy">Agronomy</option>
                    <option value="dept_agronomy">Agronomy</option>
                    <option value="dept_horticulture">Horticulture</option>
                    <option value="dept_bvoc_nf">Natural Farming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Topics Covered
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief overview of key lecture notes, chapter references, or slides..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload File or External Link
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-6 h-6 text-purple-500" />
                    {selectedFile ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Click to select or drag and drop document
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Supports PDF, PPTX, DOCX, MP4 (Max 50MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Or URL:</span>
                  <input
                    type="text"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="flex-1 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
