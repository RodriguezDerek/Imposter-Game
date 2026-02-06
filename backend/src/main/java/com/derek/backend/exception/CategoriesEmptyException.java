package com.derek.backend.exception;

public class CategoriesEmptyException extends RuntimeException {
    public CategoriesEmptyException(String message) {
        super(message);
    }
}
