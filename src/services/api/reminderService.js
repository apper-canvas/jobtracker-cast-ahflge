import { toast } from 'react-toastify';

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

class ReminderService {
  constructor() {
    this.tableName = 'reminder';
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
        { field: { Name: "date" } },
        { field: { Name: "type" } },
        { field: { Name: "message" } },
        { field: { Name: "completed" } },
        { field: { Name: "application_id" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [{
        fieldName: "date",
        sorttype: "ASC"
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
      date: item.date || '',
      type: item.type || 'reminder',
      message: item.message || '',
      completed: item.completed || false,
      applicationId: item.application_id?.Id || item.application_id,
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    }));
  }

  async getById(id) {
    await delay(150);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "date" } },
        { field: { Name: "type" } },
        { field: { Name: "message" } },
        { field: { Name: "completed" } },
        { field: { Name: "application_id" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Reminder not found');
    }

    if (!response.data) {
      throw new Error('Reminder not found');
    }

    const item = response.data;
    return {
      Id: item.Id,
      date: item.date || '',
      type: item.type || 'reminder',
      message: item.message || '',
      completed: item.completed || false,
      applicationId: item.application_id?.Id || item.application_id,
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    };
  }

  async create(reminder) {
    await delay(300);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Name: reminder.message || 'Untitled Reminder',
        date: reminder.date || new Date().toISOString(),
        type: reminder.type || 'reminder',
        message: reminder.message || '',
        completed: reminder.completed || false,
        application_id: reminder.applicationId || null
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to create reminder');
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
          date: newRecord.date || '',
          type: newRecord.type || 'reminder',
          message: newRecord.message || '',
          completed: newRecord.completed || false,
          applicationId: newRecord.application_id?.Id || newRecord.application_id,
          createdAt: newRecord.CreatedOn,
          updatedAt: newRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to create reminder');
  }

  async update(id, updates) {
    await delay(250);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: updates.message || 'Untitled Reminder',
        date: updates.date || '',
        type: updates.type || 'reminder',
        message: updates.message || '',
        completed: updates.completed || false,
        application_id: updates.applicationId || null
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to update reminder');
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
          date: updatedRecord.date || '',
          type: updatedRecord.type || 'reminder',
          message: updatedRecord.message || '',
          completed: updatedRecord.completed || false,
          applicationId: updatedRecord.application_id?.Id || updatedRecord.application_id,
          createdAt: updatedRecord.CreatedOn,
          updatedAt: updatedRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to update reminder');
  }

  async delete(id) {
    await delay(200);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await this.apperClient.deleteRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to delete reminder');
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

  async getUpcoming(days = 7) {
    await delay(200);
    
    if (!this.apperClient) this.initClient();
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "date" } },
        { field: { Name: "type" } },
        { field: { Name: "message" } },
        { field: { Name: "completed" } },
        { field: { Name: "application_id" } }
      ],
      where: [{
        FieldName: "completed",
        Operator: "EqualTo",
        Values: ["false"]
      }],
      orderBy: [{
        fieldName: "date",
        sorttype: "ASC"
      }]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    // Filter upcoming reminders client-side for now
    return response.data.filter(item => 
      new Date(item.date) <= futureDate
    ).map(item => ({
      Id: item.Id,
      date: item.date || '',
      type: item.type || 'reminder',
      message: item.message || '',
      completed: item.completed || false,
      applicationId: item.application_id?.Id || item.application_id
    }));
  }

  async getByApplicationId(applicationId) {
    await delay(150);
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "date" } },
        { field: { Name: "type" } },
        { field: { Name: "message" } },
        { field: { Name: "completed" } },
        { field: { Name: "application_id" } }
      ],
      where: [{
        FieldName: "application_id",
        Operator: "EqualTo",
        Values: [parseInt(applicationId)]
      }],
      orderBy: [{
        fieldName: "date",
        sorttype: "ASC"
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
      date: item.date || '',
      type: item.type || 'reminder',
      message: item.message || '',
      completed: item.completed || false,
      applicationId: item.application_id?.Id || item.application_id
    }));
  }
}

export default new ReminderService();