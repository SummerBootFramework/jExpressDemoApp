package org.jexpress.demoapp.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record MyRequest(
        @NotBlank String creditCardNumber,
        String ownerPwd,
        String userPwd,
        @JsonSetter(nulls = Nulls.SKIP) Float pdfVersion,
        @NotEmpty List<String> shoppingList
) {
    public MyRequest {
        if (pdfVersion == null) {
            pdfVersion = 2.0f;
        }
    }
}
