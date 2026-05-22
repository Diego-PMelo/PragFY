package com.pragfy.Categoria.Aplicacao;

import com.pragfy.Categoria.Aplicacao.DTO.CategoriaRequestDTO;
import com.pragfy.Categoria.Aplicacao.DTO.CategoriaResponseDTO;
import com.pragfy.Categoria.Dominio.CategoriaEntity;
import com.pragfy.Categoria.Dominio.CategoriaRepository;
import com.pragfy.Compartilhado.Excecao.RecursoNaoEncontradoException;
import com.pragfy.Usuario.Dominio.UsuarioEntity;
import com.pragfy.Usuario.Dominio.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<CategoriaResponseDTO> ListarPorUsuario(Long idUsuario) {
        return categoriaRepository.BuscarPorIdUsuario(idUsuario).stream()
                .map(CategoriaResponseDTO::De)
                .toList();
    }

    public CategoriaResponseDTO Criar(CategoriaRequestDTO requisicao) {
        UsuarioEntity usuario = usuarioRepository.findById(requisicao.idUsuario())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        CategoriaEntity categoria = CategoriaEntity.builder()
                .usuario(usuario)
                .nome(requisicao.nome())
                .tipo(requisicao.tipo())
                .cor(requisicao.cor())
                .icone(requisicao.icone())
                .build();
        return CategoriaResponseDTO.De(categoriaRepository.save(categoria));
    }

    public CategoriaResponseDTO Atualizar(Long id, CategoriaRequestDTO requisicao) {
        CategoriaEntity categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));
        categoria.setNome(requisicao.nome());
        categoria.setTipo(requisicao.tipo());
        categoria.setCor(requisicao.cor());
        categoria.setIcone(requisicao.icone());
        return CategoriaResponseDTO.De(categoriaRepository.save(categoria));
    }

    public void Excluir(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Categoria não encontrada");
        }
        categoriaRepository.deleteById(id);
    }
}
