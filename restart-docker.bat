@echo off
echo Restarting Docker service with elevated privileges...
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command \"Restart-Service docker\"'"
echo Docker service restarted. Try your build command again.
