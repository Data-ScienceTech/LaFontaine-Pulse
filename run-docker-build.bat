@echo off
echo Running Docker build with elevated privileges...
powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd %cd% && docker image build --pull --file \"Dockerfile\" --tag \"viteractshardnts:latest\" --label \"com.microsoft.created-by=visual-studio-code\" --build-context \".\" && pause'"
echo If a UAC prompt appeared, please accept it to continue.
