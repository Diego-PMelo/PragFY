# Gera os prints do protótipo (390x844 em 2x) com o Edge sem interface.
# Requer o servidor local na porta 5510 (python -m http.server 5510 na pasta do protótipo).
param([string]$Out = (Join-Path $PSScriptRoot '..\prints'))
Add-Type -AssemblyName System.Drawing
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$work = Join-Path $env:TEMP 'pragfy-shots'
$profile = Join-Path $work 'edge-profile'
$tmp = Join-Path $work 'raw'
New-Item -ItemType Directory -Force $tmp, $Out | Out-Null
Get-ChildItem $Out -Filter *.png | Remove-Item
# nome = parâmetros extras + rota (p = perfil de exemplo)
$shots = [ordered]@{
  '01-onboarding-problema'   = '&p=maria#/onboarding/1'
  '02-onboarding-fases'      = '&p=maria#/onboarding/3'
  '03-consentimento'         = '&p=maria#/conectar/permissoes'
  '04-maria-diag-dividas'    = '&p=maria#/diagnostico/3'
  '05-maria-texto-livre'     = '&p=maria#/diagnostico/7'
  '06-maria-leitura-ia'      = '&p=maria#/situacao'
  '07-maria-inicio'          = '&p=maria#/inicio'
  '08-maria-classificar'     = '&p=maria#/classificar'
  '09-maria-economias'       = '&p=maria#/economias'
  '10-maria-economias-cards' = '&p=maria&scroll=430#/economias'
  '11-maria-plano'           = '&p=maria#/plano'
  '12-maria-plano-passos'    = '&p=maria&scroll=520#/plano'
  '13-maria-negociar'        = '&p=maria#/negociar'
  '14-dividas-e-credito'     = '&p=maria&c=credito&open=0&scroll=420#/classe/credito'
  '15-maria-gastos'          = '&p=maria#/transacoes'
  '16-maria-analises'        = '&p=maria#/analise'
  '17-ana-inicio'            = '&p=ana#/inicio'
  '18-ana-leitura-ia'        = '&p=ana#/situacao'
  '19-ana-economias'         = '&p=ana&scroll=430#/economias'
  '20-ana-plano-reserva'     = '&p=ana#/plano'
  '21-diego-carteira'        = '&p=diego#/plano'
  '22-diego-carteira-classes' = '&p=diego&scroll=end#/plano'
  '23-diego-fiis-opcoes'     = '&p=diego&c=fiis&open=3&scroll=560#/classe/fiis'
  '24-diego-fiis-ia'         = '&p=diego&c=fiis&ask=0&scroll=end#/classe/fiis'
  '25-conta-perfis'          = '&p=maria#/conta'
}
foreach ($k in $shots.Keys) {
  $raw = Join-Path $tmp "$k.png"
  Remove-Item $raw -ErrorAction SilentlyContinue
  $url = "http://localhost:5510/?shot=1$($shots[$k])"
  & $edge --headless=new --disable-gpu --hide-scrollbars "--user-data-dir=$profile" --window-size=700,1100 --force-device-scale-factor=2 --virtual-time-budget=2500 "--screenshot=$raw" $url 2>$null | Out-Null
  $img = [System.Drawing.Image]::FromFile($raw)
  $crop = New-Object System.Drawing.Bitmap 780, 1688
  $g = [System.Drawing.Graphics]::FromImage($crop)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, 780, 1688), (New-Object System.Drawing.Rectangle 0, 0, 780, 1688), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $img.Dispose()
  $dest = Join-Path $Out "$k.png"
  $crop.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png); $crop.Dispose()
  "{0}  {1} KB" -f $k, [math]::Round((Get-Item $dest).Length / 1KB)
}
