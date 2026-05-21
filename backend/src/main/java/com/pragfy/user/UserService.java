package com.pragfy.user;

import com.pragfy.exception.BusinessException;
import com.pragfy.exception.ResourceNotFoundException;
import com.pragfy.user.dto.LoginRequest;
import com.pragfy.user.dto.RegisterRequest;
import com.pragfy.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email já cadastrado");
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(request.password())
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Email ou senha inválidos"));
        if (!user.getPassword().equals(request.password())) {
            throw new BusinessException("Email ou senha inválidos");
        }
        return UserResponse.from(user);
    }

    public UserResponse findById(Long id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }
}
