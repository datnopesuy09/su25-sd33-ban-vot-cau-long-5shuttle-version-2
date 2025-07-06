package com.example.da_be.exception;


import lombok.Getter;

@Getter

public class AppException extends RuntimeException{

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    private ErrorCode errorCode;


}
