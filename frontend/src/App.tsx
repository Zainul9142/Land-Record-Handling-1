import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LaunchAnimation } from './components/LaunchAnimation';
import { Navbar } from './components/Navbar';

import { AuthPage } from './pages/AuthPage';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LandSearchPage } from './pages/LandSearchPage';
import { LandProfilePage } from './pages/LandProfilePage';
import { CheckBeforeYouBuy } from './pages/CheckBeforeYouBuy';
import { MutationTrackerPage } from './pages/MutationTrackerPage';
import { StampDutyCalculatorPage } from './pages/StampDutyCalculatorPage';
import { MyBhoomiVaultPage } from './pages/MyBhoomiVaultPage';
import { ReportVerificationPage } from './pages/ReportVerificationPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LegalAdvisorPage } from './pages/LegalAdvisorPage';
import { GrievancePage } from './pages/GrievancePage';

export const AppContent: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [userRole, setUserRole] = useState<string>('CITIZEN');
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  return (
    <Router>
      {showIntro && <LaunchAnimation onComplete={() => setShowIntro(false)} />}
      
        <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={<HomePage lang={lang} />} />
            <Route path="/search" element={<LandSearchPage lang={lang} />} />
            <Route path="/land/:landIdentityId" element={<LandProfilePage lang={lang} />} />
            <Route path="/legal-advisor" element={<LegalAdvisorPage />} />
            <Route path="/complaints" element={<GrievancePage />} />
            <Route path="/check-buy" element={<CheckBeforeYouBuy />} />
            <Route path="/track-mutation" element={<MutationTrackerPage />} />
            <Route path="/track-mutation/:appNo" element={<MutationTrackerPage />} />
            <Route path="/stamp-duty" element={<StampDutyCalculatorPage />} />
            <Route path="/vault" element={<MyBhoomiVaultPage />} />
            <Route path="/verify/:reportId" element={<ReportVerificationPage />} />
            <Route path="/admin" element={<AdminDashboard userRole={userRole} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
