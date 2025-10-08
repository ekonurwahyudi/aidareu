@echo off
REM Script untuk restore PostgreSQL database backup di Windows

REM Database credentials
SET DB_HOST=localhost
SET DB_PORT=5432
SET DB_NAME=aidareu
SET DB_USER=postgres
SET DB_PASSWORD=postgres

REM Backup file location
SET BACKUP_FILE=postgres-202510081508.sql

echo ======================================
echo PostgreSQL Database Restore Script
echo ======================================
echo Host: %DB_HOST%:%DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo Backup File: %BACKUP_FILE%
echo ======================================
echo.

REM Check if backup file exists
IF NOT EXIST "%BACKUP_FILE%" (
    echo Error: Backup file '%BACKUP_FILE%' not found!
    exit /b 1
)

echo Backup file found
echo.

REM Set password for psql
SET PGPASSWORD=%DB_PASSWORD%

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to be ready...
:wait_loop
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "\q" 2>nul
IF ERRORLEVEL 1 (
    echo PostgreSQL is unavailable - sleeping
    timeout /t 2 /nobreak >nul
    goto wait_loop
)

echo PostgreSQL is ready!
echo.

REM Create database if not exists
echo Creating database '%DB_NAME%'...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" postgres 2>nul
echo.

REM Restore database
echo Restoring database from backup...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%"

IF ERRORLEVEL 1 (
    echo.
    echo Error: Database restore failed!
    exit /b 1
) ELSE (
    echo.
    echo Database restored successfully!
    echo.

    REM Show table count
    FOR /F "usebackq tokens=*" %%i IN (`psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`) DO SET TABLE_COUNT=%%i
    echo Total tables: %TABLE_COUNT%
    echo.
    echo ======================================
    echo Restore completed!
    echo ======================================
)
