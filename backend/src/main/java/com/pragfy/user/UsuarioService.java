package com.pragfy.user;

import com.pragfy.exception.RegraDeNegocioException;
import com.pragfy.exception.RecursoNaoEncontradoException;
import com.pragfy.user.dto.LoginRequestDTO;
import com.pragfy.user.dto.RegistroRequestDTO;
import com.pragfy.user.dto.UsuarioResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioResponseDTO Registrar(RegistroRequestDTO requisicao) {
        if (usuarioRepository.ExistePorEmail(requisicao.email())) {
            throw new RegraDeNegocioException("Email já cadastrado");
        }
        UsuarioEntity usuario = UsuarioEntity.builder()
                .nome(requisicao.name())
                .email(requisicao.email())
                .senha(requisicao.password())
                .build();
        return UsuarioResponseDTO.De(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO Autenticar(LoginRequestDTO requisicao) {
        UsuarioEntity usuario = usuarioRepository.BuscarPorEmail(requisicao.email())
                .orElseThrow(() -> new RegraDeNegocioException("Email ou senha inválidos"));
        if (!usuario.getSenha().equals(requisicao.password())) {
            throw new RegraDeNegocioException("Email ou senha inválidos");
        }
        return UsuarioResponseDTO.De(usuario);
    }

    public UsuarioResponseDTO BuscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(UsuarioResponseDTO::De)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }
}
