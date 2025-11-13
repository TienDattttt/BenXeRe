import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../../services/chat-service';

const ChatMessage = ({ message, isUser, onMessageRead }) => {
  useEffect(() => {
    if (!isUser && !message.isRead) {
      onMessageRead(message.id);
    }
  }, [message.id, isUser, message.isRead, onMessageRead]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        {message.text}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {!isUser && !message.isRead && 
            <span className="ml-2 text-blue-500">•</span>
          }
        </div>
      </div>
    </motion.div>
  );
};

const ChatInterface = ({ bus, onClose, onUnreadCountChange }) => {
  console.log("Chat Interface Props:", { bus });
  const owner = bus?.owner;
  console.log("Owner data:", owner);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const POLL_INTERVAL = 2000000; 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMessageRead = async (messageId) => {
    await chatService.markMessageAsRead(messageId);
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
    if (onUnreadCountChange && owner?.userId) {
      const unreadCount = await chatService.getUnreadCount(owner.userId);
      onUnreadCountChange(unreadCount);
    }
  };

  useEffect(() => {
    if (typeof bus?.owner?.userId !== 'number') {
      console.log("Invalid owner userId format, skipping fetch");
      return;
    }
    
    const fetchMessages = async () => {
      try {
        setError(null);
        console.log("Fetching messages for recipient userId:", bus.owner.userId);
        const messages = await chatService.getConversation(bus.owner.userId);
        console.log("Received messages:", messages);
        setMessages(messages);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const pollInterval = setInterval(fetchMessages, POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [bus?.owner?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!bus || !bus.owner || typeof bus.owner.userId !== 'number') {
    console.error("Missing or invalid bus/owner data:", bus);
    return null;
  }

  const handleSend = async (e) => {
    e.preventDefault();
    console.log("Handle send triggered", { message: newMessage, busOwner: bus?.owner });
    
    if (!newMessage.trim() || typeof bus?.owner?.userId !== 'number') {
      console.log("Missing required data", { message: newMessage, ownerId: bus?.owner?.userId });
      return;
    }

    setIsTyping(true);
    setNewMessage('');

    try {
      setError(null);
      console.log("Sending message to owner userId:", bus.owner.userId, "Message:", newMessage.trim());
      const messageToSend = newMessage.trim();
      console.log("About to send message", {
        receiverId: bus.owner.userId,
        messageText: messageToSend
      });
      
      const sentMessage = await chatService.sendMessage(bus.owner.userId, messageToSend);
      console.log("Message sent successfully:", sentMessage);
      setMessages(prevMessages => [...prevMessages, sentMessage]);
    } catch (error) {
      setError(error.message);
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">
              {bus.owner.firstName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">
              {`${bus.owner.firstName} ${bus.owner.lastName}`}
            </h3>
            <span className="text-sm text-blue-100">
              Online
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-blue-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.isUser}
              onMessageRead={handleMessageRead}
            />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2 text-gray-500"
          >
            <span className="text-sm">Đang trả lời</span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                transition: { repeat: Infinity, duration: 1 }
              }}
              className="w-2 h-2 bg-gray-500 rounded-full"
            />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
        {error && (
          <div className="p-3 mt-2 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isTyping}
            className={`${
              isTyping ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-4 py-2 rounded-lg transition-colors`}
          >
            Gửi
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatInterface;
