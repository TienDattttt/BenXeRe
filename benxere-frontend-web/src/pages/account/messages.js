import React, { useState, useEffect } from 'react';
import AccountSidebarLayout from '../../components/layouts/account-sidebar-layout';
import { chatService } from '../../services/chat-service';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ChatInterfaceV2 from '../../components/chat/chat-interface-v2';
import '../../styles/account-modern-theme.css';

const ChatContact = ({ chat, onClick, isSelected }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      className={`neo-card cursor-pointer overflow-hidden ${
        isSelected ? 'border-blue-500 border-2' : ''
      }`}
      whileHover={{ scale: !prefersReducedMotion && 1.02 }}
      whileTap={{ scale: !prefersReducedMotion && 0.98 }}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
              whileHover={{ scale: !prefersReducedMotion && 1.1 }}
            >
              {chat.firstName[0].toUpperCase()}
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {`${chat.firstName} ${chat.lastName}`}
              </h3>
              <span className="neo-badge text-xs">
                {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-gray-600 text-sm truncate">
              {chat.lastMessage.text}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  // useEffect(() => {
  //   const fetchChats = async () => {
  //     try {
  //       setError(null);
  //       const recentChats = await chatService.getRecentChats();
  //       setChats(recentChats);
  //     } catch (error) {
  //       console.error('Error fetching chats:', error);
  //       setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchChats();
  //   const interval = setInterval(() => {
  //     if (!error) {
  //       fetchChats();
  //     }
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, [error]);

  // const handleChatSelect = (chat) => {
  //   setSelectedChat(chat);
  // };

  const handleClose = () => {
    setSelectedChat(null);
  };

  return (
    <AccountSidebarLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="neo-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Modern Chat Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'pulse 4s ease-in-out infinite'
              }}
            />
            <div className="relative z-10">
              <motion.h2 
                className="text-2xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Trung Tâm Liên Lạc
              </motion.h2>
              <motion.p 
                className="text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Kết nối với nhà xe và hỗ trợ viên
              </motion.p>
            </div>
          </div>

          {/* Chat List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="neo-spinner"></div>
              </div>
            ) : error ? (
              <motion.div 
                className="neo-card bg-red-50 p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-600 mb-4">{error}</p>
                <motion.button
                  onClick={() => setError(null)}
                  className="neo-button"
                  whileHover={{ scale: !prefersReducedMotion && 1.02 }}
                  whileTap={{ scale: !prefersReducedMotion && 0.98 }}
                >
                  Thử lại
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {chats.length === 0 ? (
                    <motion.div
                      className="neo-card p-12 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="text-6xl mb-4"
                      >
                        💬
                      </motion.div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">
                        Chưa có cuộc trò chuyện nào
                      </h3>
                      <p className="text-gray-500">
                        Hãy bắt đầu trò chuyện với nhà xe!
                      </p>
                    </motion.div>
                  ) : (
                    chats.map((chat, index) => (
                      <motion.div
                        key={chat.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChatContact
                          chat={chat}
                          // onClick={() => handleChatSelect(chat)}
                          isSelected={selectedChat?.userId === chat.userId}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Modal */}
        <AnimatePresence>
          {selectedChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl neo-card overflow-hidden"
              >
                <ChatInterfaceV2
                  receiverId={selectedChat.userId}
                  firstName={selectedChat.firstName}
                  lastName={selectedChat.lastName}
                  onClose={handleClose}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AccountSidebarLayout>
  );
};

export default MessagesPage;