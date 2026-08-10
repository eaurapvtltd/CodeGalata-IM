import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // Check if database is already seeded
    const collegesCount = await prisma.college.count();
    if (collegesCount > 0) {
      return NextResponse.json({ success: true, message: 'Database already initialized.' });
    }

    logger.info('Initializing and seeding PostgreSQL database with CodeGalatta demo records...');

    // 1. Create College
    // Password hash of SHA-256 hash of empty string: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    const clientHashedPassword = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const bcryptPassword = await bcrypt.hash(clientHashedPassword, 10);

    const college = await prisma.college.create({
      data: {
        collegeName: 'Code Galatta Institute of Technology',
        collegeEmail: 'admin@cgit.edu',
        password: bcryptPassword,
      },
    });

    const collegeId = college.id;

    // 2. Create Branches
    const STATIC_BRANCHES = ['CSE', 'AI', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'];
    const branches = await Promise.all(
      STATIC_BRANCHES.map((bName) =>
        prisma.branch.create({
          data: {
            collegeId,
            branchName: bName,
          },
        })
      )
    );

    const cseBranch = branches.find((b: any) => b.branchName === 'CSE')!;
    const aiBranch = branches.find((b: any) => b.branchName === 'AI')!;

    // 3. Create Batches
    const batchCseA = await prisma.batch.create({
      data: {
        branchId: cseBranch.id,
        batchName: 'CSE-A',
      },
    });

    const batchCseB = await prisma.batch.create({
      data: {
        branchId: cseBranch.id,
        batchName: 'CSE-B',
      },
    });

    const batchAiA = await prisma.batch.create({
      data: {
        branchId: aiBranch.id,
        batchName: 'AI-A',
      },
    });

    // 4. Create Students
    const demoStudents = [
      {
        batchId: batchCseA.id,
        studentName: 'Aarav Sharma',
        cgpa: 8.9,
        email: 'aarav@cgit.edu',
        status: 'Activated',
        rollNo: 'CSE2025001',
        phone: '9876543210',
        attendancePct: 88,
        solvedProblemsCount: 24,
      },
      {
        batchId: batchCseA.id,
        studentName: 'Diya Patel',
        cgpa: 9.4,
        email: 'diya@cgit.edu',
        status: 'Activated',
        rollNo: 'CSE2025002',
        phone: '9876543211',
        attendancePct: 94,
        solvedProblemsCount: 42,
      },
      {
        batchId: batchCseA.id,
        studentName: 'Rohan Verma',
        cgpa: 7.8,
        email: 'rohan@cgit.edu',
        status: 'Activated',
        rollNo: 'CSE2025003',
        phone: '9876543212',
        attendancePct: 75,
        solvedProblemsCount: 5,
      },
      {
        batchId: batchCseB.id,
        studentName: 'Ananya Reddy',
        cgpa: 8.7,
        email: 'ananya@cgit.edu',
        status: 'Not Activated',
        rollNo: 'CSE2025004',
        phone: '9876543213',
        attendancePct: 82,
        solvedProblemsCount: 12,
      },
    ];

    await Promise.all(
      demoStudents.map((st) =>
        prisma.student.create({
          data: {
            ...st,
            registeredOn: new Date().toLocaleString(),
            lastLogin: new Date().toLocaleString(),
            lastActive: 'Online Now',
          },
        })
      )
    );

    // 5. Create Problems
    const prob1 = await prisma.problem.create({
      data: {
        collegeId,
        title: 'Two Sum',
        shortDescription: 'Find two numbers that add up to target',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        inputFormat: 'Line 1: Array of integers space separated\nLine 2: Target integer',
        outputFormat: 'Two space separated indices',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
        sampleInput: '2 7 11 15\n9',
        sampleOutput: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        hiddenTestCases: '3 2 4\n6 -> 1 2',
        languages: ['C (GCC 9.2.0)', 'C++', 'Java', 'Python 3'],
        defaultCode: {
          'C (GCC 9.2.0)': '#include <stdio.h>\n\nint main() {\n    // Type your Solution\n    return 0;\n}',
        },
        topics: ['Arrays & Hashing'],
        companies: ['Google', 'Amazon'],
      },
    });

    const prob2 = await prisma.problem.create({
      data: {
        collegeId,
        title: 'Longest Substring Without Repeating Characters',
        shortDescription: 'Find max non-repeating substring length',
        description: 'Find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        inputFormat: 'A single string s',
        outputFormat: 'An integer representing length',
        constraints: '0 <= s.length <= 5 * 10^4',
        sampleInput: 'abcabcbb',
        sampleOutput: '3',
        explanation: 'The answer is "abc", with length of 3.',
        languages: ['C (GCC 9.2.0)', 'C++', 'Java', 'Python 3'],
        defaultCode: {
          'C (GCC 9.2.0)': '#include <stdio.h>\n\nint main() {\n    // Type your Solution\n    return 0;\n}',
        },
        topics: ['Strings'],
        companies: ['Google'],
      },
    });

    // 6. Create Assignment
    await prisma.assignment.create({
      data: {
        collegeId,
        title: 'Algorithms Homework 1',
        description: 'Solve sorting and mapping challenges.',
        branchId: cseBranch.id,
        batchId: batchCseA.id,
        problemIds: [prob1.id],
        dueDate: new Date(Date.now() + 3600000 * 48),
        isPublished: true,
      },
    });

    // 7. Create Contest
    await prisma.contest.create({
      data: {
        collegeId,
        title: 'Weekly Code Clash #1',
        description: 'Test your algorithm solving speed.',
        startTime: new Date(Date.now() + 3600000 * 12),
        endTime: new Date(Date.now() + 3600000 * 15),
        problemIds: [prob1.id, prob2.id],
        branchId: cseBranch.id,
        batchId: batchCseA.id,
      },
    });

    // 8. Create Timed Practice
    await prisma.timedPractice.create({
      data: {
        collegeId,
        title: 'Array Manipulations Prep',
        durationMinutes: 45,
        problemIds: [prob1.id],
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000 * 24),
        batchId: batchCseA.id,
      },
    });

    // 9. Create Settings
    await prisma.collegeSettings.create({
      data: {
        collegeId,
        logoUrl: '',
        academicYear: '2025-2026',
        defaultBranchId: cseBranch.id,
        defaultBatchId: batchCseA.id,
        notificationsEnabled: true,
        theme: 'Dark',
      },
    });

    // 10. Create Faculty
    const fac1 = await prisma.facultyMember.create({
      data: {
        collegeId,
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@cgit.edu',
        department: 'CSE',
        designation: 'Professor & HOD',
        status: 'online',
      },
    });

    const fac2 = await prisma.facultyMember.create({
      data: {
        collegeId,
        name: 'Prof. Ananya Roy',
        email: 'ananya.roy@cgit.edu',
        department: 'AI',
        designation: 'Associate Professor',
        status: 'online',
      },
    });

    const fac3 = await prisma.facultyMember.create({
      data: {
        collegeId,
        name: 'Prof. Suresh Nair',
        email: 'suresh.nair@cgit.edu',
        department: 'ECE',
        designation: 'Assistant Professor',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000 * 2),
      },
    });

    // 11. Create Chat Messages
    const chatMessages = [
      {
        collegeId,
        facultyId: fac1.id,
        sender: 'faculty',
        senderName: 'Dr. Rajesh Kumar',
        text: 'Hello Super Admin! I have uploaded the new Data Structures questions for the upcoming CSE-A contest.',
        timestamp: new Date(Date.now() - 3600000 * 3),
        isRead: true,
      },
      {
        collegeId,
        facultyId: fac1.id,
        sender: 'admin',
        senderName: 'Super Admin',
        text: 'Great work Dr. Rajesh! I will review the test cases and publish the contest schedule today.',
        timestamp: new Date(Date.now() - 3600000 * 2),
        isRead: true,
      },
      {
        collegeId,
        facultyId: fac1.id,
        sender: 'faculty',
        senderName: 'Dr. Rajesh Kumar',
        text: 'Please check the hidden test cases for the Graph Algorithms problem when you have a moment.',
        timestamp: new Date(Date.now() - 3600000 * 1),
        isRead: false,
      },
    ];

    await Promise.all(
      chatMessages.map((msg) =>
        prisma.facultyChatMessage.create({
          data: msg,
        })
      )
    );

    // 12. Create Activities
    await prisma.activity.create({
      data: {
        collegeId,
        type: 'batch_created',
        description: 'Created batch CSE-A in CSE branch',
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
    });

    await prisma.activity.create({
      data: {
        collegeId,
        type: 'students_uploaded',
        description: 'Uploaded 3 students to CSE-A',
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
    });

    await prisma.activity.create({
      data: {
        collegeId,
        type: 'problem_created',
        description: 'Created problem "Two Sum"',
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
    });

    // 13. Create Logs
    await prisma.activityLog.create({
      data: {
        collegeId,
        type: 'auth',
        action: 'Login',
        description: 'Admin logged in',
        adminEmail: 'admin@cgit.edu',
        timestamp: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        collegeId,
        type: 'batch',
        action: 'Batch Creation',
        description: 'Created batch CSE-A',
        adminEmail: 'admin@cgit.edu',
        timestamp: new Date(),
      },
    });

    logger.info('Database seeded successfully!');

    return NextResponse.json({ success: true, message: 'Database initialized successfully!' });
  } catch (err: any) {
    logger.error('Database initialization error', err);
    return NextResponse.json({ error: err.message || 'Error initializing database' }, { status: 500 });
  }
}
