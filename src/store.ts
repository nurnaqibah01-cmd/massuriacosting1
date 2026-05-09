import { useState, useEffect } from 'react';
import { CostingReport } from './types';

export function useReports() {
  const [reports, setReports] = useState<CostingReport[]>(() => {
    const saved = localStorage.getItem('mas-suria-reports');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('mas-suria-reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = (report: CostingReport) => {
    setReports([report, ...reports]); // prepend
  };

  const updateReport = (report: CostingReport) => {
    setReports(reports.map((r) => (r.id === report.id ? report : r)));
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  return { reports, addReport, updateReport, deleteReport };
}
