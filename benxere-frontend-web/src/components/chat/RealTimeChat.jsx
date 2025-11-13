import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import websocketService from '../../services/websocket-service';
import { getCurrentUserId } from '../../services/user-service';
import Typography from '../core/typography';
import CloseIcon from '@mui/icons-material/Close';
import CallIcon from '@mui/icons-material/Call';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';

const MessageBubble = ({ message, isCurrentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[75%] p-3 rounded-2xl ${
          isCurrentUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <div>{message.content}</div>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
          {isCurrentUser && <span className="ml-2">{message.isRead ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </motion.div>
  );
};

const VoiceCallOverlay = ({ onAccept, onDecline, caller }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CallIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">Incoming Call</h3>
          <p className="text-gray-600">{caller || 'Unknown caller'}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-500 text-white p-3 rounded-full"
            onClick={onDecline}
          >
            <PhoneDisabledIcon />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white p-3 rounded-full"
            onClick={onAccept}
          >
            <CallIcon />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const RealTimeChat = ({ 
  otherUserId,
  otherUserName,
  title = "Chat", 
  onClose,
  initialMessages = []
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isUsingPolling, setIsUsingPolling] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    // Function to handle WebSocket connection events
    const handleConnectionChange = (event) => {
      if (event.type === 'chat-disconnected') {
        setConnectionStatus('disconnected');
        // Auto-retry connection after a brief delay
        setTimeout(() => {
          if (connectionStatus !== 'connecting') {
            console.log('Auto-retrying WebSocket connection...');
            setConnectionStatus('connecting');
            websocketService.connect()
              .then(() => {
                setConnectionStatus('connected');
              })
              .catch(err => {
                console.error('Auto-retry failed:', err);
                setConnectionStatus('error');
                setError('Connection failed. Please try again.');
              });
          }
        }, 3000);
      } else if (event.type === 'chat-error') {
        // Check if we're using polling fallback
        if (event.detail?.usingPolling) {
          // If we're using polling due to server-side channel issues
          setConnectionStatus('connected'); // We're actually connected, just via polling
          setError('Using message polling due to WebSocket unavailability');
        } else {
          setConnectionStatus('error');
          setError(event.detail?.message || 'An error occurred with the chat connection');
        }
      } else if (event.type === 'chat-connected') {
        setConnectionStatus('connected');
        
        // Check if we're using polling
        if (event.detail?.usingPolling) {
          console.log('Connected using polling fallback');
          setIsUsingPolling(true);
          setError('Connected using polling fallback. Messages may be delayed.');
        } else {
          setIsUsingPolling(false);
          setError(null);
        }
      }
    };

    // Add event listeners
    window.addEventListener('chat-disconnected', handleConnectionChange);
    window.addEventListener('chat-error', handleConnectionChange);
    window.addEventListener('chat-connected', handleConnectionChange);

    // Clean up on unmount
    return () => {
      window.removeEventListener('chat-disconnected', handleConnectionChange);
      window.removeEventListener('chat-error', handleConnectionChange);
      window.removeEventListener('chat-connected', handleConnectionChange);
    };
  }, [connectionStatus]);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Initializing chat with user:', otherUserId);
        
        const currentUserId = await getCurrentUserId();
        console.log('Current user ID:', currentUserId);
        setUserId(currentUserId);
        
        // Set user ID for WebSocket service
        websocketService.userId = currentUserId;
        
        console.log('Connecting to WebSocket...');
        setConnectionStatus('connecting');
        
        try {
          await websocketService.connect();
          console.log('WebSocket connected successfully');
          setConnectionStatus('connected');
        } catch (wsError) {
          console.error('WebSocket connection failed:', wsError);
          setError('Failed to connect to chat server. Please check your internet connection.');
          setConnectionStatus('error');
          setIsLoading(false);
          return;
        }
        
        // Register message handler
        const unsubscribe = websocketService.onMessage(handleNewMessage);
        
        // Fetch chat history
        console.log('Fetching chat history with user:', otherUserId);
        try {
          const history = await websocketService.getChatHistory(otherUserId);
          console.log('Received chat history:', history);
          if (history && Array.isArray(history)) {
            setMessages(history);
          }
        } catch (historyError) {
          console.error('Failed to fetch chat history:', historyError);
          // Continue even if history fetch fails
        }
        
        // Mark messages as read
        websocketService.markMessagesAsRead(otherUserId);
        
        return () => {
          // Clean up message handler
          unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err.message || 'Failed to connect to chat. Please try again.');
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (otherUserId) {
      initialize();
    } else {
      console.error('No user ID provided');
      setError('No user ID provided. Cannot initialize chat.');
    }
    
    // Clean up on unmount
    return () => {
      // No need to disconnect, as the WebSocketService is a singleton
      // that may be used by other components
    };
  }, [otherUserId]);
  
  // Handle new incoming messages
  const handleNewMessage = (message) => {
    console.log('Received new message:', message);
    
    // Only process messages from/to the other user we're chatting with
    if ((message.senderId === otherUserId && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === otherUserId)) {
      
      setMessages(prevMessages => {
        // Check if this message already exists
        const messageExists = prevMessages.some(msg => 
          (msg.id && msg.id === message.id) || 
          (msg.messageId && msg.messageId === message.messageId)
        );
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
      
      // Mark message as read if received from other user
      if (message.senderId === otherUserId && !message.isRead) {
        websocketService.markMessagesAsRead(otherUserId);
      }
    }
  };
  
  const sendMessage = async () => {
    if (!messageInput.trim() || connectionStatus !== 'connected') return;
    
    try {
      setIsLoading(true);
      
      const messageContent = messageInput.trim();
      
      // Create a temporary message object matching ChatMessageResponse format
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: userId,
        senderName: 'You',
        receiverId: otherUserId,
        receiverName: otherUserName,
        sentAt: new Date().toISOString(),
        isRead: false
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setMessageInput('');
      
      await websocketService.sendMessage(messageContent, otherUserId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message || 'Unknown error'}`);
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => typeof msg.id === 'string' ? !msg.id.startsWith('temp-') : true)
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const retryConnection = async () => {
    setError(null);
    setConnectionStatus('connecting');
    try {
      await websocketService.connect();
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setError('Failed to reconnect. Please try again.');
      setConnectionStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">
              {title[0]?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-white">
              {title}
            </Typography>
            {connectionStatus === 'connected' ? (
              <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">Online</span>
            ) : connectionStatus === 'connecting' ? (
              <span className="text-xs bg-yellow-500 px-2 py-0.5 rounded-full">Connecting...</span>
            ) : (
              <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full">Offline</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors"
          >
            <CloseIcon />
          </motion.button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {connectionStatus === 'error' && (
              <div className="p-4 bg-red-50 rounded-lg mb-4 text-center">
                <p className="text-red-600 mb-2">{error || 'Connection error'}</p>
                <button 
                  onClick={retryConnection}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Retry Connection
                </button>
              </div>
            )}
            
            {connectionStatus === 'connected' && isUsingPolling && (
              <div className="p-4 bg-yellow-50 rounded-lg mb-4 text-center">
                <p className="text-yellow-700 mb-2">
                  <span className="font-medium">Using message polling: </span>
                  The chat server cannot use real-time connections right now. 
                  Messages may be delayed, but will still be delivered.
                </p>
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id || message.messageId || index}
                  message={message}
                  isCurrentUser={message.senderId === userId}
                />
              ))}
            </AnimatePresence>
            
            {error && connectionStatus !== 'error' && !isUsingPolling && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              connectionStatus !== 'connected' 
                ? "Waiting for connection..." 
                : isUsingPolling 
                  ? "Using message polling - type and send (may be delayed)..." 
                  : "Type your message..."
            }
            className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
            rows="1"
            disabled={connectionStatus !== 'connected'}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!messageInput.trim() || isLoading || connectionStatus !== 'connected'}
            className={`p-3 rounded-lg ${
              !messageInput.trim() || isLoading || connectionStatus !== 'connected'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              <SendIcon />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChat;