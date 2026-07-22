# Backup rápido e atualização local do projeto
# Execute dentro de c:\Users\makar\OneDrive\Documents\livia

$root = (Get-Location).Path
if ($root -notlike '*\\livia') {
    Write-Error "Execute este script dentro de c:\\Users\\makar\\OneDrive\\Documents\\livia"
    exit 1
}

# 1) Backup do index.ejs
$indexPath = Join-Path $root 'views\index.ejs'
$backupPath = Join-Path $root 'views\index.ejs.bkp'
if (-Not (Test-Path $backupPath)) {
    Copy-Item $indexPath $backupPath -ErrorAction Stop
    Write-Host "Backup criado em views/index.ejs.bkp"
} else {
    Write-Host "Backup já existe: views/index.ejs.bkp"
}

# 2) Conteúdo Taplink (sem logo Canva, fundo acinzentado). Substitui o HTML interno.
$novo = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Taplink - Nosso Lugar</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    :root {
      --cor-principal: #7a2734;
      --cor-secundaria: #5d1d29;
      --cor-terciaria: #f8f1ea;
      --cor-fundo: #ebebeb;
      --cor-texto: #2a1a1e;
      --cor-card: #f6f3ee;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: var(--cor-fundo); color: var(--cor-texto); min-height: 100vh; }
    .navbar { background: linear-gradient(90deg, var(--cor-principal), var(--cor-secundaria)) !important; }
    .hero {max-width: 1000px; margin: 2rem auto; border-radius: 16px; background: linear-gradient(160deg, var(--cor-principal), var(--cor-secundaria)); color: var(--cor-terciaria); padding: 2.6rem 1.4rem; box-shadow: 0 12px 35px rgba(0,0,0,0.2); text-align:center;}
    .hero h1 { font-size: clamp(2rem,5vw,3.5rem); margin-bottom: 0.8rem; }
    .hero p { font-size: 1.2rem; margin-bottom: 1rem; }
    .btn-principal {color:#f8f1ea; background:#7a2734; border:0; padding:0.75rem 1.5rem; border-radius:10px; text-decoration:none; font-weight:600;}
    .about-card, .secao-card, .contato {margin: 1rem auto; max-width: 1000px; background: var(--cor-card); border:1px solid rgba(122,39,52,0.15); border-radius:14px; box-shadow:0 8px 24px rgba(0,0,0,0.12); padding:1.4rem;}
    .secao { display:grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap:1rem; }
    .secao-card {transition: transform .25s ease, box-shadow .25s ease;}
    .secao-card:hover {transform:translateY(-6px); box-shadow:0 14px 28px rgba(0,0,0,0.2);} 
    .contato-buttons {display:flex;flex-wrap:wrap;justify-content:center;gap:0.75rem;}
    .btn-secondary {padding:0.7rem 1.3rem;background:#f8f1ea;color:#2a1a1e;border:2px solid #7a2734;border-radius:8px;text-decoration:none;font-weight:600;}
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top"><div class="container"><a class="navbar-brand" href="/">Taplink Casal</a></div></nav>
  <main class="container">
    <section class="hero">
      <h1>Taplink para Casal</h1>
      <p>Histórias, playlist, lembranças e cartas em um só lugar, fresco e elegante.</p>
      <a class="btn-principal" href="#contato">Contato</a>
    </section>

    <section class="about-card">
      <h2>Sobre Nós</h2>
      <p>Este projeto conecta momentos românticos: cartas, música, memórias. Visual leve e moderno inspirado em cores vinho + off-white.</p>
      <ul style="margin-left:1.1rem; list-style:disc; color:#5c3744;"><li>Cartas especiais</li><li>Playlist temática</li><li>Diário de lembranças</li></ul>
    </section>

    <section class="secao">
      <article class="secao-card"><h3>01 / Cartas</h3><p>Escreva, edite e compartilhe pequenas cartas para o seu par.</p></article>
      <article class="secao-card"><h3>02 / Playlist</h3><p>Selecione músicas, faça seu mood board sonoro.</p></article>
      <article class="secao-card"><h3>03 / Lembranças</h3><p>Armazene fotos e notas dos momentos especiais.</p></article>
    </section>

    <section id="contato" class="contato">
      <h2>Contato</h2>
      <div class="contato-buttons">
        <a class="btn-secondary" href="https://t.me/your">Telegram</a>
        <a class="btn-secondary" href="https://wa.me/your">Whatsapp</a>
      </div>
    </section>
  </main>
</body>
</html>
'@

Set-Content -Path $indexPath -Value $novo -Force
Write-Host "views/index.ejs atualizado com tema Taplink e paleta solicitada."

# 3) Garantir server está rodando (opcional)
$pid = (Get-Process -Name node -ErrorAction SilentlyContinue)
if ($null -eq $pid) {
    Write-Host "Nenhum processo Node ativo detectado. Inicie com: node server.js"
} else {
    Write-Host "Node.js está ativo. Verifique http://localhost:3000"
}

Write-Host "Pronto! Abra http://localhost:3000 no navegador para validar."