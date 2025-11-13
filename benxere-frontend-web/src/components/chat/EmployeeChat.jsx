import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Avatar,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Badge,
} from '@mui/material';
import { X, Send, User, AlertCircle } from 'lucide-react';
import { chatService } from '../../services/chat-service';

const formatMessageDate = (date) => {
  if (!date) return '';
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(messageDate.getTime())) return '';
  return messageDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const EmployeeChat = ({ open, onClose, employee }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let messageHandler;
    
    const initializeChat = async () => {
      if (open && employee?.userId) {
        try {
          setLoading(true);
          setError(null);
          
          // Connect to WebSocket
          await chatService.connect();
          
          // Load conversation history
          const history = await chatService.getConversation(employee.userId);
          setMessages(history.map(msg => ({
            ...msg,
            sentAt: msg.sentAt || new Date().toISOString()
          })));
          
          // Mark messages as read
          await chatService.markMessageAsRead(employee.userId);
          
          // Set up real-time message handler
          messageHandler = (message) => {
            if (message.senderId === employee.userId || message.receiverId === employee.userId) {
              setMessages(prev => [...prev, {
                ...message,
                sentAt: message.sentAt || new Date().toISOString()
              }]);
              if (message.senderId === employee.userId) {
                chatService.markMessageAsRead(employee.userId);
              }
            }
          };
          
          chatService.onMessage(messageHandler);
          
        } catch (error) {
          console.error('Error initializing chat:', error);
          setError(error.message || 'Failed to load chat. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      if (messageHandler) {
        chatService.onMessage(messageHandler); // Remove message handler
      }
    };
  }, [open, employee?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || !employee?.userId) return;

    try {
      setError(null);
      const message = await chatService.sendMessage(employee.userId, content);
      if (message) {
        const formattedMessage = {
          ...message,
          sentAt: message.sentAt || new Date().toISOString()
        };
        setMessages(prev => [...prev, formattedMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if we have a valid employee with userId
  if (!employee?.userId) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={chatService.isConnected() ? "success" : "error"}
          >
            <Avatar sx={{ bgcolor: 'white' }}>
              <User size={24} color="#1976d2" />
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h6">
              {employee?.firstName} {employee?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {chatService.isConnected() ? 'Đang kết nối' : 'Mất kết nối'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'error.light',
              color: 'error.dark',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AlertCircle size={20} />
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
        
        <Box sx={{ 
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 1
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
              color="text.secondary"
            >
              <Typography variant="body2">
                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.senderId === employee.userId ? 'flex-start' : 'flex-end',
                  maxWidth: '70%',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: msg.senderId === employee.userId ? 'grey.100' : 'primary.light',
                    borderRadius: 2,
                    color: msg.senderId === employee.userId ? 'text.primary' : 'white',
                  }}
                >
                  <Typography variant="body2">
                    {msg.content}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mt: 0.5,
                    opacity: 0.8
                  }}>
                    <Typography variant="caption">
                      {formatMessageDate(msg.sentAt)}
                    </Typography>
                    {!msg.isRead && msg.senderId !== employee.userId && (
                      <Typography variant="caption">• Đã gửi</Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ 
          display: 'flex',
          gap: 1,
          p: 1,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            size="small"
            disabled={!chatService.isConnected()}
            sx={{ bgcolor: 'background.paper' }}
          />
          <IconButton 
            color="primary"
            onClick={handleSend}
            disabled={!chatService.isConnected() || !newMessage.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <Send size={20} />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeChat; 