package com.derek.backend.exception;

public class InvalidPlayerAmountException extends RuntimeException {
  public InvalidPlayerAmountException(String message) {
    super(message);
  }
}
