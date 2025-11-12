package com.backend.benxere.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ZaloPayCallbackResponse {
    @JsonProperty("return_code")
    private Integer returnCode;

    @JsonProperty("return_message")
    private String returnMessage;

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("zp_trans_id")
    private Long zpTransId;

    private Long amount;

    public static ZaloPayCallbackResponse success(String transactionId, Long zpTransId, Long amount) {
        return ZaloPayCallbackResponse.builder()
                .returnCode(1)
                .returnMessage("success")
                .transactionId(transactionId)
                .zpTransId(zpTransId)
                .amount(amount)
                .build();
    }

    public static ZaloPayCallbackResponse error(String message) {
        return ZaloPayCallbackResponse.builder()
                .returnCode(-1)
                .returnMessage(message)
                .build();
    }

    public static ZaloPayCallbackResponse invalidMac() {
        return ZaloPayCallbackResponse.builder()
                .returnCode(-1)
                .returnMessage("mac not equal")
                .build();
    }
}