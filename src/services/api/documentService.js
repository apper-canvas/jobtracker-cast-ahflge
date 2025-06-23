import { toast } from 'react-toastify';

const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

class DocumentService {
  constructor() {
    this.tableName = 'document';
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
        { field: { Name: "type" } },
        { field: { Name: "filename" } },
        { field: { Name: "version" } },
        { field: { Name: "upload_date" } },
        { field: { Name: "content" } },
        { field: { Name: "application_id" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [{
        fieldName: "upload_date",
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
      type: item.type || '',
      filename: item.filename || '',
      version: item.version || 1,
      uploadDate: item.upload_date || '',
      content: item.content || '',
      applicationId: item.application_id?.Id || item.application_id,
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
        { field: { Name: "type" } },
        { field: { Name: "filename" } },
        { field: { Name: "version" } },
        { field: { Name: "upload_date" } },
        { field: { Name: "content" } },
        { field: { Name: "application_id" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Document not found');
    }

    if (!response.data) {
      throw new Error('Document not found');
    }

    const item = response.data;
    return {
      Id: item.Id,
      type: item.type || '',
      filename: item.filename || '',
      version: item.version || 1,
      uploadDate: item.upload_date || '',
      content: item.content || '',
      applicationId: item.application_id?.Id || item.application_id,
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    };
  }

  async create(document) {
    await delay(400);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Name: document.filename || 'Untitled Document',
        type: document.type || 'resume',
        filename: document.filename || '',
        version: document.version || 1,
        upload_date: document.uploadDate || new Date().toISOString(),
        content: document.content || '',
        application_id: document.applicationId || null
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to create document');
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
          type: newRecord.type || '',
          filename: newRecord.filename || '',
          version: newRecord.version || 1,
          uploadDate: newRecord.upload_date || '',
          content: newRecord.content || '',
          applicationId: newRecord.application_id?.Id || newRecord.application_id,
          createdAt: newRecord.CreatedOn,
          updatedAt: newRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to create document');
  }

  async update(id, updates) {
    await delay(300);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: updates.filename || 'Untitled Document',
        type: updates.type || 'resume',
        filename: updates.filename || '',
        version: updates.version || 1,
        upload_date: updates.uploadDate || '',
        content: updates.content || '',
        application_id: updates.applicationId || null
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to update document');
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
          type: updatedRecord.type || '',
          filename: updatedRecord.filename || '',
          version: updatedRecord.version || 1,
          uploadDate: updatedRecord.upload_date || '',
          content: updatedRecord.content || '',
          applicationId: updatedRecord.application_id?.Id || updatedRecord.application_id,
          createdAt: updatedRecord.CreatedOn,
          updatedAt: updatedRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to update document');
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
      throw new Error('Failed to delete document');
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

  async getByType(type) {
    await delay(200);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "type" } },
        { field: { Name: "filename" } },
        { field: { Name: "version" } },
        { field: { Name: "upload_date" } },
        { field: { Name: "content" } },
        { field: { Name: "application_id" } }
      ],
      where: [{
        FieldName: "type",
        Operator: "EqualTo",
        Values: [type]
      }],
      orderBy: [{
        fieldName: "upload_date",
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
      type: item.type || '',
      filename: item.filename || '',
      version: item.version || 1,
      uploadDate: item.upload_date || '',
      content: item.content || '',
      applicationId: item.application_id?.Id || item.application_id
    }));
  }

  async getByApplicationId(applicationId) {
    await delay(200);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "type" } },
        { field: { Name: "filename" } },
        { field: { Name: "version" } },
        { field: { Name: "upload_date" } },
        { field: { Name: "content" } },
        { field: { Name: "application_id" } }
      ],
      where: [{
        FieldName: "application_id",
        Operator: "EqualTo",
        Values: [parseInt(applicationId)]
      }],
      orderBy: [{
        fieldName: "upload_date",
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
      type: item.type || '',
      filename: item.filename || '',
      version: item.version || 1,
      uploadDate: item.upload_date || '',
      content: item.content || '',
      applicationId: item.application_id?.Id || item.application_id
    }));
  }
}

export default new DocumentService();