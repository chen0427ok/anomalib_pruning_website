import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { FaChartBar, FaNetworkWired, FaImage } from 'react-icons/fa';
import TabNavigation from './TabNavigation';
import ComparisonView from './ComparisonView';

// 注册ChartJS组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ResultsDisplay({ results, selectedPruneType, selectedRatio, selectedDataset }) {
  const [activeTab, setActiveTab] = useState('metrics');
  
  if (!results) return null;
  
  // 使用 Netron 示例模型
  const netronUrl = `https://netron.app/`;
  
  // 准备图表数据
  const chartData = {
    labels: ['Image AUROC', 'Image F1 Score', 'Pixel AUROC', 'Pixel F1 Score'],
    datasets: [
      {
        label: '評估指標',
        data: [
          results.metrics.image_AUROC,
          results.metrics.image_F1Score,
          results.metrics.pixel_AUROC,
          results.metrics.pixel_F1Score
        ],
        backgroundColor: [
          'rgba(139, 90, 43, 0.7)',
          'rgba(166, 124, 82, 0.7)',
          'rgba(210, 166, 111, 0.7)',
          'rgba(180, 140, 100, 0.7)'
        ],
        borderColor: [
          'rgba(139, 90, 43, 1)',
          'rgba(166, 124, 82, 1)',
          'rgba(210, 166, 111, 1)',
          'rgba(180, 140, 100, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // 图表配置
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '性能評估指標'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 1
      }
    }
  };
  
  // 评估指标视图
  const MetricsView = () => (
    <>
      {/* 评估指标 */}
      <motion.div 
        className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-lg mb-10"
        data-aos="fade-up"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#3E312B] flex items-center">
          <FaChartBar className="mr-2 text-[#8B5A2B]" />
          評估指標
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Image AUROC', value: results.metrics.image_AUROC.toFixed(4) },
            { label: 'Image F1 Score', value: results.metrics.image_F1Score.toFixed(4) },
            { label: 'Pixel AUROC', value: results.metrics.pixel_AUROC.toFixed(4) },
            { label: 'Pixel F1 Score', value: results.metrics.pixel_F1Score.toFixed(4) },
            { label: '參數量', value: results.metrics.parameter || 'N/A' }
          ].map((metric, index) => (
            <motion.div 
              key={index}
              className="bg-[#F5E8D7] rounded-xl p-4 transition-all duration-300 hover:shadow-md"
              whileHover={{ y: -5 }}
            >
              <p className="text-sm text-[#8B5A2B] font-medium">{metric.label}</p>
              <p className="text-2xl font-bold text-[#3E312B] mt-1">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* 性能可视化 */}
      <motion.div 
        className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-lg mb-10"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#3E312B] flex items-center">
          <FaChartBar className="mr-2 text-[#8B5A2B]" />
          性能視覺化
        </h2>
        <div className="p-4">
          <Bar data={chartData} options={chartOptions} />
        </div>
        
        <div className="mt-4 p-4 bg-[#F5E8D7] rounded-lg">
          <p className="font-medium text-[#3E312B]">
            模型參數量: <span className="font-bold">{results.metrics.parameter || 'N/A'}</span>
            {results.metrics.parameter && 
              <span className="ml-2 text-sm text-gray-600">
                (剪枝比例: {selectedRatio})
              </span>
            }
          </p>
        </div>
      </motion.div>
    </>
  );
  
  // 可视化视图
  const VisualizationView = () => (
    <>
      {/* 模型结构 */}
      <motion.div 
        className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-lg mb-10"
        data-aos="fade-up"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#3E312B] flex items-center">
          <FaNetworkWired className="mr-2 text-[#8B5A2B]" />
          模型結構
        </h2>
        <div className="p-4 text-center">
          <iframe 
            src={netronUrl}
            width="100%" 
            height="600px" 
            frameBorder="0"
            title="模型结构可视化"
            className="rounded-xl shadow-sm"
          />
          <p className="mt-3 text-gray-500 text-sm">
            互動式模型視覺化，可點擊節點查看詳情
          </p>
        </div>
      </motion.div>
      
      {/* 示例图片 */}
      <motion.div 
        className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-lg"
        data-aos="fade-up"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#3E312B] flex items-center">
          <FaImage className="mr-2 text-[#8B5A2B]" />
          示例圖片
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {results.example_images.map((img, index) => (
            <motion.div 
              key={index}
              className="bg-[#F5E8D7] rounded-xl p-3 text-center transition-all duration-300 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={img} 
                alt={`示例 ${index + 1}`} 
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                }}
              />
              <p className="mt-2 text-[#8B5A2B] font-medium">示例 {index + 1}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
  
  return (
    <div className="space-y-6">
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'metrics' && <MetricsView />}
      {activeTab === 'visualization' && <VisualizationView />}
      {activeTab === 'comparison' && (
        <ComparisonView 
          currentResults={results} 
          selectedDataset={selectedDataset}
        />
      )}
    </div>
  );
}

export default ResultsDisplay; 