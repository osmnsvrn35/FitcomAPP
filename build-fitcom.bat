@echo off

echo Installing backend dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Backend installation failed
    exit /b %errorlevel%
)

echo Installing frontend dependencies...
cd frontend\fitcom_app
npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed
    exit /b %errorlevel%
)

echo All dependencies installed successfully.
