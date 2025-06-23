import { toast } from 'react-toastify';

// Utility function to simulate API delay
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// Interview Notes Service
class InterviewNotesService {
  constructor() {
    this.tableName = 'interview_note';
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
        { field: { Name: "position" } },
        { field: { Name: "content" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [{
        fieldName: "CreatedOn",
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
      position: item.position || '',
      content: item.content || '',
      tags: [],
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    }));
  }

  async getById(id) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title" } },
        { field: { Name: "company" } },
        { field: { Name: "position" } },
        { field: { Name: "content" } },
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
      title: item.title || '',
      company: item.company || '',
      position: item.position || '',
      content: item.content || '',
      tags: [],
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    };
  }

  async create(noteData) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Name: noteData.title || 'Untitled Note',
        title: noteData.title || '',
        company: noteData.company || '',
        position: noteData.position || '',
        content: noteData.content || ''
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to create note');
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
          position: newRecord.position || '',
          content: newRecord.content || '',
          tags: [],
          createdAt: newRecord.CreatedOn,
          updatedAt: newRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to create note');
  }

  async update(id, noteData) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: noteData.title || 'Untitled Note',
        title: noteData.title || '',
        company: noteData.company || '',
        position: noteData.position || '',
        content: noteData.content || ''
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to update note');
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
          position: updatedRecord.position || '',
          content: updatedRecord.content || '',
          tags: [],
          createdAt: updatedRecord.CreatedOn,
          updatedAt: updatedRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to update note');
  }

  async delete(id) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await this.apperClient.deleteRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to delete note');
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
}

// Interview Questions Service
class InterviewQuestionsService {
  constructor() {
    this.tableName = 'interview_question';
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
        { field: { Name: "question" } },
        { field: { Name: "category" } },
        { field: { Name: "difficulty" } },
        { field: { Name: "answer" } },
        { field: { Name: "notes" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "ModifiedOn" } }
      ],
      orderBy: [{
        fieldName: "category",
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
      question: item.question || '',
      category: item.category || '',
      difficulty: item.difficulty || 'Medium',
      answer: item.answer || '',
      notes: item.notes || '',
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    }));
  }

  async getById(id) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "question" } },
        { field: { Name: "category" } },
        { field: { Name: "difficulty" } },
        { field: { Name: "answer" } },
        { field: { Name: "notes" } },
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
      question: item.question || '',
      category: item.category || '',
      difficulty: item.difficulty || 'Medium',
      answer: item.answer || '',
      notes: item.notes || '',
      createdAt: item.CreatedOn,
      updatedAt: item.ModifiedOn
    };
  }

  async create(questionData) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Name: questionData.question || 'Untitled Question',
        question: questionData.question || '',
        category: questionData.category || '',
        difficulty: questionData.difficulty || 'Medium',
        answer: questionData.answer || '',
        notes: questionData.notes || ''
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to create question');
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
          question: newRecord.question || '',
          category: newRecord.category || '',
          difficulty: newRecord.difficulty || 'Medium',
          answer: newRecord.answer || '',
          notes: newRecord.notes || '',
          createdAt: newRecord.CreatedOn,
          updatedAt: newRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to create question');
  }

  async update(id, questionData) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: questionData.question || 'Untitled Question',
        question: questionData.question || '',
        category: questionData.category || '',
        difficulty: questionData.difficulty || 'Medium',
        answer: questionData.answer || '',
        notes: questionData.notes || ''
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to update question');
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
          question: updatedRecord.question || '',
          category: updatedRecord.category || '',
          difficulty: updatedRecord.difficulty || 'Medium',
          answer: updatedRecord.answer || '',
          notes: updatedRecord.notes || '',
          createdAt: updatedRecord.CreatedOn,
          updatedAt: updatedRecord.ModifiedOn
        };
      }
    }

    throw new Error('Failed to update question');
  }

  async delete(id) {
    await delay();
    
    if (!this.apperClient) this.initClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await this.apperClient.deleteRecord(this.tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      throw new Error('Failed to delete question');
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
}

// Create service instances
const notesService = new InterviewNotesService();
const questionsService = new InterviewQuestionsService();

// Export the service methods
export const getAllNotes = async () => notesService.getAll();
export const getNoteById = async (id) => notesService.getById(id);
export const createNote = async (noteData) => notesService.create(noteData);
export const updateNote = async (id, noteData) => notesService.update(id, noteData);
export const deleteNote = async (id) => notesService.delete(id);

export const getAllQuestions = async () => questionsService.getAll();
export const getQuestionById = async (id) => questionsService.getById(id);
export const createQuestion = async (questionData) => questionsService.create(questionData);
export const updateQuestion = async (id, questionData) => questionsService.update(id, questionData);
export const deleteQuestion = async (id) => questionsService.delete(id);