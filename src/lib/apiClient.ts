import axios from 'axios';

// Backend API Service Client connecting Frontend to Backend Endpoints
export const apiClient = {
  // Branches API
  branches: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/branches?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/branches fallback to local state', err);
        return null;
      }
    },
    async create(collegeId: string, branchName: string) {
      try {
        const res = await axios.post('/api/branches', { collegeId, branchName });
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API POST /api/branches fallback', err);
        return null;
      }
    },
  },

  // Courses API
  courses: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/courses?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/courses fallback to local state', err);
        return null;
      }
    },
    async create(collegeId: string, courseData: any) {
      try {
        const res = await axios.post(`/api/courses?collegeId=${collegeId}`, courseData);
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API POST /api/courses fallback', err);
        return null;
      }
    },
    async update(collegeId: string, courseId: string, courseData: any) {
      try {
        const res = await axios.put(`/api/courses?collegeId=${collegeId}&courseId=${courseId}`, courseData);
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API PUT /api/courses fallback', err);
        return null;
      }
    },
    async delete(collegeId: string, courseId: string) {
      try {
        const res = await axios.delete(`/api/courses?collegeId=${collegeId}&courseId=${courseId}`);
        return res.data;
      } catch (err) {
        console.warn('Backend API DELETE /api/courses fallback', err);
        return null;
      }
    },
  },

  // Students API
  students: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/students?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/students fallback to local state', err);
        return null;
      }
    },
    async getById(studentId: string) {
      try {
        const res = await axios.get(`/api/students?studentId=${studentId}`);
        return res.data?.data || null;
      } catch (err) {
        console.warn('Backend API /api/students getById fallback', err);
        return null;
      }
    },
    async getByBatch(batchId: string) {
      try {
        const res = await axios.get(`/api/students?batchId=${batchId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/students getByBatch fallback', err);
        return null;
      }
    },
    async create(collegeId: string, studentData: any) {
      try {
        const res = await axios.post(`/api/students?collegeId=${collegeId}`, studentData);
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API POST /api/students fallback', err);
        return null;
      }
    },
  },

  // Assignments API
  assignments: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/assignments?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/assignments fallback to local state', err);
        return null;
      }
    },
    async create(collegeId: string, assignmentData: any) {
      try {
        const res = await axios.post(`/api/assignments?collegeId=${collegeId}`, assignmentData);
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API POST /api/assignments fallback', err);
        return null;
      }
    },
    async update(collegeId: string, assignmentId: string, assignmentData: any) {
      try {
        const res = await axios.put(`/api/assignments?collegeId=${collegeId}&assignmentId=${assignmentId}`, assignmentData);
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API PUT /api/assignments fallback', err);
        return null;
      }
    },
    async delete(collegeId: string, assignmentId: string) {
      try {
        const res = await axios.delete(`/api/assignments?collegeId=${collegeId}&assignmentId=${assignmentId}`);
        return res.data;
      } catch (err) {
        console.warn('Backend API DELETE /api/assignments fallback', err);
        return null;
      }
    },
  },

  // Problems API
  problems: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/problems?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/problems fallback to local state', err);
        return null;
      }
    },
  },

  // Contests API
  contests: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/contests?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/contests fallback to local state', err);
        return null;
      }
    },
  },

  // Activity Logs API
  activityLogs: {
    async getAll(collegeId: string) {
      try {
        const res = await axios.get(`/api/activity-logs?collegeId=${collegeId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/activity-logs fallback to local state', err);
        return null;
      }
    },
  },

  // Faculty Chat API
  facultyChat: {
    async getMessages(collegeId: string, facultyId: string) {
      try {
        const res = await axios.get(`/api/faculty-chat?collegeId=${collegeId}&facultyId=${facultyId}`);
        return res.data?.data || [];
      } catch (err) {
        console.warn('Backend API /api/faculty-chat fallback to local state', err);
        return null;
      }
    },
    async sendMessage(collegeId: string, facultyId: string, messageData: any) {
      try {
        const res = await axios.post(`/api/faculty-chat?collegeId=${collegeId}&facultyId=${facultyId}`, messageData);
        return res.data?.data;
      } catch (err) {
        console.warn('Backend API POST /api/faculty-chat fallback', err);
        return null;
      }
    },
  },

  // Reports API
  reports: {
    async getDashboardStats(collegeId: string) {
      try {
        const res = await axios.get(`/api/reports?collegeId=${collegeId}`);
        return res.data?.data || null;
      } catch (err) {
        console.warn('Backend API /api/reports fallback to local state', err);
        return null;
      }
    },
  },
};
