import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaRobot, FaSpinner } from 'react-icons/fa';

function AIAssistant({ show, onClose, selectedPruneType, selectedRatio }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `您好！我是AI助手，可以回答關於${selectedPruneType}剪枝方法的問題。請問有什麼可以幫助您的嗎？` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 当选择的剪枝方法或比例改变时，更新欢迎消息
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        { 
          role: 'assistant', 
          content: `您好！我是AI助手，可以回答關於${selectedPruneType}剪枝方法的問題。請問有什麼可以幫助您的嗎？` 
        }
      ]);
    }
  }, [selectedPruneType, selectedRatio, messages.length]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // 发送请求到后端API
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: userMessage,
        prune_type: selectedPruneType,
        ratio: selectedRatio
      });

      // 添加AI回复到消息列表
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (error) {
      console.error('聊天請求出錯:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我無法處理您的請求。請稍後再試。' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 处理按Enter发送消息
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-0 right-0 w-[320px] h-full bg-white shadow-xl z-50 flex flex-col"
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] text-white flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="mr-2" size={20} />
              <h3 className="font-bold">AI助手</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-xl p-3 ${
                    msg.role === 'user' 
                      ? 'bg-[#8B5A2B] text-white rounded-tr-none'
                      : 'bg-white shadow-md rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] rounded-xl p-3 bg-white shadow-md rounded-tl-none flex items-center">
                  <FaSpinner className="animate-spin mr-2 text-[#8B5A2B]" />
                  <p className="text-sm">思考中...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="輸入您的問題..."
                className="flex-1 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#8B5A2B] focus:border-transparent outline-none resize-none"
                rows={2}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="ml-2 w-10 h-10 bg-[#8B5A2B] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AIAssistant; 