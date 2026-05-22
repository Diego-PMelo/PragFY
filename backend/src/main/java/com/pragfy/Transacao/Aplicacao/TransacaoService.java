package com.pragfy.Transacao.Aplicacao;

import com.pragfy.Categoria.Dominio.CategoriaEntity;
import com.pragfy.Categoria.Dominio.CategoriaRepository;
import com.pragfy.Compartilhado.Excecao.RecursoNaoEncontradoException;
import com.pragfy.Transacao.Aplicacao.DTO.ResumoMensalDTO;
import com.pragfy.Transacao.Aplicacao.DTO.TransacaoRequestDTO;
import com.pragfy.Transacao.Aplicacao.DTO.TransacaoResponseDTO;
import com.pragfy.Transacao.Dominio.ETransacaoTipo;
import com.pragfy.Transacao.Dominio.TransacaoEntity;
import com.pragfy.Transacao.Dominio.TransacaoRepository;
import com.pragfy.Usuario.Dominio.UsuarioEntity;
import com.pragfy.Usuario.Dominio.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    public List<TransacaoResponseDTO> ListarPorUsuarioEMes(Long idUsuario, int mes, int ano) {
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim    = inicio.withDayOfMonth(inicio.lengthOfMonth());
        return transacaoRepository.BuscarPorUsuarioEMes(idUsuario, inicio, fim).stream()
                .map(TransacaoResponseDTO::De)
                .toList();
    }

    public ResumoMensalDTO ObterResumoMensal(Long idUsuario, int mes, int ano) {
        LocalDate inicio        = LocalDate.of(ano, mes, 1);
        LocalDate fim           = inicio.withDayOfMonth(inicio.lengthOfMonth());
        BigDecimal totalReceita = transacaoRepository.SomarPorUsuarioTipoEMes(idUsuario, ETransacaoTipo.INCOME,  inicio, fim);
        BigDecimal totalDespesa = transacaoRepository.SomarPorUsuarioTipoEMes(idUsuario, ETransacaoTipo.EXPENSE, inicio, fim);
        return new ResumoMensalDTO(mes, ano, totalReceita, totalDespesa, totalReceita.subtract(totalDespesa));
    }

    public TransacaoResponseDTO Criar(TransacaoRequestDTO requisicao) {
        UsuarioEntity usuario = usuarioRepository.findById(requisicao.idUsuario())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        CategoriaEntity categoria = null;
        if (requisicao.idCategoria() != null) {
            categoria = categoriaRepository.findById(requisicao.idCategoria())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));
        }

        TransacaoEntity transacao = TransacaoEntity.builder()
                .usuario(usuario)
                .categoria(categoria)
                .valor(requisicao.valor())
                .descricao(requisicao.descricao())
                .data(requisicao.data())
                .tipo(requisicao.tipo())
                .build();

        return TransacaoResponseDTO.De(transacaoRepository.save(transacao));
    }

    public TransacaoResponseDTO Atualizar(Long id, TransacaoRequestDTO requisicao) {
        TransacaoEntity transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transação não encontrada"));

        CategoriaEntity categoria = null;
        if (requisicao.idCategoria() != null) {
            categoria = categoriaRepository.findById(requisicao.idCategoria())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));
        }

        transacao.setCategoria(categoria);
        transacao.setValor(requisicao.valor());
        transacao.setDescricao(requisicao.descricao());
        transacao.setData(requisicao.data());
        transacao.setTipo(requisicao.tipo());

        return TransacaoResponseDTO.De(transacaoRepository.save(transacao));
    }

    public void Excluir(Long id) {
        if (!transacaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Transação não encontrada");
        }
        transacaoRepository.deleteById(id);
    }
}
