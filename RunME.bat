@echo off
cd /d "%~dp0ACTA-Norge WebPage"
start cmd /k "node server.js"
echo Server is running at http://acta-norge.ddns.net/
pause
