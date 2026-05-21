package com.pragfy.user;

import com.pragfy.user.dto.LoginRequestDTO;
import com.pragfy.user.dto.RegistroRequestDTO;
import com.pragfy.user.dto.UsuarioResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO Registrar(@Valid @RequestBody RegistroRequestDTO requisicao) {
        return usuarioService.Registrar(requisicao);
    }

    @PostMapping("/login")
    public UsuarioResponseDTO Autenticar(@Valid @RequestBody LoginRequestDTO requisicao) {
        return usuarioService.Autenticar(requisicao);
    }

    @GetMapping("/users/{id}")
    public UsuarioResponseDTO BuscarPorId(@PathVariable Long id) {
        return usuarioService.BuscarPorId(id);
    }
}
