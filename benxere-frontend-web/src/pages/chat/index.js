import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaHeadset } from 'react-icons/fa';
import ChatSystem from '../../components/chat/ChatSystem';
import { hasRole } from '../../services/user-service';
import websocketService from '../../services/websocket-service';

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatType, setSelectedChatType] = useState('support');
  
  // Get user role on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Check user roles
        const isCustomer = await hasRole('CUSTOMER');
        const isCustomerCare = await hasRole('CUSTOMER_CARE');
        const isBusOwner = await hasRole('BUS_OWNER');
        const isDriver = await hasRole('DRIVER');
        const isAssistant = await hasRole('ASSISTANT');
        const isAdmin = await hasRole('ADMIN');
        
        // Set user role
        if (isAdmin) {
          setUserRole('ADMIN');
        } else if (isCustomerCare) {
          setUserRole('CUSTOMER_CARE');
        } else if (isBusOwner) {
          setUserRole('BUS_OWNER');
        } else if (isDriver) {
          setUserRole('DRIVER');
        } else if (isAssistant) {
          setUserRole('ASSISTANT');
        } else if (isCustomer) {
          setUserRole('CUSTOMER');
        }
        
        // Fetch chat rooms
        const rooms = await websocketService.fetchChatRooms();
        setChatRooms(rooms);
        
        // Set default chat type
        if (isCustomer) {
          setSelectedChatType('support');
        } else if (isDriver || isAssistant) {
          setSelectedChatType('schedule');
        }
      } catch (err) {
        console.error('Error initializing chat page:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // Get filtered chat rooms based on selected type
  const getFilteredRooms = () => {
    return chatRooms.filter(room => 
      selectedChatType === 'support' ? !room.isGroup : room.isGroup
    );
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 mr-4 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Benxeso Chat</h1>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Chat type tabs */}
            <div className="flex border-b">
              <button
                className={`flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium flex-1 ${
                  selectedChatType === 'support' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedChatType('support')}
              >
                <FaHeadset />
                <span>Customer Support</span>
              </button>
              <button
                className={`flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium flex-1 ${
                  selectedChatType === 'schedule' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedChatType('schedule')}
              >
                <FaUsers />
                <span>Schedule Chats</span>
              </button>
            </div>
            
            {/* Chat container */}
            <div className="h-[calc(100vh-200px)] flex">
              {/* Chat rooms list */}
              <div className="w-1/4 border-r overflow-y-auto">
                {getFilteredRooms().length > 0 ? (
                  getFilteredRooms().map(room => (
                    <div 
                      key={room.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        roomId === room.id.toString() ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => navigate(`/chat/${room.id}`)}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${room.isGroup ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center mr-3`}>
                          {room.isGroup ? <FaUsers className="text-white" /> : <FaHeadset className="text-white" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{room.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {room.lastMessage ? room.lastMessage.messageText : 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No {selectedChatType === 'support' ? 'support' : 'schedule'} chats available</p>
                    
                    {selectedChatType === 'support' && userRole === 'CUSTOMER' && (
                      <button
                        onClick={async () => {
                          try {
                            // Create new support chat
                            const newRoom = await websocketService.createChatRoom({
                              name: 'Customer Support',
                              isGroup: false
                            });
                            
                            // Navigate to new chat room
                            navigate(`/chat/${newRoom.id}`);
                          } catch (err) {
                            setError('Failed to create new chat. Please try again.');
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Contact Support
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Chat messages area */}
              <div className="flex-1">
                <ChatSystem 
                  userRole={userRole} 
                  initialChatRoomId={roomId ? parseInt(roomId) : null} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 