package org.jexpress.sampleapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record MyRequest(
        @NotBlank String creditCardNumber,
        @NotEmpty List<String> shoppingList
) {
}
