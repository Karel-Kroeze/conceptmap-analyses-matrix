@ECHO OFF
ECHO Building bundled global module with parcel 1.x
cmd /c parcel -V
cmd /c parcel build -o analyzer.js --global analyzer --target browser --bundle-node-modules src/index.ts

ECHO.
ECHO Building bundled typescript definitions with parcel 2.x
cmd /c npx parcel -V
cmd /c npx parcel build --target types --log-level error --no-cache --no-source-maps src/index.ts

ECHO.
ECHO Wrapping types in namespace
echo export as namespace analyzer; > temp
echo export = analyzer; >> temp
echo. >> temp
echo declare namespace analyzer { >> temp
cmd /c cat dist/analyzer.d.ts >> temp
echo } >> temp
cmd /c mv temp dist/analyzer.global.d.ts

ECHO.
ECHO Copying files to target location
cmd /c cp -uv dist/analyzer.js* /d/Source/next-lab/client/tools/cm2/libs
cmd /c cp -uv dist/analyzer.global.d.ts /d/Source/next-lab/client/tools/cm2/types/analyzer.d.ts