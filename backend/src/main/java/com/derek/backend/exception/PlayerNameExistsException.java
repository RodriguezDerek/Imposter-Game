package com.derek.backend.exception;

public class PlayerNameExistsException extends RuntimeException {
    public PlayerNameExistsException(String message) {
        super(message);
    }
}
