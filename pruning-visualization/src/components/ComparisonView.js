import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaChartBar, FaSync } from 'react-icons/fa';
import axios from 'axios';

function ComparisonView({ currentResults, selectedDataset }) {
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedMethods, setSelectedMethods] = useState(['magnitude']);
  const [loading, setLoading] = useState(false);
  const [selectedRatios, setSelectedRatios] = useState([0.5]);
  
  const pruneTypes = [
    { value: 'origin', label: '原始模型 (未剪枝)' },
    { value: 'magnitude', label: 'Magnitude Pruning' },
    { value: 'batch_norm', label: 'Batch Norm Pruning' },
    { value: 'growing_reg', label: 'Growing Reg' },
    { value: 'layer_adaptive', label: 'Layer Adaptive' },
    { value: 'group_norm', label: 'Group Norm' }
  ];
  
  // 可选的剪枝比例列表
  const ratioOptions = [0.1, 0.3, 0.5, 0.7, 0.9];
  
  // 获取比较数据
  const fetchComparisonData = async () => {
    if (selectedMethods.length === 0 || selectedRatios.length === 0) return;
    
    setLoading(true);
    try {
      // 為每個方法和比例組合收集數據請求
      const requests = [];
      const requestConfigs = [];
      
      selectedMethods.forEach(method => {
        // 如果是原始模型，則只需獲取一次數據（不考慮剪枝比例）
        // if (method === 'origin') {
        //   requests.push(
        //     axios.get(`http://localhost:8000/api/results`, {
        //       params: {
        //         prune_type: method,
        //         ratio: 0, // 原始模型剪枝比例為0
        //         dataset: selectedDataset
        //       }
        //     })
        //   );
        //   requestConfigs.push({ method, ratio: 0 });
        // } else {
          // 對於其他剪枝方法，獲取每個選定比例的數據
          selectedRatios.forEach(ratio => {
            requests.push(
              axios.get(`http://localhost:8000/api/results`, {
                params: {
                  prune_type: method,
                  ratio: ratio,
                  dataset: selectedDataset
                }
              })
            );
            requestConfigs.push({ method, ratio });
          });
        // }
      });
      
      // 并行请求所有数据
      const responses = await Promise.all(requests);
      const results = responses.map((res, index) => ({
        ...res.data,
        method: requestConfigs[index].method,
        ratio: requestConfigs[index].ratio
      }));
      
      // 整理為比較數據格式
      setComparisonData({
        results: results
      });
    } catch (error) {
      console.error('獲取比較數據時出錯:', error);
      alert('獲取比較數據失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentResults && currentResults.pruning_info) {
      // 如果有当前结果，将当前方法添加到比较中
      const currentMethod = currentResults.pruning_info.type || 'magnitude';
      const currentRatio = currentResults.pruning_info.ratio || 0.5;
      
      if (!selectedMethods.includes(currentMethod)) {
        setSelectedMethods(prev => [...prev, currentMethod]);
      }
      
      if (!selectedRatios.includes(currentRatio)) {
        setSelectedRatios(prev => [...prev, currentRatio]);
      }
    }
  }, [currentResults]);

  const toggleMethod = (method) => {
    if (selectedMethods.includes(method)) {
      // 至少保留一个方法
      if (selectedMethods.length > 1) {
        setSelectedMethods(prev => prev.filter(m => m !== method));
      }
    } else {
      setSelectedMethods(prev => [...prev, method]);
    }
  };
  
  const toggleRatio = (ratio) => {
    if (selectedRatios.includes(ratio)) {
      // 至少保留一个比例
      if (selectedRatios.length > 1) {
        setSelectedRatios(prev => prev.filter(r => r !== ratio));
      }
    } else {
      setSelectedRatios(prev => [...prev, ratio]);
    }
  };
  
  // 如果已有比较数据，生成柱状图
  const getComparisonChart = () => {
    if (!comparisonData || !comparisonData.results.length) return null;
    
    // 生成標籤：方法名稱 + 比例（原始模型例外）
    const labels = comparisonData.results.map(result => {
      const methodName = pruneTypes.find(t => t.value === result.method)?.label || result.method;
      // 如果是原始模型，不顯示比例
      return result.method === 'origin' ? methodName : `${methodName} (${result.ratio})`;
    });
    
    const datasets = [
      {
        label: '圖像 AUROC',
        data: comparisonData.results.map(r => r.metrics.image_AUROC),
        backgroundColor: 'rgba(139, 90, 43, 0.7)',
        borderColor: 'rgba(139, 90, 43, 1)',
        borderWidth: 1
      },
      {
        label: '圖像 F1 Score',
        data: comparisonData.results.map(r => r.metrics.image_F1Score),
        backgroundColor: 'rgba(166, 124, 82, 0.7)',
        borderColor: 'rgba(166, 124, 82, 1)',
        borderWidth: 1
      },
      {
        label: '像素 AUROC',
        data: comparisonData.results.map(r => r.metrics.pixel_AUROC),
        backgroundColor: 'rgba(210, 166, 111, 0.7)',
        borderColor: 'rgba(210, 166, 111, 1)',
        borderWidth: 1
      },
      {
        label: '像素 F1 Score',
        data: comparisonData.results.map(r => r.metrics.pixel_F1Score),
        backgroundColor: 'rgba(180, 140, 100, 0.7)',
        borderColor: 'rgba(180, 140, 100, 1)',
        borderWidth: 1
      }
    ];
    
    const chartData = {
      labels,
      datasets
    };
    
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `不同剪枝方法和比例在 ${selectedDataset} 數據集上的表現比較`
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 1
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };
    
    return (
      <div className="p-4">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  };
  
  // 生成参数量比较图表
  const getParameterChart = () => {
    if (!comparisonData || !comparisonData.results.length) return null;
    
    // 生成標籤：方法名稱 + 比例
    const labels = comparisonData.results.map(result => {
      const methodName = pruneTypes.find(t => t.value === result.method)?.label || result.method;
      return `${methodName} (${result.ratio})`;
    });
    
    // 将参数量字符串(如"9.48M")转换为数值(9.48)用于图表
    const parseParameter = (param) => {
      if (!param) return 0;
      const numMatch = param.match(/(\d+(\.\d+)?)/);
      return numMatch ? parseFloat(numMatch[1]) : 0;
    };
    
    const datasets = [
      {
        label: '模型參數量 (百萬)',
        data: comparisonData.results.map(r => parseParameter(r.metrics.parameter)),
        backgroundColor: 'rgba(100, 120, 140, 0.7)',
        borderColor: 'rgba(100, 120, 140, 1)',
        borderWidth: 1
      }
    ];
    
    const chartData = {
      labels,
      datasets
    };
    
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `不同剪枝方法和比例的模型參數量比較`
        }
      }
    };
    
    return (
      <div className="mt-8 p-4 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-[#3E312B]">參數量比較</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  };
  
  // 生成比较表格
  const getComparisonTable = () => {
    if (!comparisonData || !comparisonData.results.length) return null;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-sm">
          <thead>
            <tr className="bg-[#F5E8D7] text-[#8B5A2B]">
              <th className="py-3 px-4 text-left">剪枝方法</th>
              <th className="py-3 px-4 text-center">剪枝比例</th>
              <th className="py-3 px-4 text-center">圖像 AUROC</th>
              <th className="py-3 px-4 text-center">圖像 F1</th>
              <th className="py-3 px-4 text-center">像素 AUROC</th>
              <th className="py-3 px-4 text-center">像素 F1</th>
              <th className="py-3 px-4 text-center">參數量</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.results.map((result, index) => {
              const methodName = pruneTypes.find(t => t.value === result.method)?.label || result.method;
              return (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF7F2]"}>
                  <td className="py-3 px-4 font-medium">{methodName}</td>
                  <td className="py-3 px-4 text-center">
                    {result.method === 'origin' ? '-' : result.ratio}
                  </td>
                  <td className="py-3 px-4 text-center">{result.metrics.image_AUROC.toFixed(4)}</td>
                  <td className="py-3 px-4 text-center">{result.metrics.image_F1Score.toFixed(4)}</td>
                  <td className="py-3 px-4 text-center">{result.metrics.pixel_AUROC.toFixed(4)}</td>
                  <td className="py-3 px-4 text-center">{result.metrics.pixel_F1Score.toFixed(4)}</td>
                  <td className="py-3 px-4 text-center font-medium">{result.metrics.parameter || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-lg"
      data-aos="fade-up"
    >
      <h2 className="text-2xl font-bold mb-6 text-[#3E312B] flex items-center">
        <FaChartBar className="mr-2 text-[#8B5A2B]" />
        剪枝方法效果比較
      </h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">選擇要比較的剪枝方法：</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {pruneTypes.map(type => (
            <motion.button
              key={type.value}
              onClick={() => toggleMethod(type.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMethods.includes(type.value)
                  ? 'bg-[#8B5A2B] text-white'
                  : 'bg-[#F5E8D7] text-[#8B5A2B] hover:bg-[#E6D8C7]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
        
        <div className="mt-4 mb-4">
          <p className="text-sm text-gray-600 mb-3">選擇剪枝比例 (可多選)：</p>
          <div className="flex flex-wrap gap-2">
            {ratioOptions.map(ratio => (
              <motion.button
                key={ratio}
                onClick={() => toggleRatio(ratio)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRatios.includes(ratio)
                    ? 'bg-[#8B5A2B] text-white'
                    : 'bg-[#F5E8D7] text-[#8B5A2B] hover:bg-[#E6D8C7]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {ratio}
              </motion.button>
            ))}
          </div>
        </div>
        
        <motion.button
          onClick={fetchComparisonData}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSync className="animate-spin mr-2" />
              加載中...
            </>
          ) : (
            <>
              <FaChartBar className="mr-2" />
              比較選中的方法和比例
            </>
          )}
        </motion.button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5A2B]"></div>
        </div>
      ) : comparisonData ? (
        <div className="space-y-8">
          {getComparisonChart()}
          {getParameterChart()}
          {getComparisonTable()}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          請選擇需要比較的剪枝方法和比例，然後點擊"比較選中的方法和比例"按鈕
        </div>
      )}
    </motion.div>
  );
}

export default ComparisonView; 