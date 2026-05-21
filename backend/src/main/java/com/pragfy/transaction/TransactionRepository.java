package com.pragfy.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND MONTH(t.date) = :month AND YEAR(t.date) = :year " +
           "ORDER BY t.date DESC")
    List<Transaction> findByUserAndMonth(
            @Param("userId") Long userId,
            @Param("month") int month,
            @Param("year") int year);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type " +
           "AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    BigDecimal sumByUserAndTypeAndMonth(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("month") int month,
            @Param("year") int year);
}
