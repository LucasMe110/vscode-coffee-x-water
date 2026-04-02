const vscode = require('vscode');

let cafeCount = 0;
let aguaCount = 0;
let sidebarProvider = null;

const i18n = {
  en: {
    dangerText: 'Your kidney is in danger!',
    warning: '⚠️ Your kidney is shaking! Drink more water! 💧',
    reset: 'Coffee × Water: Counters reset!',
    coffee: 'Coffee',
    water: 'Water',
    happyMessages: [
      "Your kidney just sent you a thank-you card!",
      "Kidney says: finally someone who loves me!",
      "Your kidney is doing a happy dance right now!",
      "Plot twist: your kidney wants to nominate you for a Nobel Prize!",
      "Your kidney called. It said you're its favorite human.",
      "Kidney status: living its best life!",
      "Your kidney wrote you a 5-star review on Yelp.",
      "Breaking news: kidney declares today a national holiday!",
      "Your kidney is so happy it started singing in the shower.",
      "Kidney memo: promotion from 'meh' to 'absolute legend'!"
    ]
  },
  pt: {
    dangerText: 'Seu rim está em perigo!',
    warning: '⚠️ Seu rim está tremendo! Beba mais água! 💧',
    reset: 'Café × Água: Contadores resetados!',
    coffee: 'Café',
    water: 'Água',
    happyMessages: [
      "Seu rim acabou de te enviar um cartão de agradecimento!",
      "Rim diz: finalmente alguém que me ama!",
      "Seu rim está dançando de felicidade agora!",
      "Plot twist: seu rim quer te indicar para o Prêmio Nobel!",
      "Seu rim ligou. Disse que você é o humano favorito dele.",
      "Status do rim: vivendo sua melhor vida!",
      "Seu rim te deu 5 estrelas no Google.",
      "Última hora: rim decreta hoje feriado nacional!",
      "Seu rim está tão feliz que começou a cantar no chuveiro.",
      "Memo do rim: promoção de 'meh' para 'lenda absoluta'!"
    ]
  }
};

function getLang() {
  return vscode.workspace.getConfiguration('cafeXAgua').get('language', 'en');
}

function t() {
  return i18n[getLang()] || i18n.en;
}

class CafeAguaSidebarProvider {
  constructor(extensionUri) {
    this._view = null;
    this._extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
    };

    const happyImg = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'kidney-happy.png')
    );
    const sadImg = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'kidney-sad.png')
    );

    webviewView.webview.html = getWebviewContent(happyImg, sadImg);

    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg.type === 'addCafe') {
        cafeCount++;
        this.update();
        this._checkKidneyWarning();
      } else if (msg.type === 'addAgua') {
        aguaCount++;
        this.update();
        this._checkKidneyWarning();
      } else if (msg.type === 'reset') {
        cafeCount = 0;
        aguaCount = 0;
        this.update();
        vscode.window.showInformationMessage(t().reset);
      }
    });

    // Send initial state
    this.update();
  }

  update() {
    if (this._view) {
      const lang = t();
      this._view.webview.postMessage({
        type: 'update',
        cafe: cafeCount,
        agua: aguaCount,
        alert: isKidneyAlert(),
        happy: isKidneyHappy(),
        lang: {
          dangerText: lang.dangerText,
          coffee: lang.coffee,
          water: lang.water,
          happyMessages: lang.happyMessages
        }
      });
    }
  }

  _checkKidneyWarning() {
    if (isKidneyAlert()) {
      vscode.window.showWarningMessage(t().warning);
    }
  }
}

function isKidneyAlert() {
  return (cafeCount - aguaCount) >= 3;
}

function isKidneyHappy() {
  return aguaCount > 0 && aguaCount > cafeCount;
}

function activate(context) {
  sidebarProvider = new CafeAguaSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('cafeXAgua.sidebarView', sidebarProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cafeXAgua.addCafe', () => {
      cafeCount++;
      sidebarProvider.update();
      sidebarProvider._checkKidneyWarning();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cafeXAgua.addAgua', () => {
      aguaCount++;
      sidebarProvider.update();
      sidebarProvider._checkKidneyWarning();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cafeXAgua.reset', () => {
      cafeCount = 0;
      aguaCount = 0;
      sidebarProvider.update();
      vscode.window.showInformationMessage(t().reset);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cafeXAgua.changeLanguage', async () => {
      const current = getLang();
      const picked = await vscode.window.showQuickPick(
        [
          { label: '🇺🇸 English', value: 'en', picked: current === 'en' },
          { label: '🇧🇷 Português', value: 'pt', picked: current === 'pt' }
        ],
        { placeHolder: current === 'en' ? 'Select language' : 'Selecione o idioma' }
      );
      if (picked) {
        await vscode.workspace.getConfiguration('cafeXAgua').update('language', picked.value, true);
        sidebarProvider.update();
      }
    })
  );

  // Re-render when language setting changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('cafeXAgua.language')) {
        sidebarProvider.update();
      }
    })
  );
}

function getWebviewContent(happyImg, sadImg) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: 'Segoe UI', sans-serif;
      padding: 12px 8px;
      position: relative;
      min-height: 200px;
    }

    .counter-group {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(30, 30, 30, 0.7);
      border-radius: 12px;
      padding: 8px 16px;
    }
    .counter {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #ccc;
    }
    .counter .icon { font-size: 20px; }
    .counter .num {
      font-weight: bold;
      font-size: 18px;
      color: #fff;
    }
    .vs {
      color: #888;
      font-size: 12px;
      font-weight: bold;
    }

    .buttons {
      display: flex;
      gap: 6px;
      margin-top: 10px;
    }
    .btn {
      border: none;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 13px;
      cursor: pointer;
      color: #fff;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.8; }
    .btn-cafe { background: #6f4e37; }
    .btn-agua { background: #2196F3; }
    .btn-reset { background: #555; }

    .kidney-container {
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .kidney {
      width: 80px;
      height: auto;
      animation: shake 0.3s ease-in-out infinite;
    }
    .status-text {
      font-size: 11px;
      color: #ff6b6b;
      font-weight: bold;
      text-align: center;
      animation: blink 0.8s infinite;
    }

    .kidney-container.hidden {
      display: none;
    }

    .happy-container {
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .happy-kidney {
      width: 80px;
      height: auto;
      animation: bounce 1s ease-in-out infinite;
    }
    .happy-text {
      font-size: 11px;
      color: #4ecdc4;
      font-weight: bold;
      text-align: center;
    }
    .happy-container.hidden {
      display: none;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      25% { transform: translateX(-4px) rotate(-5deg); }
      50% { transform: translateX(4px) rotate(5deg); }
      75% { transform: translateX(-4px) rotate(-3deg); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(5deg); }
      50% { transform: translateY(0) rotate(0deg); }
      75% { transform: translateY(-4px) rotate(-3deg); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .drop {
      position: fixed;
      font-size: 14px;
      animation: fall 2s linear forwards;
      opacity: 0;
    }
    @keyframes fall {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(60px); }
    }
    .steam {
      position: fixed;
      font-size: 12px;
      animation: rise 1.5s linear forwards;
      opacity: 0;
    }
    @keyframes rise {
      0% { opacity: 0.8; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-40px); }
    }
  </style>
</head>
<body>
  <div class="happy-container hidden" id="happy-container">
    <img class="happy-kidney" src="${happyImg}" alt="Happy kidney" />
    <div class="happy-text" id="happy-text"></div>
  </div>

  <div class="kidney-container hidden" id="kidney-container">
    <img class="kidney" id="kidney" src="${sadImg}" alt="Sad kidney" />
    <div class="status-text" id="danger-text">Your kidney is in danger!</div>
  </div>

  <div class="counter-group">
    <div class="counter">
      <span class="icon">☕</span>
      <span class="num" id="cafe-num">0</span>
    </div>
    <span class="vs">×</span>
    <div class="counter">
      <span class="icon">💧</span>
      <span class="num" id="agua-num">0</span>
    </div>
  </div>

  <div class="buttons">
    <button class="btn btn-cafe" id="btn-cafe">☕ Coffee</button>
    <button class="btn btn-agua" id="btn-agua">💧 Water</button>
    <button class="btn btn-reset" id="btn-reset">↺</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let cafe = 0;
    let agua = 0;

    document.getElementById('btn-cafe').addEventListener('click', () => {
      vscode.postMessage({ type: 'addCafe' });
    });
    document.getElementById('btn-agua').addEventListener('click', () => {
      vscode.postMessage({ type: 'addAgua' });
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
      vscode.postMessage({ type: 'reset' });
    });

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'update') {
        const prevCafe = cafe;
        const prevAgua = agua;
        cafe = msg.cafe;
        agua = msg.agua;
        const lang = msg.lang;

        document.getElementById('cafe-num').textContent = cafe;
        document.getElementById('agua-num').textContent = agua;

        // Update button labels
        document.getElementById('btn-cafe').textContent = '☕ ' + lang.coffee;
        document.getElementById('btn-agua').textContent = '💧 ' + lang.water;

        // Update danger text
        document.getElementById('danger-text').textContent = lang.dangerText;


        const kidneyContainer = document.getElementById('kidney-container');
        const happyContainer = document.getElementById('happy-container');
        const happyText = document.getElementById('happy-text');

        if (msg.alert) {
          kidneyContainer.classList.remove('hidden');
          happyContainer.classList.add('hidden');
        } else if (msg.happy) {
          kidneyContainer.classList.add('hidden');
          happyContainer.classList.remove('hidden');
          happyText.textContent = lang.happyMessages[Math.floor(Math.random() * lang.happyMessages.length)];
        } else {
          kidneyContainer.classList.add('hidden');
          happyContainer.classList.add('hidden');
        }

        if (cafe > prevCafe) spawnSteam();
        if (agua > prevAgua) spawnDrop();
      }
    });

    function spawnDrop() {
      const drop = document.createElement('div');
      drop.className = 'drop';
      drop.textContent = '💧';
      drop.style.left = (Math.random() * 80 + 10) + '%';
      drop.style.top = '10px';
      document.body.appendChild(drop);
      setTimeout(() => drop.remove(), 2000);
    }

    function spawnSteam() {
      const steam = document.createElement('div');
      steam.className = 'steam';
      steam.textContent = '☁️';
      steam.style.left = (Math.random() * 80 + 10) + '%';
      steam.style.bottom = '20px';
      document.body.appendChild(steam);
      setTimeout(() => steam.remove(), 1500);
    }
  </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };
