@echo off
setlocal enabledelayedexpansion
title PragFY - Inicializador

echo.
echo  ==========================================
echo       PragFY - Inicializador
echo  ==========================================
echo.

:: 1. Localizar o Java
echo [1/3] Verificando Java...

where java >nul 2>&1
if %ERRORLEVEL% == 0 goto java_ok

for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
    if exist "%%~d\bin\java.exe" (
        set "JAVA_HOME=%%~d"
        set "PATH=%%~d\bin;%PATH%"
        goto java_ok
    )
)

for /d %%d in ("C:\Program Files\Java\jdk-17*") do (
    if exist "%%~d\bin\java.exe" (
        set "JAVA_HOME=%%~d"
        set "PATH=%%~d\bin;%PATH%"
        goto java_ok
    )
)

for /d %%d in ("C:\Program Files\Microsoft\jdk-17*") do (
    if exist "%%~d\bin\java.exe" (
        set "JAVA_HOME=%%~d"
        set "PATH=%%~d\bin;%PATH%"
        goto java_ok
    )
)

echo.
echo  [ERRO] Java 17 nao encontrado.
echo  Instale em: https://adoptium.net
echo  Depois execute este arquivo novamente.
echo.
pause
exit /b 1

:java_ok
echo  OK - Java encontrado.
echo.

:: 2. Subir o Backend
echo [2/3] Iniciando o backend (Spring Boot)...
echo  Isso pode levar alguns segundos na primeira execucao.
echo.

set "BACKEND_DIR=%~dp0backend"
start "PragFY Backend" cmd /k "cd /d "%BACKEND_DIR%" && mvnw.cmd spring-boot:run"

echo  Aguardando servidor na porta 8080...
set tentativas=0

:aguarda
set /a tentativas+=1
if %tentativas% gtr 40 (
    echo.
    echo  [ERRO] Backend demorou demais para iniciar.
    echo  Verifique a janela "PragFY Backend" para detalhes.
    echo.
    pause
    exit /b 1
)
ping 127.0.0.1 -n 4 >nul 2>&1
powershell -NoProfile -Command "try { Invoke-WebRequest http://localhost:8080/api/categories?idUsuario=0 -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop | Out-Null; exit 0 } catch { if ($_.Exception.Response) { exit 0 } else { exit 1 } }" >nul 2>&1
if %ERRORLEVEL% neq 0 goto aguarda

echo  OK - Backend no ar!
echo.

:: 3. Abrir o Frontend
echo [3/3] Abrindo o frontend no navegador...
start "" "%~dp0frontend\index.html"
echo  OK - Frontend aberto.
echo.

echo  ==========================================
echo   PragFY rodando com sucesso!
echo.
echo   Login de teste:
echo   E-mail : diego@pragfy.com
echo   Senha  : 123456
echo.
echo   Para encerrar, feche a janela
echo   "PragFY Backend".
echo  ==========================================
echo.
pause
endlocal
