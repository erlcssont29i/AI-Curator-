import React, { useState } from 'react';
import Dashboard from './views/Dashboard';
import AdminPanel from './views/AdminPanel';

const App: React.FC = () => {
  // Simple view state routing
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'home' ? (
        <Dashboard onNavigateToAdmin={() => setCurrentView('admin')} />
      ) : (
        <AdminPanel onNavigateToHome={() => setCurrentView('home')} />
      )}
    </div>
  );
};

export default App;