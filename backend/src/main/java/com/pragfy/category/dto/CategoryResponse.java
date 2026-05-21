package com.pragfy.category.dto;

import com.pragfy.category.Category;
import com.pragfy.category.CategoryType;

public record CategoryResponse(
        Long id,
        Long userId,
        String name,
        CategoryType type,
        String color,
        String icon
) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(
                c.getId(),
                c.getUser().getId(),
                c.getName(),
                c.getType(),
                c.getColor(),
                c.getIcon()
        );
    }
}
