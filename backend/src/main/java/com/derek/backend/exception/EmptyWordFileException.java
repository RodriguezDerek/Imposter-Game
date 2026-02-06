package com.derek.backend.exception;

public class EmptyWordFileException extends RuntimeException {
    public EmptyWordFileException(String message) {
        super(message);
    }
}
