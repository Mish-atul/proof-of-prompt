import { useState } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Verify } from './pages/Verify';
import { MyProofs } from './pages/MyProofs';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'register':
        return <Register />;
      case 'verify':
        return <Verify />;
      case 'my-proofs':
        return <MyProofs />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        {renderPage()}
      </div>
    </WalletProvider>
  );
}

export default App;
