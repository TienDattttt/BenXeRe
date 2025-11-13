import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import chatbotService from '../../services/chatbot-service';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Helper function to format image URLs
const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  return `${API_BASE_URL}/${imageUrl}`;
};

const BotMessage = ({ content, data, intent }) => {
  // Determine if message has a special format based on data/intent
  const hasData = data && Object.keys(data).length > 0;
  
  // Check if data is for reviews based on intent or data structure
  const isReviewIntent = intent === 'danh_gia_nha_xe';
  const containsRatingData = Array.isArray(data) && data.length > 0 && data[0].rating !== undefined;
  const isReviewData = isReviewIntent || containsRatingData;
  
  // Only check for schedule data if not a review intent
  const isScheduleData = !isReviewIntent && Array.isArray(data) && data.length > 0 && data[0].scheduleId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
          <span className="text-blue-600 text-sm">🤖</span>
        </div>
        <div className="max-w-[80%] bg-gray-100 text-gray-800 p-3 rounded-xl rounded-tl-none">
          <div className="whitespace-pre-wrap">{content}</div>
          
          {/* Render schedule data in a pretty format */}
          {isScheduleData && (
            <div className="mt-3 space-y-3">
              {data.map((schedule, index) => (
                <div key={index} className="bg-white rounded-lg border border-blue-200 overflow-hidden shadow-sm">
                  <div className="bg-blue-500 text-white px-3 py-2 font-medium flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(schedule.departureTime).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-sm font-bold">{schedule.busName}</div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Khởi hành</div>
                        <div className="font-medium">{new Date(schedule.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      
                      <div className="flex-1 px-4">
                        <div className="h-0.5 bg-gray-300 relative">
                          <div className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-blue-500"></div>
                          <div className="absolute -top-1.5 right-0 w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Đến nơi</div>
                        <div className="font-medium">{new Date(schedule.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Tài xế:</span> {schedule.driverName}
                      </div>
                      <div>
                        <span className="text-gray-500">Phụ xe:</span> {schedule.assistantName}
                      </div>
                      <div>
                        <span className="text-gray-500">Ghế trống:</span> {schedule.availableSeats}/{schedule.totalSeats}
                      </div>
                      <div>
                        <span className="text-gray-500">Giá:</span> <span className="text-blue-600 font-bold">{schedule.pricePerSeat ? schedule.pricePerSeat.toLocaleString('vi-VN') : '0'}đ</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded text-sm font-medium transition-colors">
                      Đặt vé
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Render review data in a pretty format */}
          {isReviewData && (
            <div className="mt-3 space-y-3">
              {data.map((review, index) => (
                <div key={index} className="bg-white rounded-lg border border-blue-200 overflow-hidden shadow-sm">
                  <div className="bg-blue-500 text-white px-3 py-2 font-medium flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {review.companyName}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-300' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="text-sm mb-3">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{review.userEmail}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    {review.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={formatImageUrl(review.imageUrl)} 
                          alt="Ảnh đánh giá" 
                          className="rounded-lg object-cover shadow-sm max-h-32 w-auto"
                          onError={(e) => {
                            console.error(`Failed to load image: ${review.imageUrl}`);
                            e.target.src = '/logo.webp'; // Fallback image
                            e.target.style.opacity = 0.5;
                            e.target.className = "rounded-lg border border-red-200 max-h-32 w-auto";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Render other types of data if available */}
          {hasData && !isScheduleData && !isReviewData && (
            <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 text-sm">
              {typeof data === 'string' ? (
                <p>{data}</p>
              ) : Array.isArray(data) ? (
                <ul className="list-disc pl-5">
                  {data.map((item, index) => (
                    <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                  ))}
                </ul>
              ) : (
                <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserMessage = ({ content }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex justify-end mb-4"
  >
    <div className="max-w-[80%] bg-blue-600 text-white p-3 rounded-xl rounded-tr-none">
      <div className="whitespace-pre-wrap">{content}</div>
      <div className="text-xs text-blue-100 mt-1 text-right">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </motion.div>
);

const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex justify-start mb-4"
  >
    <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-xl rounded-tl-none">
      <motion.div 
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.div 
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.div 
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
    </div>
  </motion.div>
);

const ChatbotInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Xin chào! Tôi có thể giúp gì cho bạn?', data: null }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check chatbot health on mount
  useEffect(() => {
    chatbotService.checkHealth()
      .then(isHealthy => {
        if (!isHealthy) {
          setError('Dịch vụ chatbot hiện không khả dụng. Vui lòng thử lại sau.');
        }
      });
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    // Show typing indicator
    setIsTyping(true);
    setError(null);
    
    try {
      // Call chatbot API
      const response = await chatbotService.sendQuery(userMessage);
      
      console.log('Raw response from chatbot:', response);
      
      // Initialize variables for bot response
      let messageContent = '';
      let formattedData = null;
      let intent = null;
      
      // Handle the response based on its type
      if (typeof response === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedJson = JSON.parse(response);
          
          if (parsedJson && typeof parsedJson === 'object') {
            // Successfully parsed JSON object
            messageContent = parsedJson.message || '';
            formattedData = parsedJson.data || null;
            intent = parsedJson.intent || null;
            
            // Check if the response includes entities about reviews
            if (parsedJson.entities && 
                (parsedJson.entities.danh_gia || 
                 parsedJson.originalText?.toLowerCase().includes('đánh giá') ||
                 parsedJson.originalText?.toLowerCase().includes('review'))) {
              intent = 'danh_gia_nha_xe';
            }
          } else {
            // JSON parsed but not in expected format
            messageContent = response;
          }
        } catch (e) {
          // Not valid JSON, use as plain text
          messageContent = response;
        }
      } else if (response && typeof response === 'object') {
        // Response is already an object
        messageContent = response.message || '';
        formattedData = response.data || null;
        intent = response.intent || null;
        
        // Check if the response includes entities about reviews
        if (response.entities && 
            (response.entities.danh_gia || 
             response.originalText?.toLowerCase().includes('đánh giá') ||
             response.originalText?.toLowerCase().includes('review'))) {
          intent = 'danh_gia_nha_xe';
        }
      } else {
        // Fallback for unexpected response type
        messageContent = 'Tôi không hiểu câu hỏi của bạn.';
      }
      
      // If we have intent but no data, try to extract data from the message
      if (intent && !formattedData && typeof messageContent === 'string') {
        // Extract data based on intent type
        if (intent === 'danh_gia_nha_xe' && messageContent.includes('đánh giá')) {
          try {
            // For review intent, extract review data
            const jsonRegex = /{[^{}]*}/g;
            const jsonMatches = messageContent.match(jsonRegex);
            
            if (jsonMatches && jsonMatches.length > 0) {
              const extractedData = jsonMatches.map(json => {
                try {
                  return JSON.parse(json);
                } catch (e) {
                  console.error('Error parsing individual JSON object:', e);
                  return null;
                }
              }).filter(item => item !== null);
              
              // Validate review data (should have rating property)
              if (extractedData.length > 0 && extractedData.some(item => item.rating !== undefined)) {
                // Extract text before JSON data if possible
                const textPart = messageContent.split(/{[^{}]*}/)[0].trim();
                messageContent = textPart || messageContent;
                
                // Filter to only include valid review objects
                formattedData = extractedData.filter(item => item.rating !== undefined);
                
                console.log('Extracted review data:', formattedData);
              }
            }
          } catch (error) {
            console.error('Error parsing review data from message:', error);
          }
        } else if (messageContent.includes('scheduleId')) {
          try {
            // For schedule-related intents, extract schedule data
            const jsonRegex = /{[^{}]*}/g;
            const jsonMatches = messageContent.match(jsonRegex);
            
            if (jsonMatches && jsonMatches.length > 0) {
              const extractedData = jsonMatches.map(json => JSON.parse(json));
              
              // Validate schedule data (should have scheduleId property)
              if (extractedData.length > 0 && extractedData.some(item => item.scheduleId)) {
                // Extract text before JSON data if possible
                const textPart = messageContent.split(/{[^{}]*}/)[0].trim();
                messageContent = textPart || messageContent;
                
                // Filter to only include valid schedule objects
                formattedData = extractedData.filter(item => item.scheduleId);
              }
            }
          } catch (error) {
            console.error('Error parsing schedule data from message:', error);
          }
        }
      }
      
      // If data doesn't match intent, filter it
      if (intent === 'danh_gia_nha_xe' && formattedData && Array.isArray(formattedData)) {
        // Ensure we only show review data for review intent
        formattedData = formattedData.filter(item => item.rating !== undefined);
      }
      
      // Add bot response to chat
      setMessages(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: messageContent, 
          data: formattedData,
          intent
        }
      ]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setError('Đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 right-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">BenXeSo Chatbot</h3>
            <span className="text-xs text-blue-100">Hỗ trợ 24/7</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-blue-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        <AnimatePresence>
          {messages.map((message, index) => (
            message.type === 'bot' ? (
              <BotMessage 
                key={`bot-${index}`} 
                content={message.content} 
                data={message.data} 
                intent={message.intent} 
              />
            ) : (
              <UserMessage 
                key={`user-${index}`} 
                content={message.content} 
              />
            )
          ))}
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
        
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 mt-2 text-sm text-red-600 bg-red-50 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-2xl">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none max-h-24"
            rows={1}
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isTyping || !newMessage.trim()}
            className={`${
              isTyping || !newMessage.trim() ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            } text-white px-4 py-2 rounded-lg transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatbotInterface;