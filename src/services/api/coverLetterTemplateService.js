import { toast } from 'react-toastify';

class CoverLetterTemplateService {
  constructor() {
    this.tableName = 'cover_letter_template';
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

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "category" } },
        { field: { Name: "subject" } },
        { field: { Name: "content" } },
        { field: { Name: "variables" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [{
        fieldName: "Name",
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
      name: item.Name || '',
      category: item.category || '',
      subject: item.subject || '',
      content: item.content || '',
      variables: item.variables ? item.variables.split(',') : [],
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    }));
  }

  async getById(id) {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "category" } },
        { field: { Name: "subject" } },
        { field: { Name: "content" } },
        { field: { Name: "variables" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (!response.data) {
      return null;
    }

    const item = response.data;
    return {
      Id: item.Id,
      name: item.Name || '',
      category: item.category || '',
      subject: item.subject || '',
      content: item.content || '',
      variables: item.variables ? item.variables.split(',') : [],
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    };
  }

  async getByCategory(category) {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "category" } },
        { field: { Name: "subject" } },
        { field: { Name: "content" } },
        { field: { Name: "variables" } }
      ],
      where: [{
        FieldName: "category",
        Operator: "EqualTo",
        Values: [category]
      }],
      orderBy: [{
        fieldName: "Name",
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
      name: item.Name || '',
      category: item.category || '',
      subject: item.subject || '',
      content: item.content || '',
      variables: item.variables ? item.variables.split(',') : []
    }));
  }

  async create(templateData) {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const variables = this.extractVariables(templateData.content || '', templateData.subject || '');
    
    const params = {
      records: [{
        Name: templateData.name || 'Untitled Template',
        category: templateData.category || 'General',
        subject: templateData.subject || '',
        content: templateData.content || '',
        variables: variables.join(',')
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to create template');
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
          name: newRecord.Name || '',
          category: newRecord.category || '',
          subject: newRecord.subject || '',
          content: newRecord.content || '',
          variables: newRecord.variables ? newRecord.variables.split(',') : [],
          createdAt: newRecord.CreatedOn,
          updatedAt: newRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to create template');
  }

  async update(id, templateData) {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const variables = this.extractVariables(templateData.content || '', templateData.subject || '');
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: templateData.name || 'Untitled Template',
        category: templateData.category || 'General',
        subject: templateData.subject || '',
        content: templateData.content || '',
        variables: variables.join(',')
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to update template');
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
          name: updatedRecord.Name || '',
          category: updatedRecord.category || '',
          subject: updatedRecord.subject || '',
          content: updatedRecord.content || '',
          variables: updatedRecord.variables ? updatedRecord.variables.split(',') : [],
          createdAt: updatedRecord.CreatedOn,
          updatedAt: updatedRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to update template');
  }

  async delete(id) {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await this.apperClient.deleteRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to delete template');
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

  async search(query) {
    await this.delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "category" } },
        { field: { Name: "subject" } },
        { field: { Name: "content" } },
        { field: { Name: "variables" } }
      ],
      whereGroups: [{
        operator: "OR",
        subGroups: [
          {
            conditions: [{
              fieldName: "Name",
              operator: "Contains",
              values: [query]
            }],
            operator: "OR"
          },
          {
            conditions: [{
              fieldName: "category",
              operator: "Contains",
              values: [query]
            }],
            operator: "OR"
          },
          {
            conditions: [{
              fieldName: "content",
              operator: "Contains",
              values: [query]
            }],
            operator: "OR"
          }
        ]
      }],
      orderBy: [{
        fieldName: "Name",
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
      name: item.Name || '',
      category: item.category || '',
      subject: item.subject || '',
      content: item.content || '',
      variables: item.variables ? item.variables.split(',') : []
    }));
  }

  async getCategories() {
    await this.delay();
    
    const allTemplates = await this.getAll();
    const categories = [...new Set(allTemplates.map(t => t.category))];
    return categories.sort();
  }

  extractVariables(content, subject = '') {
    const text = `${content} ${subject}`;
    const matches = text.match(/\{([^}]+)\}/g) || [];
    const variables = matches.map(match => match.slice(1, -1));
    return [...new Set(variables)];
  }

  populateTemplate(template, variables) {
    let populatedContent = template.content;
    let populatedSubject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      populatedContent = populatedContent.replace(new RegExp(placeholder, 'g'), value || `{${key}}`);
      populatedSubject = populatedSubject.replace(new RegExp(placeholder, 'g'), value || `{${key}}`);
    });

    return {
      subject: populatedSubject,
      content: populatedContent
    };
  }
}

export default new CoverLetterTemplateService();