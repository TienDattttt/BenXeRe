import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import websocketService from '../../services/websocket-service';
import authService from '../../services/auth-service';
import { getMyInfo } from '../../services/user-service';

const ChatMessage = ({ message, isUser, onMessageRead }) => {
  useEffect(() => {
    if (!isUser && !message.isRead) {
      onMessageRead(message.senderId);
    }
  }, [message, isUser, onMessageRead]);

  const formattedTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('Message data:', {
    isUser,
    content: message.content,
    senderId: message.senderId,
    receiverId: message.receiverId
  });

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
        {message.content}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {formattedTime(message.sentAt)}
          {isUser && (
            <span className="ml-2">
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChatInterfaceV2 = ({ receiverId, receiverEmail, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userInfo = await getMyInfo();
        setCurrentUserId(userInfo.userId);
        setCurrentUserEmail(userInfo.email);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    let subscription = null;

    const connectToWebSocket = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          await websocketService.connect(token);
          console.log('WebSocket connected in chat interface');
          
          // Subscribe to user's message queue
          if (currentUserEmail) {
            subscription = websocketService.subscribe(
              `/user/${currentUserEmail}/queue/messages`,
              (message) => {
                console.log('Received new message:', message);
                if (
                  (message.senderId === parseInt(receiverId) && message.receiverId === currentUserId) ||
                  (message.senderId === currentUserId && message.receiverId === parseInt(receiverId))
                ) {
                  setMessages(prevMessages => {
                    const messageExists = prevMessages.some(msg => msg.id === message.id);
                    if (messageExists) {
                      return prevMessages;
                    }
                    return [...prevMessages, message];
                  });
                }
              }
            );
          }
        }
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setError('Failed to connect to chat server');
      }
    };

    connectToWebSocket();

    // Cleanup function
    return () => {
      if (subscription) {
        websocketService.unsubscribe(`/user/${currentUserEmail}/queue/messages`);
      }
    };
  }, [currentUserEmail, currentUserId, receiverId]);
  
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleMessageRead = async (senderId) => {
    try {
      await websocketService.markMessagesAsRead(senderId);
      console.log('Marked messages from', senderId, 'as read');
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.senderId === senderId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (!receiverId) return;
    
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const chatHistory = await websocketService.getChatHistory(receiverId);
        console.log('Chat history with', receiverId, ':', chatHistory);
        
        const sortedMessages = [...chatHistory].sort((a, b) => 
          new Date(a.sentAt) - new Date(b.sentAt)
        );
        
        const processedMessages = sortedMessages.map(msg => ({
          ...msg,
          senderId: parseInt(msg.senderId),
          receiverId: parseInt(msg.receiverId)
        }));
        
        console.log('Processed messages:', processedMessages.map(m => ({
          content: m.content,
          senderId: m.senderId,
          isCurrentUser: m.senderId === currentUserId
        })));
        
        setMessages(processedMessages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    };

    fetchChatHistory();
  }, [receiverId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      setError(null);
      const message = await websocketService.sendMessage(messageContent, receiverId);
      
      // Create a properly formatted message object for the sender's view
      const formattedMessage = {
        id: message.id,
        content: messageContent,
        senderId: currentUserId,
        receiverId: parseInt(receiverId),
        sentAt: new Date().toISOString(),
        isRead: false
      };
      
      setMessages(prevMessages => [...prevMessages, formattedMessage]);
      console.log('Message sent successfully:', formattedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (!receiverId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">
              {receiverEmail ? receiverEmail[0].toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">
              {receiverEmail || `User ${receiverId}`}
            </h3>
            <span className="text-sm text-blue-100">
              {websocketService.isConnected() ? 'Real-time' : 'Polling'}
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
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center p-4">No messages yet</div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.senderId === currentUserId}
              onMessageRead={handleMessageRead}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatInterfaceV2;