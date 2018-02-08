package com.kingyea.bigdata.apple.service;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.json.JSONObject;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Insert your comments here.
 *
 * @author <a href="mailto:zhanglulin@kingyea.com.cn">lulinzh</a>
 * @since 1.0.0
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class DataServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @Ignore("How to test service API without parameters?")
    public void registerWithoutParameters() throws Exception {
        mockMvc.perform(post("/register").accept(MediaType.APPLICATION_JSON)).andDo(result -> {
            final String jsonString = result.getResponse().getContentAsString();
            final JSONObject json = new JSONObject(jsonString);
            assertThat(json.getBoolean("success"), equalTo(true));
        });
    }

    @Test
    public void register() throws Exception {
        mockMvc.perform(post("/register").param("username", "test").param("password", "test")
                .accept(MediaType.APPLICATION_JSON)).andDo(result -> {
                    final String jsonString = result.getResponse().getContentAsString();
                    final JSONObject json = new JSONObject(jsonString);
                    assertThat(json.getBoolean("success"), equalTo(true));
                });
    }
}
