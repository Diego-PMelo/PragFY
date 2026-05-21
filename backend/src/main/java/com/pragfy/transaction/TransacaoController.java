package com.pragfy.transaction;

import com.pragfy.transaction.dto.ResumoMensalDTO;
import com.pragfy.transaction.dto.TransacaoRequestDTO;
import com.pragfy.transaction.dto.TransacaoResponseDTO;
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
            @RequestParam("userId") Long idUsuario,
            @RequestParam("month") int mes,
            @RequestParam("year") int ano) {
        return transacaoService.ListarPorUsuarioEMes(idUsuario, mes, ano);
    }

    @GetMapping("/summary")
    public ResumoMensalDTO ObterResumoMensal(
            @RequestParam("userId") Long idUsuario,
            @RequestParam("month") int mes,
            @RequestParam("year") int ano) {
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
