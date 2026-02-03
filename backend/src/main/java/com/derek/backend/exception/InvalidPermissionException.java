package com.derek.backend.exception;

public class InvalidPermissionException extends RuntimeException {
    public InvalidPermissionException(String message) {
        super(message);
    }
}
