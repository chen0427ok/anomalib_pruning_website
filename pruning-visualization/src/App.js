import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import ResultsDisplay from './components/ResultsDisplay';
import SelectionPanel from './components/SelectionPanel';
import AIAssistant from './components/AIAssistant';
import HeroSection from './components/HeroSection';
import { FaRobot } from 'react-icons/fa';
import './styles/custom.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

// App组件是整个应用的入口点
function App() {
  // 使用React的useState钩子管理应用状态
  // 这些状态变量将存储用户的选择和API返回的结果
  const [selectedPruneType, setSelectedPruneType] = useState('magnitude'); // 默认剪枝方式
  const [selectedRatio, setSelectedRatio] = useState(0.1); // 默认剪枝比例
  const [selectedDataset, setSelectedDataset] = useState('bottle'); // 默认数据集
  const [results, setResults] = useState(null); // 存储API返回的结果
  const [loading, setLoading] = useState(false); // 加载状态
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: false
    });
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAF7F2', 
      fontFamily: 'Inter, sans-serif' 
    }}>
      {/* Hero Section */}
      <HeroSection />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1rem' 
      }}>
        {/* 剪枝参数选择区 */}
        <section className="mb-12">
          <SelectionPanel 
            selectedPruneType={selectedPruneType}
            setSelectedPruneType={setSelectedPruneType}
            selectedRatio={selectedRatio}
            setSelectedRatio={setSelectedRatio}
            selectedDataset={selectedDataset}
            setSelectedDataset={setSelectedDataset}
            setResults={setResults}
            setLoading={setLoading}
          />
        </section>
        
        {/* 结果显示区 */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center my-5 py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">加载中...</span>
            </div>
            <span className="ms-3 fs-4">正在获取数据...</span>
          </div>
        ) : (
          results && <section>
            <ResultsDisplay 
              results={results} 
              selectedPruneType={selectedPruneType} 
              selectedRatio={selectedRatio}
              selectedDataset={selectedDataset}
            />
          </section>
        )}
      </div>
      
      {/* AI Assistant Button */}
      <button
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'linear-gradient(to right, #8B5A2B, #A67C52)',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onClick={() => setShowAIAssistant(!showAIAssistant)}
      >
        <FaRobot size={24} />
      </button>
      
      {/* AI Assistant */}
      <AIAssistant 
        show={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
        selectedPruneType={selectedPruneType}
        selectedRatio={selectedRatio}
      />
    </div>
  );
}

export default App;
