import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SearchBar from '@/components/molecules/SearchBar';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import FormField from '@/components/molecules/FormField';
import DocumentUpload from '@/components/organisms/DocumentUpload';
import documentService from '@/services/api/documentService';
import coverLetterTemplateService from '@/services/api/coverLetterTemplateService';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);
  const [viewTemplate, setViewTemplate] = useState(null);

  const documentTypes = [
    { value: 'all', label: 'All Documents' },
    { value: 'resume', label: 'Resumes' },
    { value: 'cover_letter', label: 'Cover Letters' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'other', label: 'Other' }
  ];

  const templateCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Analytics', label: 'Analytics' },
    { value: 'General', label: 'General' }
  ];

  useEffect(() => {
    loadDocuments();
    loadTemplates();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await coverLetterTemplateService.getAll();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.delete(id);
      setDocuments(prev => prev.filter(doc => doc.Id !== id));
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await coverLetterTemplateService.delete(id);
      setTemplates(prev => prev.filter(template => template.Id !== id));
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDownloadDocument = (document) => {
    toast.info(`Downloading ${document.name}...`);
  };

  const handleViewDocument = (document) => {
    setViewDocument(document);
  };

  const handleViewTemplate = (template) => {
    setViewTemplate(template);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type) => {
    const icons = {
      resume: 'FileText',
      cover_letter: 'Mail',
      certificate: 'Award',
      portfolio: 'Briefcase',
      other: 'File'
    };
    return icons[type] || 'File';
  };

  const getTypeColor = (type) => {
    const colors = {
      resume: 'text-blue-600 bg-blue-50',
      cover_letter: 'text-green-600 bg-green-50',
      certificate: 'text-purple-600 bg-purple-50',
      portfolio: 'text-orange-600 bg-orange-50',
      other: 'text-gray-600 bg-gray-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Engineering: 'text-blue-600 bg-blue-50',
      Marketing: 'text-green-600 bg-green-50',
      Analytics: 'text-purple-600 bg-purple-50',
      General: 'text-gray-600 bg-gray-50'
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonLoader type="header" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents & Templates</h1>
            <p className="text-gray-600 mt-1">Manage your documents and cover letter templates</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowUploadModal(true)}
              icon="Upload"
              variant="secondary"
            >
              Upload Document
            </Button>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              icon="Plus"
              variant="primary"
            >
              New Template
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="FileText" size={20} />
              Documents ({documents.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Mail" size={20} />
              Templates ({templates.length})
            </div>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={activeTab === 'documents' ? "Search documents..." : "Search templates..."}
            />
          </div>
          <select
            value={activeTab === 'documents' ? filterType : filterCategory}
            onChange={(e) => activeTab === 'documents' ? setFilterType(e.target.value) : setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {(activeTab === 'documents' ? documentTypes : templateCategories).map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {activeTab === 'documents' ? (
          /* Documents Grid */
          filteredDocuments.length === 0 ? (
            <EmptyState
              icon="FileText"
              title="No documents found"
              description={searchQuery || filterType !== 'all' 
                ? "No documents match your current search or filter criteria."
                : "Upload your first document to get started."
              }
              action={
                <Button
                  onClick={() => setShowUploadModal(true)}
                  icon="Upload"
                  variant="primary"
                >
                  Upload Document
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <motion.div
                  key={document.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getTypeColor(document.type)}`}>
                        <ApperIcon name={getTypeIcon(document.type)} size={24} />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View document"
                        >
                          <ApperIcon name="Eye" size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(document)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download document"
                        >
                          <ApperIcon name="Download" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.Id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete document"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {document.name}
                      </h3>
                      {document.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Templates Grid */
          filteredTemplates.length === 0 ? (
            <EmptyState
              icon="Mail"
              title="No templates found"
              description={searchQuery || filterCategory !== 'all' 
                ? "No templates match your current search or filter criteria."
                : "Create your first cover letter template to get started."
              }
              action={
                <Button
                  onClick={() => {
                    setEditingTemplate(null);
                    setShowTemplateModal(true);
                  }}
                  icon="Plus"
                  variant="primary"
                >
                  Create Template
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewTemplate(template)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View template"
                        >
                          <ApperIcon name="Eye" size={16} />
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit template"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.Id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete template"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {template.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-500">
                          {template.variables.length} variables
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <DocumentUpload
                onSuccess={() => {
                  setShowUploadModal(false);
                  loadDocuments();
                }}
                onCancel={() => setShowUploadModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <TemplateModal
            template={editingTemplate}
            onClose={() => {
              setShowTemplateModal(false);
              setEditingTemplate(null);
            }}
            onSuccess={() => {
              setShowTemplateModal(false);
              setEditingTemplate(null);
              loadTemplates();
            }}
          />
        )}
      </AnimatePresence>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setViewDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{viewDocument.name}</h3>
                <button
                  onClick={() => setViewDocument(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <p className="text-gray-600 text-center">
                  Document preview would be displayed here in a real application.
                  <br />
                  File: {viewDocument.name} ({formatFileSize(viewDocument.size)})
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Viewer Modal */}
      <AnimatePresence>
        {viewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setViewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewTemplate.name}</h3>
                  <p className="text-sm text-gray-600">{viewTemplate.category} template</p>
                </div>
                <button
                  onClick={() => setViewTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Subject Line:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-mono text-sm">
                      {viewTemplate.subject}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Content:</h4>
                    <pre className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                      {viewTemplate.content}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewTemplate.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Template Modal Component
const TemplateModal = ({ template, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    category: template?.category || 'General',
    subject: template?.subject || '',
    content: template?.content || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = ['General', 'Engineering', 'Marketing', 'Analytics', 'Sales', 'Design'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject line is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (template) {
        await coverLetterTemplateService.update(template.Id, formData);
        toast.success('Template updated successfully');
      } else {
        await coverLetterTemplateService.create(formData);
        toast.success('Template created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(template ? 'Failed to update template' : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Template Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="e.g. Software Engineer Template"
              />
              
              <FormField
                type="select"
                label="Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                required
              />
            </div>

            <FormField
              label="Subject Line"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              error={errors.subject}
              required
              placeholder="e.g. Application for {jobTitle} Position at {companyName}"
              helperText="Use {variableName} for dynamic content"
            />

            <FormField
              type="textarea"
              label="Content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              error={errors.content}
              required
              rows={12}
              placeholder="Write your cover letter template here. Use {variableName} for dynamic content like {companyName}, {jobTitle}, etc."
              helperText="Use variables like {companyName}, {jobTitle}, {applicantName} for personalization"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon="Save"
              className="flex-1 sm:flex-none"
            >
              {template ? 'Update Template' : 'Create Template'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Documents;