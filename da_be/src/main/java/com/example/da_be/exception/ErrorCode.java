package com.example.da_be.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized Exception", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1000, "Invalid enum key", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(1001, "Email existed", HttpStatus.BAD_REQUEST),
    USERID_NOT_EXISTS(1002, "User does not exist", HttpStatus.NOT_FOUND),
    ROLEID_NOT_EXISTS(1003, "Role does not exist", HttpStatus.NOT_FOUND),
    ROLENAME_NOT_EXISTS(1007, "Role does not exist", HttpStatus.NOT_FOUND),

    //    USERID_INVALID(1002, "Username must be at least 8 characters", HttpStatus.BAD_REQUEST),
//    PASSWORD_INVALID(1003, "Password must be at least 5 characters", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_EXISTS(1004, "Email does not exist", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1005, "Unauthenticated",HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1006, "You do not have permisstion",HttpStatus.FORBIDDEN),
    ;

//    ErrorCode(int code, String message, HttpStatus httpStatus) {
//        this.code = code;
//        this.message = message;
//        this.httpStatus = httpStatus;
//    }


    private int code;
    private String message;
    private HttpStatus httpStatus;

}
