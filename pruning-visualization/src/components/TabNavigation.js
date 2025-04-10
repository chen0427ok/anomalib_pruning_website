import React from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaTable, FaChartLine } from 'react-icons/fa';

function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'metrics', label: '評估指標', icon: <FaChartBar /> },
    { id: 'visualization', label: '異常檢測視覺化', icon: <FaChartLine /> },
    { id: 'comparison', label: '剪枝效果比較', icon: <FaTable /> }
  ];

  return (
    <div className="flex mb-6 border-b border-gray-200">
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          className={`flex items-center py-3 px-4 text-sm font-medium mr-4 relative ${
            activeTab === tab.id
              ? 'text-[#8B5A2B] border-b-2 border-[#8B5A2B]'
              : 'text-gray-500 hover:text-[#A67C52]'
          }`}
          onClick={() => setActiveTab(tab.id)}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5A2B]"
              layoutId="underline"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

export default TabNavigation; 