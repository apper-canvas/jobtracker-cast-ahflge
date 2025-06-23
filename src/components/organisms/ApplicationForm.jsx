import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import jobApplicationService from "@/services/api/jobApplicationService";
import coverLetterTemplateService from "@/services/api/coverLetterTemplateService";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
const ApplicationForm = ({ applicationId, onSuccess, onCancel }) => {
const [formData, setFormData] = useState({
    title: '',
    company: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0],
    salary: { min: '', max: '', currency: 'USD' },
    location: '',
    notes: '',
    jobUrl: '',
    coverLetterTemplate: '',
    coverLetterContent: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'phone_screen', label: 'Phone Screen' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'CAD', label: 'CAD' }
  ];

useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
    loadTemplates();
  }, [applicationId]);

  const loadApplication = async () => {
    setInitialLoading(true);
    try {
      const application = await jobApplicationService.getById(applicationId);
      setFormData(application);
    } catch (error) {
      toast.error('Failed to load application');
    } finally {
      setInitialLoading(false);
    }
};

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const allTemplates = await coverLetterTemplateService.getAll();
      const formattedTemplates = [
        { value: '', label: 'No template' },
        ...allTemplates.map(template => ({
          value: template.Id,
          label: template.name
        }))
      ];
      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load cover letter templates');
      setTemplates([{ value: '', label: 'No template' }]);
    } finally {
      setTemplatesLoading(false);
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Applied date is required';
    }
if (formData.jobUrl && formData.jobUrl.trim()) {
      const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      if (!urlPattern.test(formData.jobUrl.trim())) {
        newErrors.jobUrl = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    if (formData.salary.min && formData.salary.max) {
      const min = parseFloat(formData.salary.min);
      const max = parseFloat(formData.salary.max);
      if (min > max) {
        newErrors.salaryRange = 'Minimum salary cannot be greater than maximum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const processedData = {
        ...formData,
        salary: {
          ...formData.salary,
          min: formData.salary.min ? parseFloat(formData.salary.min) : null,
          max: formData.salary.max ? parseFloat(formData.salary.max) : null
        }
      };

      if (applicationId) {
        await jobApplicationService.update(applicationId, processedData);
        toast.success('Application updated successfully');
      } else {
        await jobApplicationService.create(processedData);
        toast.success('Application created successfully');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(applicationId ? 'Failed to update application' : 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
};

  const handleTemplateChange = async (templateId) => {
    if (!templateId) {
      handleInputChange('coverLetterTemplate', '');
      handleInputChange('coverLetterContent', '');
      return;
    }

    setTemplatesLoading(true);
    try {
      handleInputChange('coverLetterTemplate', templateId);
      // You can implement template loading logic here if needed
      // For now, just clear the content when template changes
      handleInputChange('coverLetterContent', '');
    } catch (error) {
      toast.error('Failed to load template');
    } finally {
      setTemplatesLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Job Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              required
              placeholder="e.g. Senior Frontend Developer"
            />

            <FormField
              label="Company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              error={errors.company}
              required
              placeholder="e.g. TechCorp Solutions"
            />

            <FormField
              type="select"
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={statusOptions}
              error={errors.status}
              required
            />

            <FormField
              type="input"
              inputType="date"
              label="Applied Date"
              value={formData.appliedDate}
              onChange={(e) => handleInputChange('appliedDate', e.target.value)}
              error={errors.appliedDate}
              required
            />

            <FormField
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
            />

            <FormField
              label="Job URL"
              value={formData.jobUrl}
              onChange={(e) => handleInputChange('jobUrl', e.target.value)}
              placeholder="https://company.com/careers/job-posting"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Salary Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                type="input"
                inputType="number"
                label="Minimum Salary"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
                placeholder="75000"
                min="0"
                step="1000"
              />

              <FormField
                type="input"
                inputType="number"
                label="Maximum Salary"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
                placeholder="95000"
                min="0"
                step="1000"
              />

              <FormField
                type="select"
                label="Currency"
                value={formData.salary.currency}
                onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                options={currencyOptions}
              />
            </div>
            {errors.salaryRange && (
              <p className="text-sm text-error">{errors.salaryRange}</p>
            )}
          </div>

          <FormField
            type="textarea"
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any notes about the application, interview process, company culture, etc."
            rows={4}
/>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
            
            <FormField
              type="select"
              label="Cover Letter Template"
              value={formData.coverLetterTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              options={templates}
              loading={templatesLoading}
              placeholder="Choose a template..."
            />

            {formData.coverLetterTemplate && (
              <FormField
                type="textarea"
                label="Cover Letter Content"
                value={formData.coverLetterContent}
                onChange={(e) => handleInputChange('coverLetterContent', e.target.value)}
                placeholder="Your cover letter content will appear here..."
                rows={8}
                className="font-mono text-sm"
              />
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon="Save"
              className="flex-1 sm:flex-none"
            >
              {applicationId ? 'Update Application' : 'Create Application'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default ApplicationForm;