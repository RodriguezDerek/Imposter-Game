package com.derek.backend.exception;

public class InvalidCreateRoomException extends RuntimeException {
    public InvalidCreateRoomException(String message) {
        super(message);
    }
}
