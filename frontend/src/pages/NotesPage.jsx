import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import icons from '../components/icons';
import { useSubjects } from '../hooks/useSubjects';
import { useSubjectFolders, useCreateFolder, useDeleteFolder } from '../hooks/useFolders';
import { useNotes, useUploadNote, useDeleteNote } from '../hooks/useNotes';

const {
  Folder,
  FolderPlus,
  FileText,
  Upload,
  Download,
  Trash,
  ExternalLink,
  Plus,
  X,
  Search,
  Book,
  Paperclip,
} = icons;

export default function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');
  const initialFolderId = searchParams.get('folderId');

  // Subjects
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    initialSubjectId ? parseInt(initialSubjectId, 10) : null
  );

  // Set default subject if none selected
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      const defaultId = initialSubjectId ? parseInt(initialSubjectId, 10) : subjects[0].id;
      setSelectedSubjectId(defaultId);
    }
  }, [subjects, selectedSubjectId, initialSubjectId]);

  // Active Subject
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Topic Folders
  const { data: folders = [], isLoading: loadingFolders } = useSubjectFolders(selectedSubjectId);
  const [selectedFolderId, setSelectedFolderId] = useState(
    initialFolderId ? parseInt(initialFolderId, 10) : null
  );

  // Reset or sync folder filter when subject changes
  const handleSelectSubject = (id) => {
    setSelectedSubjectId(id);
    setSelectedFolderId(null);
    setSearchParams({ subjectId: id });
  };

  const handleSelectFolder = (folderId) => {
    setSelectedFolderId(folderId);
    if (folderId) {
      setSearchParams({ subjectId: selectedSubjectId, folderId });
    } else {
      setSearchParams({ subjectId: selectedSubjectId });
    }
  };

  // Notes
  const { data: notes = [], isLoading: loadingNotes } = useNotes(selectedSubjectId, selectedFolderId);
  const createFolderMutation = useCreateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const uploadNoteMutation = useUploadNote();
  const deleteNoteMutation = useDeleteNote();

  // Modals state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const [uploadForm, setUploadForm] = useState({
    title: '',
    folderId: '',
    file: null,
    content: '',
  });

  const folderColors = [
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#06b6d4',
    '#ef4444',
  ];

  // Create folder handler
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolder.name.trim() || !selectedSubjectId) return;

    createFolderMutation.mutate(
      {
        subjectId: selectedSubjectId,
        ...newFolder,
      },
      {
        onSuccess: (created) => {
          setShowFolderModal(false);
          setNewFolder({ name: '', description: '', color: '#3b82f6' });
          if (created?.id) setSelectedFolderId(created.id);
        },
      }
    );
  };

  // Delete folder handler
  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this folder and its notes?')) return;
    deleteFolderMutation.mutate(
      { id: folderId, subjectId: selectedSubjectId },
      {
        onSuccess: () => {
          if (selectedFolderId === folderId) setSelectedFolderId(null);
        },
      }
    );
  };

  // Upload note handler
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (isUploading || uploadNoteMutation.isPending) return;

    if (!uploadForm.file && !uploadForm.title.trim() && !uploadForm.content.trim()) {
      alert('Please choose a file or enter a note title.');
      return;
    }

    if (!selectedSubjectId) {
      alert('Please select or create a subject first before uploading.');
      return;
    }

    setIsUploading(true);
    uploadNoteMutation.mutate(
      {
        file: uploadForm.file,
        title: uploadForm.title.trim(),
        subjectId: selectedSubjectId,
        folderId: uploadForm.folderId || selectedFolderId || null,
        content: uploadForm.content,
      },
      {
        onSuccess: () => {
          setIsUploading(false);
          setShowUploadModal(false);
          setUploadForm({ title: '', folderId: '', file: null, content: '' });
        },
        onError: (err) => {
          setIsUploading(false);
          alert(err?.response?.data?.message || err?.message || 'Failed to upload note');
        },
      }
    );
  };

  // Delete note handler
  const handleDeleteNote = (noteId) => {
    if (!window.confirm('Delete this note and its file?')) return;
    deleteNoteMutation.mutate({ noteId, subjectId: selectedSubjectId });
  };

  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.fileName?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q)
    );
  });

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Helper for file type badge
  const getFileTypeBadge = (fileType, fileName) => {
    const ext = fileName?.split('.').pop()?.toUpperCase() || 'FILE';
    let bg = '#64748b';
    if (fileType?.includes('pdf') || ext === 'PDF') bg = '#ef4444';
    else if (fileType?.includes('image') || ['PNG', 'JPG', 'JPEG', 'WEBP'].includes(ext)) bg = '#10b981';
    else if (ext === 'DOC' || ext === 'DOCX') bg = '#2563eb';
    else if (ext === 'PPT' || ext === 'PPTX') bg = '#ea580c';
    else if (ext === 'TXT' || ext === 'MD') bg = '#6366f1';

    return (
      <span
        style={{
          background: bg,
          color: 'white',
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          letterSpacing: '0.5px',
        }}
      >
        {ext}
      </span>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Notes & Topic Folders"
          onAddClick={() => {
            setUploadForm((prev) => ({
              ...prev,
              folderId: selectedFolderId ? String(selectedFolderId) : '',
            }));
            setShowUploadModal(true);
          }}
        />

        <div className="page-content">
          {/* Header Controls */}
          <div
            className="card mb-24"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 20px',
            }}
          >
            {/* Subject Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Subject:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub.id)}
                    className="btn"
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      borderRadius: 'var(--radius-sm)',
                      background:
                        selectedSubjectId === sub.id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: selectedSubjectId === sub.id ? '#ffffff' : 'var(--text-primary)',
                      border: `1px solid ${selectedSubjectId === sub.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontWeight: selectedSubjectId === sub.id ? 600 : 500,
                      boxShadow: selectedSubjectId === sub.id ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                    }}
                  >
                    <span>{sub.icon || '📚'}</span>
                    <span>{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowFolderModal(true)}
                disabled={!selectedSubjectId}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <FolderPlus size={16} />
                <span>New Topic Folder</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setUploadForm((prev) => ({
                    ...prev,
                    folderId: selectedFolderId ? String(selectedFolderId) : '',
                  }));
                  setShowUploadModal(true);
                }}
                disabled={!selectedSubjectId}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Upload size={16} />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Topic Folders Section */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={18} color="var(--accent-primary)" />
                <span>Topic Folders in {currentSubject?.name || 'Subject'}</span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    background: 'var(--bg-secondary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
                </span>
              </h3>
            </div>

            {loadingFolders ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading folders...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '14px',
                }}
              >
                {/* "All Notes" Card */}
                <div
                  onClick={() => handleSelectFolder(null)}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${selectedFolderId === null ? 'var(--accent-primary)' : 'transparent'}`,
                    background: selectedFolderId === null ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Book size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>All Topics</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      All subject notes
                    </div>
                  </div>
                </div>

                {/* Subject Topic Folders */}
                {folders.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id)}
                      className="card"
                      style={{
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${isSelected ? folder.color || 'var(--accent-primary)' : 'transparent'}`,
                        background: isSelected ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            borderRadius: 'var(--radius-sm)',
                            background: `${folder.color || '#3b82f6'}20`,
                            color: folder.color || '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Folder size={20} color={folder.color || '#3b82f6'} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '14px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {folder.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {folder.notesCount || 0} {folder.notesCount === 1 ? 'note' : 'notes'}
                          </div>
                        </div>
                      </div>

                      <button
                        className="icon-btn"
                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                        title="Delete folder and its notes"
                        style={{
                          width: '26px',
                          height: '26px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  );
                })}

                {/* "+ Add Folder" Placeholder Card */}
                <div
                  onClick={() => setShowFolderModal(true)}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--border-color)',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '13px',
                  }}
                >
                  <Plus size={16} />
                  <span>Create Topic Folder</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes List Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedFolderId
                    ? `Notes in "${folders.find((f) => f.id === selectedFolderId)?.name || 'Folder'}"`
                    : `All Notes for ${currentSubject?.name || 'Subject'}`}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Files uploaded and organized for this subject.
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '220px',
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '32px',
                      fontSize: '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                    }}
                  >
                    <Search size={14} />
                  </div>
                </div>
              </div>
            </div>

            {loadingNotes ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading notes...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'rgba(59,130,246,0.1)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <FileText size={28} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  No Notes in this topic yet
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    maxWidth: '400px',
                    margin: '0 auto 20px',
                  }}
                >
                  Upload lecture slides, topic PDFs, textbook notes, or images for this subject.
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setUploadForm((prev) => ({
                      ...prev,
                      folderId: selectedFolderId ? String(selectedFolderId) : '',
                    }));
                    setShowUploadModal(true);
                  }}
                  style={{ margin: '0 auto' }}
                >
                  <Upload size={16} />
                  <span>Upload First Note</span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}
              >
                {filteredNotes.map((note) => {
                  const viewUrl = note.downloadUrl || note.fileUrl;
                  const folderObj = folders.find((f) => f.id === note.folderId);

                  return (
                    <div
                      key={note.id}
                      className="card"
                      style={{
                        padding: '18px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      <div>
                        {/* Top row with badges and folder name */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getFileTypeBadge(note.fileType, note.fileName)}
                            {folderObj && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: folderObj.color || 'var(--accent-primary)',
                                  background: `${folderObj.color || '#3b82f6'}15`,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {folderObj.name}
                              </span>
                            )}
                          </div>

                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#10b981',
                              background: 'rgba(16,185,129,0.12)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Uploaded
                          </span>
                        </div>

                        {/* Title */}
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: 'var(--text-primary)',
                            marginBottom: '4px',
                            lineHeight: 1.3,
                          }}
                        >
                          {note.title}
                        </div>

                        {/* File Name & Size */}
                        {note.fileName && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '8px',
                            }}
                          >
                            <Paperclip size={12} />
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '180px',
                              }}
                            >
                              {note.fileName}
                            </span>
                            {note.fileSize && (
                              <span style={{ color: 'var(--text-muted)' }}>
                                ({formatFileSize(note.fileSize)})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Text note content preview if available */}
                        {note.content && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-secondary)',
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              marginTop: '6px',
                              maxHeight: '60px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {note.content}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {viewUrl && (
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ExternalLink size={12} />
                              <span>View</span>
                            </a>
                          )}

                          {viewUrl && (
                            <a
                              href={viewUrl}
                              download={note.fileName || 'note'}
                              className="btn btn-secondary"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Download size={12} />
                              <span>Download</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="icon-btn"
                            title="Delete note"
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              color: 'var(--accent-red)',
                            }}
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Topic Folder */}
      {showFolderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '440px', padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>New Topic Folder</h3>
              <button
                className="icon-btn"
                onClick={() => setShowFolderModal(false)}
                style={{ border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Folder / Topic Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Unit 1: Computer Architecture"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input
                  className="form-input"
                  placeholder="Key concepts, syllabus topics..."
                  value={newFolder.description}
                  onChange={(e) => setNewFolder((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Folder Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {folderColors.map((c) => (
                    <div
                      key={c}
                      onClick={() => setNewFolder((prev) => ({ ...prev, color: c }))}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: `3px solid ${newFolder.color === c ? 'white' : 'transparent'}`,
                        outline: `2px solid ${newFolder.color === c ? c : 'transparent'}`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFolderModal(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={createFolderMutation.isPending}
                >
                  {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Note to AWS S3 */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '480px', padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Upload Note</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Stored in {currentSubject?.name}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowUploadModal(false)}
                style={{ border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* File Dropzone */}
              <div className="form-group">
                <label className="form-label">Select File (PDF, Image, Doc, etc.)</label>
                <label
                  style={{
                    border: '2px dashed var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'block',
                    background: 'rgba(59,130,246,0.05)',
                  }}
                >
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadForm((prev) => ({
                          ...prev,
                          file,
                          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
                        }));
                      }
                    }}
                  />
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(59,130,246,0.15)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}
                  >
                    <Upload size={18} />
                  </div>
                  {uploadForm.file ? (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {uploadForm.file.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatFileSize(uploadForm.file.size)} • Click to replace
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Click to choose file</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        PDF, PNG, JPG, DOCX, TXT up to 25MB
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Target Folder */}
              <div className="form-group">
                <label className="form-label">Topic Folder</label>
                <select
                  className="form-input"
                  value={uploadForm.folderId}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, folderId: e.target.value }))}
                >
                  <option value="">General (No Topic Folder)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Title */}
              <div className="form-group">
                <label className="form-label">Note Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Chapter 1 Summary"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Note Content / Notes */}
              <div className="form-group">
                <label className="form-label">Additional Content / Text Notes (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Key formulas, lecture notes, or summaries..."
                  value={uploadForm.content}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isUploading || uploadNoteMutation.isPending}
                >
                  {isUploading || uploadNoteMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
