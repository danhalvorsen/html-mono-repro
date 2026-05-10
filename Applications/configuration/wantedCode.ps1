$scriptPath = "C:\Users\danha\source\repos\HTML\MonoRepro\Applications\configuration\fetchCode.ps1"
$path1 = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-design-composite"
$path2 = "C:\Users\danha\source\repos\HTML\MonoRepro\Applications\composistion\composistion-demo"
$path3 = "C:\Users\danha\source\repos\HTML\MonoRepro\Applications\composistion\composistion-demo-02"
$path4 = "C:\Users\danha\source\repos\HTML\MonoRepro\Applications\composistion\composistion-demo-03"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath -IncludeTests -IncludeConfigs $path1 $path2 $path3 $path4
