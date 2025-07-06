//package com.example.da_be.email;
//
//import jakarta.mail.internet.MimeMessage;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Service;
//
//import java.nio.charset.StandardCharsets;
//
//@Service
//public class EmailSender {
//    @Autowired
//    private JavaMailSender javaMailSender;
//
//    @Value("${spring.mail.username}")
//    private String sender;
//
//    @Async
//    public void sendEmail(Email email) {
//        String htmlBody = MailConstant.BODY_STARTS +
//                email.getTitleEmail() +
//                MailConstant.BODY_BODY +
//                email.getBody() +
//                MailConstant.BODY_END;
//
//        sendSimpleMail(email.getToEmail(), htmlBody, email.getSubject());
//    }
//
//    private void sendSimpleMail(String[] recipients, String msgBody, String subject) {
//        try {
//
//            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
//            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.toString());
//            ClassPathResource resource = new ClassPathResource(MailConstant.LOGO_PATH);
//            mimeMessageHelper.setFrom(sender);
//            mimeMessageHelper.setBcc(recipients);
//            mimeMessageHelper.setText(msgBody, true);
//            mimeMessageHelper.setSubject(subject);
//            mimeMessageHelper.addInline("logoImage", resource);
//            javaMailSender.send(mimeMessage);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//}
