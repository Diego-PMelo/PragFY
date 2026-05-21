package com.pragfy.category;

import com.pragfy.category.dto.CategoryRequest;
import com.pragfy.category.dto.CategoryResponse;
import com.pragfy.exception.ResourceNotFoundException;
import com.pragfy.user.User;
import com.pragfy.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> findByUser(Long userId) {
        return categoryRepository.findByUserId(userId).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        Category category = Category.builder()
                .user(user)
                .name(request.name())
                .type(request.type())
                .color(request.color())
                .icon(request.icon())
                .build();
        return CategoryResponse.from(categoryRepository.save(category));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        category.setName(request.name());
        category.setType(request.type());
        category.setColor(request.color());
        category.setIcon(request.icon());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoria não encontrada");
        }
        categoryRepository.deleteById(id);
    }
}
