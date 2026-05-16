package org.jexpress.demoapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record MyRequest(
        @NotBlank String creditCardNumber,
        String ownerPwd,
        String userPwd,
        float pdfVersion,
        @NotEmpty List<String> shoppingList
) {
}
