package com.kingyea.bigdata.apple.service;

import static java.lang.String.format;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import javax.servlet.http.HttpSession;

import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.common.collect.Sets;

/**
 * Insert your comments here.
 *
 * @author <a href="mailto:zhanglulin@kingyea.com.cn">lulinzh</a>
 * @since 1.0.0
 */
@RestController
public class DataService {

    private static final String TOKEN_NAME = "token";

    private final Set<Credential> cache = Sets.newHashSet();

    @GetMapping(value = "/service/v1/date", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public String getCurrentTime(final HttpSession session) {
        final JSONObject json = new JSONObject();
        final String token = (String) session.getAttribute(TOKEN_NAME);
        if (Objects.isNull(token) || "".equals(token.trim())) {
            json.put("success", false);
            json.put("message", "Session expired");
        } else {
            final LocalDateTime now = LocalDateTime.now();
            json.put("success", true);
            json.put("message", now.toString());
        }

        return json.toString();
    }

    @GetMapping(value = "/logout", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public String logout(final HttpSession session) {
        session.invalidate();
        final JSONObject json = new JSONObject();
        json.put("success", true);
        return json.toString();
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public String login(final HttpSession session,
            @RequestParam(value = "username", required = true) final String username,
            @RequestParam(value = "password", required = true) final String password) {

        final JSONObject json = new JSONObject();
        String token = (String) session.getAttribute(TOKEN_NAME);
        if (Objects.isNull(token) || "".equals(token.trim())) {
            if (Objects.isNull(username) || Objects.isNull(password)) {
                json.put("success", false);
                json.put("message", "Username or password is null");
            } else {
                final Credential credential = new Credential(username, password);
                if (cache.contains(credential)) {
                    token = UUID.randomUUID().toString();
                    session.setAttribute(TOKEN_NAME, token);
                    json.put("success", true);
                    json.put("message", "Logged in successfully");
                    json.put("sessionId", session.getId());
                    // expires/maxAge/httpOnly/path/secure/sameSite/signed etc.
                } else {
                    json.put("success", false);
                    json.put("message", format("No such user named '%s'", username));
                }
            }
        } else {
            // Already logged in, returns to index
            json.put("success", true);
        }

        return json.toString();
    }

    @PostMapping(value = "/register", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public String register(@RequestParam(value = "username", required = true) final String username,
            @RequestParam(value = "password", required = true) final String password) {

        final JSONObject json = new JSONObject();

        if (Objects.isNull(username) || Objects.isNull(password)) {
            json.put("success", false);
            json.put("message", "Username or password is null");
        } else {
            final Credential credential = new Credential(username, password);
            if (cache.contains(credential)) {
                json.put("success", false);
                json.put("message", "Username is already used");
            } else {
                cache.add(credential);
                json.put("success", true);
                json.put("message", "Registered successfully");
            }
        }

        return json.toString();
    }

    private static class Credential {

        private final String username;

        private final String password;

        Credential(final String username, final String password) {
            this.username = username;
            this.password = password;
        }

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + (password == null ? 0 : password.hashCode());
            result = prime * result + (username == null ? 0 : username.hashCode());
            return result;
        }

        @Override
        public boolean equals(final Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            Credential other = (Credential) obj;
            if (password == null) {
                if (other.password != null) {
                    return false;
                }
            } else if (!password.equals(other.password)) {
                return false;
            }
            if (username == null) {
                if (other.username != null) {
                    return false;
                }
            } else if (!username.equals(other.username)) {
                return false;
            }
            return true;
        }
    }
}