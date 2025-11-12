package com.backend.benxere.configuration;

import com.backend.benxere.entity.Booking.BookingStatus;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class BookingStatusDeserializer extends JsonDeserializer<BookingStatus> {
    @Override
    public BookingStatus deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        return BookingStatus.fromValue(value);
    }
}