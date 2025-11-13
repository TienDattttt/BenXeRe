import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaPhone, FaPhoneSlash, FaMicrophone, FaPaperPlane, FaImage, FaUser, FaUsers } from 'react-icons/fa';
import websocketService from '../../services/websocket-service';
import { getCurrentUserId, getUserProfile } from '../../services/user-service';
import config from '../../config';

// Message bubble component
const MessageBubble = ({ message, isCurrentUser, senderName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 mt-1">
          <FaUser className="text-gray-600" />
        </div>
      )}
      
      <div className="flex flex-col">
        {!isCurrentUser && (
          <span className="text-xs text-gray-500 mb-1 ml-1">{senderName || 'User'}</span>
        )}
        <div
          className={`max-w-[240px] p-3 rounded-lg ${
            isCurrentUser
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
        >
          {message.messageType === 'TEXT' && <div>{message.messageText}</div>}
          
          {message.messageType === 'IMAGE' && message.mediaUrl && (
            <img 
              src={message.mediaUrl} 
              alt="Attached media" 
              className="rounded max-w-full h-auto mb-2" 
            />
          )}
          
          {message.messageType === 'VOICE_CALL_INVITE' && (
            <div className="flex items-center space-x-2">
              <FaPhone className="text-sm" />
              <span>Voice call invitation</span>
            </div>
          )}
          
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 mt-1">
          <FaUser className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

// Voice call overlay component
const VoiceCallOverlay = ({ onAccept, onDecline, caller, isActive }) => {
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
            <FaPhone className="text-3xl text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">
            {isActive ? 'Call in Progress' : 'Incoming Call'}
          </h3>
          <p className="text-gray-600">{caller || 'Unknown Caller'}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-500 text-white p-3 rounded-full"
            onClick={onDecline}
          >
            <FaPhoneSlash className="text-lg" />
          </motion.button>
          
          {!isActive && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 text-white p-3 rounded-full"
              onClick={onAccept}
            >
              <FaPhone className="text-lg" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Chat room list item component
const ChatRoomListItem = ({ room, isActive, onSelect, unreadCount }) => {
  return (
    <div 
      className={`flex items-center p-3 cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
      onClick={() => onSelect(room.id)}
    >
      <div className={`w-10 h-10 rounded-full ${room.isGroup ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center mr-3`}>
        {room.isGroup ? <FaUsers className="text-white" /> : <FaUser className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
          {room.lastMessage && (
            <span className="text-xs text-gray-500">
              {new Date(room.lastMessage.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 truncate">
            {room.lastMessage ? room.lastMessage.messageText : 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Main ChatSystem component
const ChatSystem = ({ userRole, initialChatRoomId = null }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState(initialChatRoomId);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatType, setActiveChatType] = useState('support'); // 'support' or 'schedule'
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const rtcPeerConnection = useRef(null);

  // Get user name for messages
  const getSenderName = (senderId) => {
    return userProfiles[senderId]?.name || 'User';
  };
  
  // Initialize and fetch chat rooms
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Get current user ID
        const currentUserId = await getCurrentUserId();
        setUserId(currentUserId);
        
        // Connect to WebSocket
        await websocketService.connect();
        
        // Subscribe to user's chat notification queue
        websocketService.subscribeToUserNotifications(handleNotification);
        
        // Subscribe to call signals
        websocketService.subscribeToCallSignals(handleCallSignal);
        
        // Fetch chat rooms
        const rooms = await websocketService.fetchChatRooms();
        setChatRooms(rooms);
        
        // Set initial active chat room
        if (initialChatRoomId) {
          setActiveChatRoomId(initialChatRoomId);
          loadChatRoom(initialChatRoomId);
        } else if (rooms.length > 0) {
          setActiveChatRoomId(rooms[0].id);
          loadChatRoom(rooms[0].id);
        }
      } catch (err) {
        console.error('Error initializing chat system:', err);
        setError('Failed to connect to chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
    
    return () => {
      // Clean up WebSocket connection
      websocketService.disconnect();
      
      // End call if active
      if (isCallActive && rtcPeerConnection.current) {
        rtcPeerConnection.current.close();
        rtcPeerConnection.current = null;
      }
    };
  }, [initialChatRoomId]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Load messages for a chat room
  const loadChatRoom = async (roomId) => {
    try {
      setIsLoading(true);
      
      // Unsubscribe from previous chat room if any
      if (activeChatRoomId) {
        websocketService.unsubscribeFromChatRoom(activeChatRoomId);
      }
      
      // Subscribe to new chat room
      websocketService.subscribeToChatRoom(roomId, handleNewMessage);
      
      // Fetch chat history
      const history = await websocketService.requestChatHistory(roomId);
      if (history && Array.isArray(history.payload)) {
        setMessages(history.payload);
        
        // Load user profiles for unique senders
        const senderIds = [...new Set(history.payload.map(msg => msg.senderId))];
        await loadUserProfiles(senderIds);
      }
      
      // Mark messages as read
      websocketService.markMessagesAsRead(roomId);
      
      // Update unread counts
      setUnreadCounts(prev => ({
        ...prev,
        [roomId]: 0
      }));
    } catch (err) {
      console.error('Error loading chat room:', err);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load user profiles for message senders
  const loadUserProfiles = async (userIds) => {
    try {
      const promises = userIds.map(id => getUserProfile(id));
      const profiles = await Promise.all(promises);
      
      const profileMap = {};
      profiles.forEach((profile, index) => {
        if (profile) {
          profileMap[userIds[index]] = profile;
        }
      });
      
      setUserProfiles(prev => ({
        ...prev,
        ...profileMap
      }));
    } catch (err) {
      console.error('Error loading user profiles:', err);
    }
  };
  
  // Handle new message
  const handleNewMessage = (message) => {
    if (message.type === 'CHAT_MESSAGE') {
      setMessages(prevMessages => [...prevMessages, message.payload]);
      
      // Load sender profile if needed
      if (message.payload.senderId && !userProfiles[message.payload.senderId]) {
        loadUserProfiles([message.payload.senderId]);
      }
      
      // Mark message as read if we're in the active chat room
      if (message.payload.chatRoomId === activeChatRoomId) {
        websocketService.markMessagesAsRead(activeChatRoomId);
      } else {
        // Update unread count for other chat rooms
        setUnreadCounts(prev => ({
          ...prev,
          [message.payload.chatRoomId]: (prev[message.payload.chatRoomId] || 0) + 1
        }));
      }
    }
  };
  
  // Handle notifications
  const handleNotification = (notification) => {
    if (notification.type === 'NEW_CHAT_ROOM') {
      // Add new chat room to the list
      setChatRooms(prev => [...prev, notification.payload]);
    } else if (notification.type === 'CHAT_ROOM_UPDATED') {
      // Update existing chat room
      setChatRooms(prev => 
        prev.map(room => 
          room.id === notification.payload.id ? notification.payload : room
        )
      );
    }
  };
  
  // Handle WebRTC call signals
  const handleCallSignal = (signal) => {
    if (!signal || !signal.payload) return;
    
    const { eventType, callerId, rtcSignalData, chatRoomId } = signal.payload;
    
    // Only process signals for the active chat room
    if (chatRoomId !== activeChatRoomId) return;
    
    switch (eventType) {
      case 'CALL_OFFER':
        // Show incoming call UI
        setIncomingCall({
          callerId,
          offerData: rtcSignalData
        });
        break;
      case 'CALL_ANSWER':
        // Process answer from remote peer
        if (rtcPeerConnection.current && rtcSignalData) {
          const answer = JSON.parse(rtcSignalData);
          rtcPeerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
            .catch(err => console.error('Error setting remote description:', err));
        }
        break;
      case 'ICE_CANDIDATE':
        // Add ICE candidate
        if (rtcPeerConnection.current && rtcSignalData) {
          const candidate = JSON.parse(rtcSignalData);
          rtcPeerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(err => console.error('Error adding ICE candidate:', err));
        }
        break;
      case 'CALL_END':
        // End the call
        endCall();
        break;
      default:
        console.log('Unknown call event type:', eventType);
    }
  };
  
  // Send a text message
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChatRoomId) return;
    
    try {
      const trimmedMessage = messageInput.trim();
      setMessageInput('');
      
      await websocketService.sendMessage(
        activeChatRoomId,
        trimmedMessage,
        'TEXT'
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Send an image message
  const sendImage = async (file) => {
    if (!file || !activeChatRoomId) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatRoomId', activeChatRoomId);
      
      // Upload image and get URL
      const response = await fetch(config.ENDPOINTS.CHAT.UPLOAD, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { mediaUrl } = await response.json();
      
      // Send message with image URL
      await websocketService.sendMessage(
        activeChatRoomId,
        '',
        'IMAGE',
        mediaUrl
      );
    } catch (err) {
      console.error('Error sending image:', err);
      setError('Failed to send image. Please try again.');
    }
  };
  
  // Initialize a WebRTC call
  const initiateCall = async () => {
    try {
      if (!activeChatRoomId) return;
      
      // Check if browser supports WebRTC
      if (!navigator.mediaDevices || !window.RTCPeerConnection) {
        throw new Error('Your browser does not support voice calls');
      }
      
      // Create RTCPeerConnection
      const configuration = { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ] 
      };
      
      rtcPeerConnection.current = new RTCPeerConnection(configuration);
      
      // Add ICE candidate handler
      rtcPeerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          websocketService.sendCallSignal({
            chatRoomId: activeChatRoomId,
            eventType: 'ICE_CANDIDATE',
            rtcSignalData: JSON.stringify(event.candidate)
          });
        }
      };
      
      // Add tracks to peer connection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getAudioTracks().forEach(track => {
        rtcPeerConnection.current.addTrack(track, stream);
      });
      
      // Handle remote stream
      rtcPeerConnection.current.ontrack = (event) => {
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio && event.streams[0]) {
          remoteAudio.srcObject = event.streams[0];
        }
      };
      
      // Create offer
      const offer = await rtcPeerConnection.current.createOffer();
      await rtcPeerConnection.current.setLocalDescription(offer);
      
      // Send call invitation message
      await websocketService.sendMessage(
        activeChatRoomId,
        'Voice call invitation',
        'VOICE_CALL_INVITE'
      );
      
      // Send WebRTC offer via WebSocket
      websocketService.sendCallSignal({
        chatRoomId: activeChatRoomId,
        eventType: 'CALL_OFFER',
        rtcSignalData: JSON.stringify(offer)
      });
      
      setIsCallActive(true);
    } catch (err) {
      console.error('Error initiating call:', err);
      setError('Failed to start voice call. Please try again.');
      
      if (rtcPeerConnection.current) {
        rtcPeerConnection.current.close();
        rtcPeerConnection.current = null;
      }
    }
  };
  
  // Accept an incoming call
  const acceptCall = async () => {
    try {
      if (!incomingCall || !incomingCall.offerData) return;
      
      // Create RTCPeerConnection
      const configuration = { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ] 
      };
      
      rtcPeerConnection.current = new RTCPeerConnection(configuration);
      
      // Add ICE candidate handler
      rtcPeerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          websocketService.sendCallSignal({
            chatRoomId: activeChatRoomId,
            eventType: 'ICE_CANDIDATE',
            rtcSignalData: JSON.stringify(event.candidate)
          });
        }
      };
      
      // Add tracks to peer connection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getAudioTracks().forEach(track => {
        rtcPeerConnection.current.addTrack(track, stream);
      });
      
      // Handle remote stream
      rtcPeerConnection.current.ontrack = (event) => {
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio && event.streams[0]) {
          remoteAudio.srcObject = event.streams[0];
        }
      };
      
      // Set remote description from offer
      const offerData = JSON.parse(incomingCall.offerData);
      await rtcPeerConnection.current.setRemoteDescription(new RTCSessionDescription(offerData));
      
      // Create answer
      const answer = await rtcPeerConnection.current.createAnswer();
      await rtcPeerConnection.current.setLocalDescription(answer);
      
      // Send answer via WebSocket
      websocketService.sendCallSignal({
        chatRoomId: activeChatRoomId,
        eventType: 'CALL_ANSWER',
        rtcSignalData: JSON.stringify(answer)
      });
      
      setIsCallActive(true);
      setIncomingCall(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError('Failed to accept voice call. Please try again.');
      
      if (rtcPeerConnection.current) {
        rtcPeerConnection.current.close();
        rtcPeerConnection.current = null;
      }
      
      setIncomingCall(null);
    }
  };
  
  // Decline an incoming call
  const declineCall = () => {
    if (!incomingCall) return;
    
    websocketService.sendCallSignal({
      chatRoomId: activeChatRoomId,
      eventType: 'CALL_END'
    });
    
    setIncomingCall(null);
  };
  
  // End an active call
  const endCall = () => {
    if (rtcPeerConnection.current) {
      rtcPeerConnection.current.close();
      rtcPeerConnection.current = null;
    }
    
    // Send end call signal
    websocketService.sendCallSignal({
      chatRoomId: activeChatRoomId,
      eventType: 'CALL_END'
    });
    
    setIsCallActive(false);
  };
  
  // Handle key press in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Toggle chat window
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };
  
  // Change active chat tab
  const changeTab = (type) => {
    setActiveChatType(type);
    
    // Filter chat rooms based on type
    const filteredRooms = chatRooms.filter(room => 
      type === 'support' ? !room.isGroup : room.isGroup
    );
    
    if (filteredRooms.length > 0) {
      setActiveChatRoomId(filteredRooms[0].id);
      loadChatRoom(filteredRooms[0].id);
    }
  };
  
  // Calculate total unread messages
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-blue-700 transition-colors"
      >
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
        <FaBell className="text-white text-xl" />
      </button>
      
      {/* Audio element for voice calls */}
      <audio id="remoteAudio" autoPlay />
      
      {/* Chat window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 w-80 h-[30rem] bg-white rounded-lg shadow-xl flex flex-col z-10 overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
              <h2 className="font-semibold">Benxeso Chat</h2>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-blue-200 focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Chat tabs */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeChatType === 'support' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => changeTab('support')}
              >
                Support
              </button>
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeChatType === 'schedule' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => changeTab('schedule')}
              >
                Schedule
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Chat rooms list */}
              <div className="w-1/3 border-r overflow-y-auto">
                {chatRooms
                  .filter(room => activeChatType === 'support' ? !room.isGroup : room.isGroup)
                  .map(room => (
                    <ChatRoomListItem
                      key={room.id}
                      room={room}
                      isActive={room.id === activeChatRoomId}
                      onSelect={(id) => {
                        setActiveChatRoomId(id);
                        loadChatRoom(id);
                      }}
                      unreadCount={unreadCounts[room.id] || 0}
                    />
                  ))}
                
                {chatRooms.filter(room => activeChatType === 'support' ? !room.isGroup : room.isGroup).length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No {activeChatType === 'support' ? 'support' : 'schedule'} chats available
                  </div>
                )}
              </div>
              
              {/* Chat messages */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-red-500 text-center">
                      <p>{error}</p>
                      <button
                        onClick={() => loadChatRoom(activeChatRoomId)}
                        className="mt-2 text-blue-500 hover:underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-3">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No messages yet
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <MessageBubble
                          key={index}
                          message={message}
                          isCurrentUser={message.senderId === userId}
                          senderName={getSenderName(message.senderId)}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
                
                {/* Chat input */}
                <div className="p-3 border-t">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || !activeChatRoomId}
                    />
                    
                    <div className="flex border-t border-r border-b rounded-r-lg bg-gray-50">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-2 text-gray-500 hover:text-blue-500 focus:outline-none"
                        disabled={isLoading || !activeChatRoomId}
                      >
                        <FaImage />
                      </button>
                      
                      <button
                        onClick={initiateCall}
                        className="px-2 py-2 text-gray-500 hover:text-blue-500 focus:outline-none"
                        disabled={isLoading || !activeChatRoomId || isCallActive}
                      >
                        <FaPhone />
                      </button>
                      
                      <button
                        onClick={sendMessage}
                        className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none"
                        disabled={!messageInput.trim() || isLoading || !activeChatRoomId}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          sendImage(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Voice call overlay */}
      <AnimatePresence>
        {(isCallActive || incomingCall) && (
          <VoiceCallOverlay
            onAccept={acceptCall}
            onDecline={isCallActive ? endCall : declineCall}
            caller={incomingCall ? getSenderName(incomingCall.callerId) : 'Call in progress'}
            isActive={isCallActive}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSystem; 