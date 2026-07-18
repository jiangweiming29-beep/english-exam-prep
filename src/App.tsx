import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import Upload from '@/pages/Upload';
import QuestionsAnalysis from '@/pages/QuestionsAnalysis';
import CrossAnalysis from '@/pages/CrossAnalysis';
import PreviewMap from '@/pages/PreviewMap';
import TextbookMapping from '@/pages/TextbookMapping';
import PreviewPlan from '@/pages/PreviewPlan';
import FullReport from '@/pages/FullReport';
import { AnalysisLayout } from '@/components/AnalysisLayout';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

function AnalysisRoute({ children }: { children: React.ReactNode }) {
  return <AnalysisLayout>{children}</AnalysisLayout>;
}

export default function App() {
  const { initMockData, courses } = useAppStore();

  useEffect(() => {
    if (courses.length === 0) {
      initMockData();
    }
  }, [courses.length, initMockData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        
        <Route
          path="/analysis/:id/questions"
          element={
            <AnalysisRoute>
              <QuestionsAnalysis />
            </AnalysisRoute>
          }
        />
        <Route
          path="/analysis/:id/cross"
          element={
            <AnalysisRoute>
              <CrossAnalysis />
            </AnalysisRoute>
          }
        />
        <Route
          path="/analysis/:id/map"
          element={
            <AnalysisRoute>
              <PreviewMap />
            </AnalysisRoute>
          }
        />
        <Route
          path="/analysis/:id/textbook"
          element={
            <AnalysisRoute>
              <TextbookMapping />
            </AnalysisRoute>
          }
        />
        <Route
          path="/analysis/:id/plan"
          element={
            <AnalysisRoute>
              <PreviewPlan />
            </AnalysisRoute>
          }
        />
        <Route
          path="/analysis/:id/report"
          element={
            <AnalysisRoute>
              <FullReport />
            </AnalysisRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
