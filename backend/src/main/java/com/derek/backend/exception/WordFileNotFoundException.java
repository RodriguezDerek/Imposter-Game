package com.derek.backend.exception;

public class WordFileNotFoundException extends RuntimeException {
    public WordFileNotFoundException(String message) {
        super(message);
    }
}
