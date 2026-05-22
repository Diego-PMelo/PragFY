package com.pragfy.Transacao.Apresentacao;

import com.pragfy.Transacao.Aplicacao.DTO.ResumoMensalDTO;
import com.pragfy.Transacao.Aplicacao.DTO.TransacaoRequestDTO;
import com.pragfy.Transacao.Aplicacao.DTO.TransacaoResponseDTO;
import com.pragfy.Transacao.Aplicacao.TransacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransacaoController {

    private final TransacaoService transacaoService;

    @GetMapping
    public List<TransacaoResponseDTO> ListarPorUsuarioEMes(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("mes") int mes,
            @RequestParam("ano") int ano) {
        return transacaoService.ListarPorUsuarioEMes(idUsuario, mes, ano);
    }

    @GetMapping("/summary")
    public ResumoMensalDTO ObterResumoMensal(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("mes") int mes,
            @RequestParam("ano") int ano) {
        return transacaoService.ObterResumoMensal(idUsuario, mes, ano);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransacaoResponseDTO Criar(@Valid @RequestBody TransacaoRequestDTO requisicao) {
        return transacaoService.Criar(requisicao);
    }

    @PutMapping("/{id}")
    public TransacaoResponseDTO Atualizar(@PathVariable Long id,
                                          @Valid @RequestBody TransacaoRequestDTO requisicao) {
        return transacaoService.Atualizar(id, requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void Excluir(@PathVariable Long id) {
        transacaoService.Excluir(id);
    }
}
