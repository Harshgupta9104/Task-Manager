@echo off
REM Start the backend dev server (output goes to this terminal).
cd /d "%~dp0"
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
