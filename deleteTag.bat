@echo off
set /p version=Introduce la version a eliminar (por ejemplo, vX.X.X):
git tag -d %version%
git push origin --delete %version%
