import api from './api';
import { getCurrentUserId, getUserById } from './user-service';
import websocketService from './websocket-service';

class ChatService {
  constructor() {
    this.messageHandlers = new Set();
  }

  async connect() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await websocketService.connect(token);
        console.log('WebSocket connected in chat service');
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      throw new Error('Failed to connect to chat server');
    }
  }

  async getConversation(partnerId) {
    try {
      const response = await api.get(`/api/chat/history/${partnerId}`);
      return response.data.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderEmail: message.senderEmail,
        receiverId: message.receiverId,
        receiverEmail: message.receiverEmail,
        sentAt: message.sentAt,
        isRead: message.isRead
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please login to view messages');
      }
      console.error('Error fetching messages:', error);
      throw new Error('Failed to load messages. Please try again.');
    }
  }

  async processAIMessage(message) {
    try {
      let response = "Tôi đang xử lý yêu cầu của bạn...";
      
      const lowercaseMsg = message.toLowerCase();
      
      if (lowercaseMsg.includes('đặt vé') || lowercaseMsg.includes('mua vé')) {
        response = "Để đặt vé, tôi cần một số thông tin:\n" +
                  "- Điểm đi\n" +
                  "- Điểm đến\n" +
                  "- Ngày đi\n" +
                  "- Số lượng hành khách\n\n" +
                  "Bạn có thể cho tôi biết bạn muốn đi từ đâu đến đâu không?";
      }
      else if (lowercaseMsg.includes('giá') || lowercaseMsg.includes('phí')) {
        response = "Giá vé sẽ phụ thuộc vào tuyến đường và loại ghế bạn chọn. " +
                  "Bạn có thể cho tôi biết tuyến đường bạn quan tâm không?";
      }
      else if (lowercaseMsg.includes('lịch') || lowercaseMsg.includes('giờ')) {
        response = "Tôi có thể giúp bạn xem lịch trình các chuyến xe. " +
                  "Bạn muốn tìm hiểu lịch trình của tuyến đường nào?";
      }
      else if (lowercaseMsg.includes('thanh toán')) {
        response = "Chúng tôi hỗ trợ nhiều phương thức thanh toán:\n" +
                  "- Thẻ tín dụng/ghi nợ\n" +
                  "- Chuyển khoản ngân hàng\n" +
                  "- Ví điện tử (MoMo, ZaloPay)\n" +
                  "- Thanh toán khi nhận vé\n\n" +
                  "Bạn muốn thanh toán bằng phương thức nào?";
      }
      else if (lowercaseMsg.includes('hủy') || lowercaseMsg.includes('hoàn')) {
        response = "Để hủy vé hoặc yêu cầu hoàn tiền, bạn cần cung cấp:\n" +
                  "- Mã đặt vé\n" +
                  "- Lý do hủy\n\n" +
                  "Bạn có thể cho tôi biết mã đặt vé không?";
      }
      else if (lowercaseMsg.includes('khuyến mãi') || lowercaseMsg.includes('giảm giá')) {
        response = "Hiện tại chúng tôi có các chương trình khuyến mãi sau:\n" +
                  "- Giảm 10% cho đặt vé trước 7 ngày\n" +
                  "- Giảm 15% cho nhóm từ 4 người\n" +
                  "- Tích điểm đổi vé miễn phí\n\n" +
                  "Bạn muốn tìm hiểu thêm về chương trình nào?";
      }
      else if (lowercaseMsg.includes('trạng thái') || lowercaseMsg.includes('tình trạng')) {
        response = "Để kiểm tra trạng thái đặt vé, tôi cần mã đặt vé của bạn. " +
                  "Bạn có thể cung cấp mã đặt vé không?";
      }
      else {
        response = "Tôi có thể giúp bạn với các vấn đề sau:\n" +
                  "- Đặt vé xe\n" +
                  "- Tìm tuyến đường\n" +
                  "- Xem lịch trình\n" +
                  "- Kiểm tra giá vé\n" +
                  "- Hỗ trợ thanh toán\n" +
                  "- Thông tin khuyến mãi\n\n" +
                  "Bạn cần hỗ trợ vấn đề nào?";
      }

      return {
        id: Date.now(),
        text: response,
        timestamp: new Date().toISOString(),
        isUser: false,
        isRead: true,
        senderId: 'AI',
        receiverId: await getCurrentUserId()
      };
    } catch (error) {
      console.error('Error processing AI message:', error);
      throw new Error('AI processing failed. Please try again.');
    }
  }

  async sendChatbotMessage(messageText) {
    try {
      return this.processAIMessage(messageText);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw new Error('Failed to process chatbot message. Please try again.');
    }
  }

  async sendMessage(receiverId, content) {
    try {
      if (!websocketService.isConnected()) {
        await this.connect();
      }

      const message = await websocketService.sendMessage(content, receiverId);
      return {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderEmail: message.senderEmail,
        receiverId: message.receiverId,
        receiverEmail: message.receiverEmail,
        sentAt: message.sentAt,
        isRead: message.isRead
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  async markMessageAsRead(senderId) {
    try {
      if (!websocketService.isConnected()) {
        await this.connect();
      }
      await websocketService.markMessagesAsRead(senderId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async deleteMessage(messageId) {
    try {
      await api.delete(`/api/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  async getUnreadCount(userId) {
    try {
      const response = await api.get(`/api/chat/unread`);
      return response.data.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async processBookingIntent(bookingData) {
    try {
      const response = `Tôi đã tìm thấy các chuyến xe từ ${bookingData.from} đến ${bookingData.to} cho ${bookingData.passengers} hành khách vào ngày ${bookingData.date}:\n\n` +
                      "1. 07:00 - Xe giường nằm - 300.000đ\n" +
                      "2. 09:30 - Xe ghế ngồi - 250.000đ\n" +
                      "3. 13:00 - Xe giường nằm - 300.000đ\n" +
                      "4. 15:30 - Xe ghế ngồi - 250.000đ\n\n" +
                      "Bạn muốn đặt chuyến nào? Hãy chọn số tương ứng.";

      return {
        id: Date.now(),
        text: response,
        timestamp: new Date().toISOString(),
        isUser: false,
        isRead: true,
        senderId: 'AI',
        receiverId: await getCurrentUserId()
      };
    } catch (error) {
      console.error('Error processing booking:', error);
      throw new Error('Booking processing failed. Please try again.');
    }
  }

  async getConversations() {
    try {
      const response = await api.get('/api/chat/conversations');
      return response.data.map(conv => ({
        partnerId: conv.partnerId,
        partnerEmail: conv.partnerEmail,
        unreadCount: conv.unreadCount,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  isConnected() {
    return websocketService.isConnected();
  }
}

export const chatService = new ChatService();