package com.pragfy.Usuario.Aplicacao;

import com.pragfy.Compartilhado.Excecao.RecursoNaoEncontradoException;
import com.pragfy.Compartilhado.Excecao.RegraDeNegocioException;
import com.pragfy.Usuario.Aplicacao.DTO.LoginRequestDTO;
import com.pragfy.Usuario.Aplicacao.DTO.RegistroRequestDTO;
import com.pragfy.Usuario.Aplicacao.DTO.UsuarioResponseDTO;
import com.pragfy.Usuario.Dominio.UsuarioEntity;
import com.pragfy.Usuario.Dominio.UsuarioRepository;
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
                .nome(requisicao.nome())
                .email(requisicao.email())
                .senha(requisicao.senha())
                .build();
        return UsuarioResponseDTO.De(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO Autenticar(LoginRequestDTO requisicao) {
        UsuarioEntity usuario = usuarioRepository.BuscarPorEmail(requisicao.email())
                .orElseThrow(() -> new RegraDeNegocioException("Email ou senha inválidos"));
        if (!usuario.getSenha().equals(requisicao.senha())) {
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
