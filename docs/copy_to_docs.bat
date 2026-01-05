@echo off
REM ------------------------
REM 設定
REM ------------------------
SET SRC=qgis2web_output
SET DEST=docs

REM ------------------------
REM docs フォルダ作成（なければ）
REM ------------------------
if not exist "%DEST%" mkdir "%DEST%"

REM ------------------------
REM フォルダ丸ごとコピー
REM ------------------------
xcopy "%SRC%\*" "%DEST%\" /E /Y /I

REM ------------------------
REM index.html の相対パス置換（必要なら）
REM ------------------------
REM PowerShell を使って置換する例
REM 直下構造なら置換不要
REM powershell -Command "(Get-Content '%DEST%\index.html') -replace 'src=\"images/', 'src=\"docs/images/' | Set-Content '%DEST%\index.html'"

echo qgis2web 出力を docs にコピー完了。
pause
