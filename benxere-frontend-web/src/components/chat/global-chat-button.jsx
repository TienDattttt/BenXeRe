import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterfaceV2 from './chat-interface-v2';
import ChatbotInterface from './chatbot-interface';
import websocketService from '../../services/websocket-service';
import authService from '../../services/auth-service';

const MessagePreview = ({ message, onClick, isActive }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.button
      whileHover={{ backgroundColor: '#f3f4f6' }}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
        isActive ? 'bg-blue-50' : ''
      }`}
    >
      <div className="relative">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">
            {message.partnerEmail ? message.partnerEmail[0].toUpperCase() : 'U'}
          </span>
        </div>
        {message.unreadCount > 0 && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium text-gray-900 flex justify-between">
          <span>{message.partnerEmail || `User ${message.partnerId}`}</span>
          <span className="text-xs text-gray-500">
            {formatTime(message.lastMessageTime)}
          </span>
        </div>
        <div className="text-sm text-gray-500 truncate">
          {message.lastMessage || 'Bắt đầu cuộc trò chuyện'}
        </div>
      </div>
    </motion.button>
  );
};

const GlobalChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const POLL_INTERVAL = 1000000; 

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const connectToWebSocket = async () => {
      if (isConnecting) return;
      
      setIsConnecting(true);
      try {
        const token = authService.getToken();
        if (token) {
          await websocketService.connect(token);
          console.log('WebSocket connected');
        }
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToWebSocket();

    const removeHandler = websocketService.onMessage(message => {
      console.log('Received message in global chat button:', message);
      fetchConversations();
    });

    const connectedHandler = () => {
      console.log('WebSocket connected event received');
      fetchConversations();
    };

    const errorHandler = (event) => {
      console.error('WebSocket error:', event.detail?.message);
    };

    window.addEventListener('chat-connected', connectedHandler);
    window.addEventListener('chat-error', errorHandler);

    return () => {
      removeHandler();
      window.removeEventListener('chat-connected', connectedHandler);
      window.removeEventListener('chat-error', errorHandler);
    };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversations = await websocketService.getConversations();
        console.log('Fetched conversations:', conversations);
        
        setRecentChats(conversations || []);
        
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();

    const interval = setInterval(fetchConversations, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const conversations = await websocketService.getConversations();
      console.log('Refreshed conversations:', conversations);
      
      setRecentChats(conversations || []);
      
      const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  const handleChatClick = (chat) => {
    setActiveChat(chat);
    setIsExpanded(true);
    
    if (chat.unreadCount > 0) {
      websocketService.markMessagesAsRead(chat.partnerId)
        .then(() => {
          fetchConversations();
        })
        .catch(error => {
          console.error('Error marking messages as read:', error);
        });
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setActiveChat(null);
    
    fetchConversations();
  };

  const handleChatbotClose = () => {
    setShowChatbot(false);
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2"
      >
        {/* Button Group */}
        <div className="flex space-x-2">
          {/* AI Chatbot Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChatbot(!showChatbot)}
            className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative ${showChatbot ? 'ring-2 ring-purple-300' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </motion.button>

          {/* User Chat Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Messages Pane */}
        <AnimatePresence>
          {isOpen && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
                <h3 className="font-semibold">Tin nhắn</h3>
                <button onClick={() => setIsOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {recentChats.length > 0 ? (
                  recentChats.map(chat => (
                    <MessagePreview
                      key={chat.partnerId}
                      message={chat}
                      onClick={() => handleChatClick(chat)}
                      isActive={activeChat?.partnerId === chat.partnerId}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Không có tin nhắn nào.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isExpanded && activeChat && (
          <ChatInterfaceV2
            receiverId={activeChat.partnerId}
            receiverEmail={activeChat.partnerEmail}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChatbot && (
          <ChatbotInterface onClose={handleChatbotClose} />
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalChatButton;