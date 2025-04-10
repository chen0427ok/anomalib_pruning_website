import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFilter, FaChartLine, FaDatabase, FaChartPie } from 'react-icons/fa';

// 这个组件包含选择剪枝方式和比例的下拉菜单
function SelectionPanel({ 
  selectedPruneType, 
  setSelectedPruneType, 
  selectedRatio, 
  setSelectedRatio, 
  selectedDataset,
  setSelectedDataset,
  setResults,
  setLoading
}) {
  // 可用的剪枝方式列表
  const pruneTypes = [
    { value: 'origin', label: '原始模型 (未剪枝)' },
    { value: 'magnitude', label: 'Magnitude Pruning' },
    { value: 'batch_norm', label: 'Batch Norm Pruning' },
    { value: 'growing_reg', label: 'Growing Reg' },
    { value: 'layer_adaptive', label: 'Layer Adaptive' },
    { value: 'group_norm', label: 'Group Norm' }
  ];
  
  // 可用的剪枝比例列表
  const ratios = [0.1, 0.3, 0.5, 0.7, 0.9];
  
  // MVTec数据集列表
  const datasets = [
    'bottle', 'capsule', 'grid', 'leather', 'metal_nut', 
    'tile', 'transistor', 'zipper', 'cable', 'carpet', 
    'hazelnut', 'pill', 'screw', 'toothbrush', 'wood'
  ];
  
  // 当用户点击"获取结果"按钮时调用此函数
  const fetchResults = async () => {
    setLoading(true);
    try {
      console.log(`正在請求數據，參數: prune_type=${selectedPruneType}, ratio=${selectedRatio}, dataset=${selectedDataset}`);
      
      // 使用axios向后端API发送GET请求
      const response = await axios.get(`http://localhost:8000/api/results`, {
        params: {
          prune_type: selectedPruneType,
          ratio: selectedRatio,
          dataset: selectedDataset
        }
      });
      
      console.log("API 響應:", response.data);
      
      // 將API返回的結果更新到狀態
      setResults(response.data);
    } catch (error) {
      console.error('獲取結果時出錯:', error);
      // 显示更详细的错误信息
      if (error.response) {
        console.error('錯誤響應數據:', error.response.data);
        console.error('錯誤狀態碼:', error.response.status);
        alert(`獲取數據失敗: ${error.response.data.detail || '未知錯誤'}`);
      } else if (error.request) {
        console.error('請求已發送但沒有收到響應');
        alert('伺服器沒有響應，請檢查後端服務是否運行');
      } else {
        console.error('設置請求時出錯:', error.message);
        alert(`請求錯誤: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      data-aos="fade-up"
    >
      <h2 className="text-2xl font-bold mb-6 text-[#3E312B] flex items-center">
        <FaFilter className="mr-2 text-[#8B5A2B]" />
        選擇剪枝參數
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 剪枝方式选择 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaChartLine className="mr-2 text-[#8B5A2B]" />
            剪枝方式
          </label>
          <select 
            value={selectedPruneType} 
            onChange={(e) => setSelectedPruneType(e.target.value)}
            className="block w-full px-4 py-3 bg-[#F5E8D7] text-[#3E312B] border-0 rounded-xl focus:ring-2 focus:ring-[#8B5A2B] transition-all duration-300"
          >
            {pruneTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* 剪枝比例选择 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            剪枝比例
          </label>
          <select 
            value={selectedRatio} 
            onChange={(e) => setSelectedRatio(parseFloat(e.target.value))}
            className="block w-full px-4 py-3 bg-[#F5E8D7] text-[#3E312B] border-0 rounded-xl focus:ring-2 focus:ring-[#8B5A2B] transition-all duration-300"
          >
            {ratios.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </select>
        </div>
        
        {/* 数据集选择 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaDatabase className="mr-2 text-[#8B5A2B]" />
            數據集
          </label>
          <select 
            value={selectedDataset} 
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="block w-full px-4 py-3 bg-[#F5E8D7] text-[#3E312B] border-0 rounded-xl focus:ring-2 focus:ring-[#8B5A2B] transition-all duration-300"
          >
            {datasets.map((dataset) => (
              <option key={dataset} value={dataset}>
                {dataset}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <motion.button 
        className="w-full py-3 px-6 bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium text-lg flex items-center justify-center"
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        onClick={fetchResults}
      >
        <FaChartPie className="mr-2" />
        獲取分析結果
      </motion.button>
    </motion.div>
  );
}

export default SelectionPanel; 