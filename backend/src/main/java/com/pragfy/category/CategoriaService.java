package com.pragfy.category;

import com.pragfy.category.dto.CategoriaRequestDTO;
import com.pragfy.category.dto.CategoriaResponseDTO;
import com.pragfy.exception.RecursoNaoEncontradoException;
import com.pragfy.user.UsuarioEntity;
import com.pragfy.user.UsuarioRepository;
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
        UsuarioEntity usuario = usuarioRepository.findById(requisicao.userId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        CategoriaEntity categoria = CategoriaEntity.builder()
                .usuario(usuario)
                .nome(requisicao.name())
                .tipo(requisicao.type())
                .cor(requisicao.color())
                .icone(requisicao.icon())
                .build();
        return CategoriaResponseDTO.De(categoriaRepository.save(categoria));
    }

    public CategoriaResponseDTO Atualizar(Long id, CategoriaRequestDTO requisicao) {
        CategoriaEntity categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));
        categoria.setNome(requisicao.name());
        categoria.setTipo(requisicao.type());
        categoria.setCor(requisicao.color());
        categoria.setIcone(requisicao.icon());
        return CategoriaResponseDTO.De(categoriaRepository.save(categoria));
    }

    public void Excluir(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Categoria não encontrada");
        }
        categoriaRepository.deleteById(id);
    }
}
