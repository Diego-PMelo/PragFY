package com.pragfy.transaction;

import com.pragfy.transaction.dto.MonthlySummaryResponse;
import com.pragfy.transaction.dto.TransactionRequest;
import com.pragfy.transaction.dto.TransactionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<TransactionResponse> findByUserAndMonth(
            @RequestParam Long userId,
            @RequestParam int month,
            @RequestParam int year) {
        return transactionService.findByUserAndMonth(userId, month, year);
    }

    @GetMapping("/summary")
    public MonthlySummaryResponse getMonthlySummary(
            @RequestParam Long userId,
            @RequestParam int month,
            @RequestParam int year) {
        return transactionService.getMonthlySummary(userId, month, year);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(@Valid @RequestBody TransactionRequest request) {
        return transactionService.create(request);
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id,
                                      @Valid @RequestBody TransactionRequest request) {
        return transactionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        transactionService.delete(id);
    }
}
