@ECHO OFF
@REM ECHO Building bundled global module with parcel 1.x
@REM cmd /c parcel -V
@REM cmd /c parcel build -o analyzer.js --global analyzer --target browser --bundle-node-modules --experimental-scope-hoisting src/index.ts

ECHO.
@REM ECHO Building bundled typescript definitions with parcel 2.x
@REM cmd /c npx parcel -V
cmd /c npx parcel build --target global src/global.ts 
cmd /c npx parcel build --target types src/index.ts src/**/*.d.ts

ECHO.
ECHO Wrapping types in namespace
echo // @ts-nocheck > temp
echo export as namespace analyzer; >> temp
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
exit