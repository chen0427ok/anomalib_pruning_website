import React from 'react';
import { motion } from 'framer-motion';

function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-[#8B5A2B] to-[#A67C52] text-white py-20 relative overflow-hidden">
      {/* Wave Background */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#F7F9FC" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,154.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          PatchCore 剪枝方法視覺化系統
        </motion.h1>
        
        <motion.p 
          className="text-xl text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          深入探索不同剪枝方法對模型性能的影響，助您找到高效輕量的異常檢測網絡
        </motion.p>
      </div>
    </div>
  );
}

export default HeroSection; 