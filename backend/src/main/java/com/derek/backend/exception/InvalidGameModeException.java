package com.derek.backend.exception;

public class InvalidGameModeException extends RuntimeException {
    public InvalidGameModeException(String message) {
        super(message);
    }
}
