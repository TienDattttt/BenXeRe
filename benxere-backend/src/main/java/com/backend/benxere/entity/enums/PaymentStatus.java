package com.backend.benxere.entity.enums;

public enum PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED;
    
    /**
     * Convert a string value to a PaymentStatus enum in a case-insensitive manner.
     * This helps when dealing with mixed-case status values.
     *
     * @param status the string value to convert
     * @return the matching PaymentStatus or null if no match
     */
    public static PaymentStatus fromString(String status) {
        if (status == null) {
            return null;
        }
        
        try {
            // First try direct valueOf (case-sensitive)
            return PaymentStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            // If that fails, try case-insensitive match
            for (PaymentStatus ps : PaymentStatus.values()) {
                if (ps.name().equalsIgnoreCase(status)) {
                    return ps;
                }
            }
            throw new IllegalArgumentException("No enum constant " + PaymentStatus.class.getName() + "." + status);
        }
    }
}