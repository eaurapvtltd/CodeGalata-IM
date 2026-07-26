'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileSpreadsheet, Check, AlertTriangle, FileText } from 'lucide-react';
import { addStudentsToBatch } from '@/lib/db';
import { EmailService } from '@/lib/emailService';
import toast from 'react-hot-toast';

interface StudentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId: string;
  collegeName: string;
  batchId: string;
  batchName: string;
  onSuccess: () => void;
}

interface ParsedStudent {
  studentName: string;
  cgpa: number;
  email: string;
}

export function StudentUploadModal({
  isOpen,
  onClose,
  collegeId,
  collegeName,
  batchId,
  batchName,
  onSuccess,
}: StudentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.xlsx')) {
        setErrorMsg('Only .xlsx format Excel files are supported.');
        return;
      }
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (rawJson.length === 0) {
          setErrorMsg('The uploaded Excel sheet is empty.');
          setParsedData([]);
          return;
        }

        // Map and validate columns
        const formattedStudents: ParsedStudent[] = [];
        for (let idx = 0; idx < rawJson.length; idx++) {
          const row = rawJson[idx];
          
          // Case-insensitive key finder helper
          const findVal = (possibleKeys: string[]) => {
            const rowKeys = Object.keys(row);
            const matchedKey = rowKeys.find(k => possibleKeys.some(pk => k.trim().toLowerCase() === pk.toLowerCase()));
            return matchedKey ? row[matchedKey] : undefined;
          };

          const studentName = findVal(['Student Name', 'StudentName', 'Name']);
          const cgpaRaw = findVal(['CGPA', 'Cgpa', 'GPA']);
          const email = findVal(['Email Address', 'EmailAddress', 'Email', 'College Email']);

          if (studentName && email) {
            formattedStudents.push({
              studentName: String(studentName).trim(),
              cgpa: Number(cgpaRaw) || 0.0,
              email: String(email).trim(),
            });
          }
        }

        if (formattedStudents.length === 0) {
          setErrorMsg('Could not find expected columns: "Student Name", "CGPA", "Email Address" in sheet.');
          setParsedData([]);
        } else {
          setParsedData(formattedStudents);
        }
      } catch (err: any) {
        setErrorMsg('Error parsing Excel file. Please ensure it is a valid .xlsx file.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsProcessing(true);
    try {
      // 1. Save students to database
      const imported = addStudentsToBatch(collegeId, batchId, parsedData);

      // 2. Queue emails via EmailService architecture placeholder
      await EmailService.bulkQueueStudentActivations(parsedData, collegeName);

      toast.success(`Successfully imported ${imported.length} students into ${batchName}!`);
      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setParsedData([]);
    } catch (err: any) {
      toast.error('Failed to import students: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Upload Students via Excel</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Import student roster for batch <span className="font-semibold text-emerald-600 dark:text-emerald-400">{batchName}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Format Instruction Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/50 text-xs space-y-2">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-500" />
              Expected Excel (.xlsx) Column Format:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono font-bold text-zinc-600 dark:text-zinc-300">
              <span className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">Student Name</span>
              <span className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">CGPA</span>
              <span className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-700">Email Address</span>
            </div>
          </div>

          {/* File Drag and Drop Box */}
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 mx-auto text-zinc-400 group-hover:text-emerald-500 transition-colors mb-3" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {file ? file.name : 'Click or drop .xlsx Excel file here'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Supports standard Microsoft Excel spreadsheets (.xlsx)</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Parsed Roster Preview ({parsedData.length} Students)
                </span>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Validated
                </span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">CGPA</th>
                      <th className="px-4 py-2.5">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {parsedData.map((st, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="px-4 py-2 text-zinc-400">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">{st.studentName}</td>
                        <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300 font-mono">{st.cgpa}</td>
                        <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{st.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={parsedData.length === 0 || isProcessing}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            {isProcessing ? 'Importing...' : `Import ${parsedData.length} Students`}
          </button>
        </div>
      </div>
    </div>
  );
}
