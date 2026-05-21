package com.pragfy.transaction;

import com.pragfy.category.Category;
import com.pragfy.category.CategoryRepository;
import com.pragfy.exception.ResourceNotFoundException;
import com.pragfy.transaction.dto.MonthlySummaryResponse;
import com.pragfy.transaction.dto.TransactionRequest;
import com.pragfy.transaction.dto.TransactionResponse;
import com.pragfy.user.User;
import com.pragfy.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public List<TransactionResponse> findByUserAndMonth(Long userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
        return transactionRepository.findByUserAndMonth(userId, start, end).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    public MonthlySummaryResponse getMonthlySummary(Long userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
        BigDecimal totalIncome  = transactionRepository
                .sumByUserAndTypeAndMonth(userId, TransactionType.INCOME,  start, end);
        BigDecimal totalExpense = transactionRepository
                .sumByUserAndTypeAndMonth(userId, TransactionType.EXPENSE, start, end);
        return new MonthlySummaryResponse(month, year, totalIncome, totalExpense,
                totalIncome.subtract(totalExpense));
    }

    public TransactionResponse create(TransactionRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .amount(request.amount())
                .description(request.description())
                .date(request.date())
                .type(request.type())
                .build();

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public TransactionResponse update(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        }

        transaction.setCategory(category);
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description());
        transaction.setDate(request.date());
        transaction.setType(request.type());

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public void delete(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transação não encontrada");
        }
        transactionRepository.deleteById(id);
    }
}
