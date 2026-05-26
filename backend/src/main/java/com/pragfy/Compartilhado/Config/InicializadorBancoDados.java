package com.pragfy.Compartilhado.Config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Inicializa o banco de dados ao subir a aplicação.
 *
 * <p>Fluxo na inicialização:
 * <ol>
 *   <li>Dispose — remove tabelas de uma execução anterior (erros ignorados)</li>
 *   <li>DDL     — cria o schema completo</li>
 *   <li>Seed    — popula os dados iniciais</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InicializadorBancoDados {

    private final DataSource dataSource;

    @PostConstruct
    public void inicializar() {
        log.info("═══════════════════════════════════════════");
        log.info("  PragFY — Inicializando banco de dados");
        log.info("═══════════════════════════════════════════");

        log.info("[1/3] Dispose preventivo (limpando estado anterior)...");
        executarScript("sql/dispose.sql", true);

        log.info("[2/3] DDL — criando schema...");
        executarScript("sql/ddl.sql", false);

        log.info("[3/3] Seed — populando dados iniciais...");
        executarScript("sql/seed.sql", false);

        log.info("Banco de dados pronto.");
        log.info("═══════════════════════════════════════════");
    }

    // ─────────────────────────────────────────────────────────

    private void executarScript(String caminho, boolean ignorarErros) {
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource(caminho));
            populator.setSqlScriptEncoding("UTF-8");
            populator.setSeparator(";");
            populator.setContinueOnError(ignorarErros);
            populator.execute(dataSource);
            log.info("  ✔ {}", caminho);
        } catch (Exception e) {
            if (ignorarErros) {
                log.warn("  ⚠ {} — ignorado: {}", caminho, e.getMessage());
            } else {
                log.error("  ✘ {} — FALHA: {}", caminho, e.getMessage());
                throw new RuntimeException("Falha ao executar script SQL: " + caminho, e);
            }
        }
    }
}
