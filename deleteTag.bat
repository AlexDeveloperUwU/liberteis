@echo off
set /p version=Introduce la versión a eliminar (por ejemplo, vX.X.X):
git tag -d %version%
git push origin --delete %version%
