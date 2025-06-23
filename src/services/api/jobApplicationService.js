import { toast } from 'react-toastify';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class JobApplicationService {
  constructor() {
    this.tableName = 'job_application';
    this.apperClient = null;
    this.initClient();
  }

  initClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title" } },
        { field: { Name: "company" } },
        { field: { Name: "status" } },
        { field: { Name: "applied_date" } },
        { field: { Name: "salary_min" } },
        { field: { Name: "salary_max" } },
        { field: { Name: "salary_currency" } },
        { field: { Name: "location" } },
        { field: { Name: "notes" } },
        { field: { Name: "job_url" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [{
        fieldName: "applied_date",
        sorttype: "DESC"
      }]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data.map(item => ({
      Id: item.Id,
      title: item.title || '',
      company: item.company || '',
      status: item.status || 'applied',
      appliedDate: item.applied_date || '',
      salary: {
        min: item.salary_min || null,
        max: item.salary_max || null,
        currency: item.salary_currency || 'USD'
      },
      location: item.location || '',
      notes: item.notes || '',
      jobUrl: item.job_url || '',
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    }));
  }

  async getById(id) {
    await delay(200);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title" } },
        { field: { Name: "company" } },
        { field: { Name: "status" } },
        { field: { Name: "applied_date" } },
        { field: { Name: "salary_min" } },
        { field: { Name: "salary_max" } },
        { field: { Name: "salary_currency" } },
        { field: { Name: "location" } },
        { field: { Name: "notes" } },
        { field: { Name: "job_url" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Application not found');
    }

    if (!response.data) {
      throw new Error('Application not found');
    }

    const item = response.data;
    return {
      Id: item.Id,
      title: item.title || '',
      company: item.company || '',
      status: item.status || 'applied',
      appliedDate: item.applied_date || '',
      salary: {
        min: item.salary_min || null,
        max: item.salary_max || null,
        currency: item.salary_currency || 'USD'
      },
      location: item.location || '',
      notes: item.notes || '',
      jobUrl: item.job_url || '',
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    };
  }

  async create(application) {
    await delay(400);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Name: application.title || 'Untitled Application',
        title: application.title || '',
        company: application.company || '',
        status: application.status || 'applied',
        applied_date: application.appliedDate || new Date().toISOString().split('T')[0],
        salary_min: application.salary?.min || null,
        salary_max: application.salary?.max || null,
        salary_currency: application.salary?.currency || 'USD',
        location: application.location || '',
        notes: application.notes || '',
        job_url: application.jobUrl || ''
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to create application');
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        const newRecord = successfulRecords[0].data;
        return {
          Id: newRecord.Id,
          title: newRecord.title || '',
          company: newRecord.company || '',
          status: newRecord.status || 'applied',
          appliedDate: newRecord.applied_date || '',
          salary: {
            min: newRecord.salary_min || null,
            max: newRecord.salary_max || null,
            currency: newRecord.salary_currency || 'USD'
          },
          location: newRecord.location || '',
          notes: newRecord.notes || '',
          jobUrl: newRecord.job_url || '',
          createdAt: newRecord.CreatedOn,
          updatedAt: newRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to create application');
  }

  async update(id, updates) {
    await delay(300);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: updates.title || 'Untitled Application',
        title: updates.title || '',
        company: updates.company || '',
        status: updates.status || 'applied',
        applied_date: updates.appliedDate || '',
        salary_min: updates.salary?.min || null,
        salary_max: updates.salary?.max || null,
        salary_currency: updates.salary?.currency || 'USD',
        location: updates.location || '',
        notes: updates.notes || '',
        job_url: updates.jobUrl || ''
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to update application');
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        const updatedRecord = successfulUpdates[0].data;
        return {
          Id: updatedRecord.Id,
          title: updatedRecord.title || '',
          company: updatedRecord.company || '',
          status: updatedRecord.status || 'applied',
          appliedDate: updatedRecord.applied_date || '',
          salary: {
            min: updatedRecord.salary_min || null,
            max: updatedRecord.salary_max || null,
            currency: updatedRecord.salary_currency || 'USD'
          },
          location: updatedRecord.location || '',
          notes: updatedRecord.notes || '',
          jobUrl: updatedRecord.job_url || '',
          createdAt: updatedRecord.CreatedOn,
          updatedAt: updatedRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to update application');
  }

  async delete(id) {
    await delay(250);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await this.apperClient.deleteRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to delete application');
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      return successfulDeletions.length > 0;
    }

    return false;
  }

  async getByStatus(status) {
    const allApplications = await this.getAll();
    return allApplications.filter(app => app.status === status);
  }

  async getStatusCounts() {
    const allApplications = await this.getAll();
    return allApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }
}

export default new JobApplicationService();