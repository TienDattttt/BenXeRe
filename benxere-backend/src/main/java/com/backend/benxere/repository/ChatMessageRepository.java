package com.backend.benxere.repository;

import com.backend.benxere.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    
    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender.userId = :senderId AND m.receiver.userId = :receiverId) OR " +
           "(m.sender.userId = :receiverId AND m.receiver.userId = :senderId) " +
           "ORDER BY m.sentAt ASC")
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
            @Param("senderId") Integer senderId,
            @Param("receiverId") Integer receiverId,
            @Param("receiverId") Integer receiverId2,
            @Param("senderId") Integer senderId2);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.receiver.userId = :userId AND m.isRead = false ORDER BY m.sentAt ASC")
    List<ChatMessage> findByReceiverUserIdAndIsReadFalse(@Param("userId") Integer userId);
    
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.sender.userId = :senderId AND m.receiver.userId = :receiverId AND m.isRead = false")
    void markMessagesAsRead(@Param("senderId") Integer senderId, @Param("receiverId") Integer receiverId);

    @Query("SELECT DISTINCT m.sender.userId FROM ChatMessage m WHERE m.receiver.userId = :userId")
    List<Integer> findDistinctSenders(@Param("userId") Integer userId);

    @Query("SELECT DISTINCT m.receiver.userId FROM ChatMessage m WHERE m.sender.userId = :userId")
    List<Integer> findDistinctReceivers(@Param("userId") Integer userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver.userId = :receiverId AND m.sender.userId = :senderId AND m.isRead = false")
    long countUnreadBySenderAndReceiver(@Param("senderId") Integer senderId, @Param("receiverId") Integer receiverId);

    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.userId = :userId AND m.receiver.userId = :partnerId) OR (m.sender.userId = :partnerId AND m.receiver.userId = :userId) ORDER BY m.sentAt DESC")
    List<ChatMessage> findMessageHistory(@Param("userId") Integer userId, @Param("partnerId") Integer partnerId, org.springframework.data.domain.Pageable pageable);
}