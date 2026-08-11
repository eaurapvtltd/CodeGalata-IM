import axios from 'axios';

export const apiClient = {
  branches: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/branches?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch branches:', err);
        return null;
      }
    },
    async create(collegeId: string, branchName: string) {
      try {
        const res = await axios.post('/api/branches', { collegeId, branchName });
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to create branch:', err);
        return null;
      }
    },
  },

  courses: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/courses?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch courses:', err);
        return null;
      }
    },
    async create(collegeId: string, courseData: any) {
      try {
        const res = await axios.post(`/api/courses?collegeId=${collegeId}`, courseData);
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to create course:', err);
        return null;
      }
    },
    async update(collegeId: string, courseId: string, courseData: any) {
      try {
        const res = await axios.put(`/api/courses?collegeId=${collegeId}&courseId=${courseId}`, courseData);
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to update course:', err);
        return null;
      }
    },
    async delete(collegeId: string, courseId: string) {
      try {
        const res = await axios.delete(`/api/courses?collegeId=${collegeId}&courseId=${courseId}`);
        return res.data;
      } catch (err) {
        console.warn('Failed to delete course:', err);
        return null;
      }
    },
  },

  students: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/students?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch students:', err);
        return null;
      }
    },
    async getById(studentId: string) {
      try {
        const res = await axios.get(`/api/students?studentId=${studentId}`);
        return res.data?.data || null;
      } catch (err) {
        console.warn('Failed to fetch student:', err);
        return null;
      }
    },
    async getByBatch(batchId: string) {
      try {
        const res = await axios.get(`/api/students?batchId=${batchId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch batch students:', err);
        return null;
      }
    },
    async create(collegeId: string, studentData: any) {
      try {
        const res = await axios.post(`/api/students?collegeId=${collegeId}`, studentData);
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to create student:', err);
        return null;
      }
    },
  },

  assignments: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/assignments?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch assignments:', err);
        return null;
      }
    },
    async create(collegeId: string, assignmentData: any) {
      try {
        const res = await axios.post(`/api/assignments?collegeId=${collegeId}`, assignmentData);
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to create assignment:', err);
        return null;
      }
    },
    async update(collegeId: string, assignmentId: string, assignmentData: any) {
      try {
        const res = await axios.put(`/api/assignments?collegeId=${collegeId}&assignmentId=${assignmentId}`, assignmentData);
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to update assignment:', err);
        return null;
      }
    },
    async delete(collegeId: string, assignmentId: string) {
      try {
        const res = await axios.delete(`/api/assignments?collegeId=${collegeId}&assignmentId=${assignmentId}`);
        return res.data;
      } catch (err) {
        console.warn('Failed to delete assignment:', err);
        return null;
      }
    },
  },

  problems: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/problems?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch problems:', err);
        return null;
      }
    },
  },

  contests: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/contests?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch contests:', err);
        return null;
      }
    },
  },

  activityLogs: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/activity-logs?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch activity logs:', err);
        return null;
      }
    },
  },

  facultyChat: {
    async getMessages(collegeId: string, facultyId: string) {
      try {
        const res = await axios.get(`/api/faculty-chat?collegeId=${collegeId}&facultyId=${facultyId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Failed to fetch faculty messages:', err);
        return null;
      }
    },
    async sendMessage(collegeId: string, facultyId: string, messageData: any) {
      try {
        const res = await axios.post(`/api/faculty-chat?collegeId=${collegeId}&facultyId=${facultyId}`, messageData);
        return res.data?.data;
      } catch (err) {
        console.warn('Failed to send faculty message:', err);
        return null;
      }
    },
  },

  reports: {
    async getDashboardStats(collegeId: string) {
      try {
        const res = await axios.get(`/api/reports?collegeId=${collegeId}`);
        return res.data?.data || null;
      } catch (err) {
        console.warn('Failed to fetch report stats:', err);
        return null;
      }
    },
  },
};
