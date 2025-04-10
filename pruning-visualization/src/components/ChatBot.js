import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaChevronLeft, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// AI聊天机器人组件，改为可隐藏的侧边栏
function ChatBot({ pruneType, ratio, dataset }) {
  // 聊天消息记录
  const [messages, setMessages] = useState([
    { type: 'bot', text: '你好！有關剪枝方法的問題，請隨時提問。' }
  ]);
  
  // 用戶輸入的消息
  const [inputMessage, setInputMessage] = useState('');
  
  // 是否正在等待AI回应
  const [waiting, setWaiting] = useState(false);
  
  // 侧边栏是否可见
  const [isVisible, setIsVisible] = useState(false);
  
  // 创建一个引用，用于自动滚动到最新消息
  const messagesEndRef = useRef(null);
  
  // 鼠标悬停区域引用
  const hoverAreaRef = useRef(null);
  
  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 每当消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 添加悬停检测
  useEffect(() => {
    const checkHover = (e) => {
      const x = e.clientX;
      // 当鼠标在屏幕右侧15px范围内时显示侧边栏
      if (window.innerWidth - x < 15 && !isVisible) {
        setIsVisible(true);
      }
    };
    
    document.addEventListener('mousemove', checkHover);
    
    return () => {
      document.removeEventListener('mousemove', checkHover);
    };
  }, [isVisible]);
  
  // 发送消息给AI并获取回应
  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    // 添加用户消息到聊天记录
    const userMessage = { type: 'user', text: inputMessage };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setWaiting(true);
    
    try {
      // 发送POST请求到后端API
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: inputMessage,
        prune_type: pruneType,
        ratio: ratio,
        dataset: dataset
      });
      
      // 添加AI回应到聊天记录
      setMessages(prevMessages => [
        ...prevMessages, 
        { type: 'bot', text: response.data.message }
      ]);
    } catch (error) {
      console.error('聊天請求失敗:', error);
      // 添加錯誤消息到聊天記錄
      setMessages(prevMessages => [
        ...prevMessages, 
        { type: 'bot', text: '抱歉，我無法處理您的請求。請稍後再試。' }
      ]);
    } finally {
      setWaiting(false);
    }
  };
  
  // 处理键盘输入事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <>
      {/* 悬停检测区域 */}
      <div 
        ref={hoverAreaRef}
        className="position-fixed"
        style={{ 
          right: 0,
          top: 0,
          width: '15px',
          height: '100vh',
          zIndex: 1030
        }}
      />
      
      {/* 悬浮按钮，仅在侧边栏隐藏时显示 */}
      {!isVisible && (
        <div
          className="position-fixed d-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow"
          style={{
            right: '20px',
            bottom: '20px',
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            zIndex: 1031
          }}
          onClick={() => setIsVisible(true)}
        >
          <FaRobot size={24} />
        </div>
      )}
      
      {/* 聊天侧边栏 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="position-fixed bg-white shadow-lg"
            style={{
              right: 0,
              top: 0,
              width: '25%',
              height: '100vh',
              zIndex: 1040
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="d-flex flex-column h-100">
              {/* 标题栏 */}
              <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaRobot className="me-2" size={20} />
                  <h4 className="m-0">AI 助手</h4>
                </div>
                <button 
                  className="btn btn-sm btn-outline-light" 
                  onClick={() => setIsVisible(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* 聊天消息区域 */}
              <div 
                className="flex-grow-1 p-3 overflow-auto"
                style={{ height: 'calc(100vh - 125px)' }}
              >
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-3 d-flex ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div 
                      className={`p-3 rounded-3 ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                      style={{ maxWidth: '85%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {waiting && (
                  <div className="d-flex justify-content-start mb-3">
                    <div className="bg-light p-3 rounded-3">
                      <div className="spinner-grow spinner-grow-sm text-primary me-1" role="status">
                        <span className="visually-hidden">思考中...</span>
                      </div>
                      <div className="spinner-grow spinner-grow-sm text-primary me-1" role="status">
                        <span className="visually-hidden">思考中...</span>
                      </div>
                      <div className="spinner-grow spinner-grow-sm text-primary" role="status">
                        <span className="visually-hidden">思考中...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* 聊天输入区域 */}
              <div className="p-3 border-top">
                <div className="input-group">
                  <textarea 
                    className="form-control"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入你的問題..."
                    rows="2"
                    disabled={waiting}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={waiting || inputMessage.trim() === ''}
                  >
                    發送
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBot; 