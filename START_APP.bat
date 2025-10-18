@echo off
echo ================================
echo École de la Bourse - Lancement
echo ================================
echo.

echo [1/3] Demarrage du Backend...
cd backend
start "EDB Backend" cmd /k "npm run start:dev"

timeout /t 15 /nobreak

echo.
echo [2/3] Demarrage du Frontend...
cd ..\frontend
start "EDB Frontend" cmd /k "npm run dev"

echo.
echo [3/3] Application en cours de démarrage...
echo.
echo ================================
echo   Application EDB
echo ================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo API Docs: http://localhost:3000/api/docs
echo.
echo Identifiants de test:
echo - Admin: admin@ecoledelabourse.com / Admin123!
echo - Coach: coach@ecoledelabourse.com / Coach123!
echo - Apprenant: apprenant@test.com / Apprenant123!
echo.
echo Attendez 30 secondes que tout demarre, puis ouvrez:
echo http://localhost:5173
echo.
pause
