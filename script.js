// Estados
let numberOfLevers = 4;
let masterActiveLevers = new Set(); // IDs das alavancas que devem estar puxadas para "play" funcionar
let playerActiveLevers = new Set(); // IDs das alavancas puxadas pelo jogador

// Elementos DOM
const tabPlayers = document.getElementById('tab-players');
const tabMaster = document.getElementById('tab-master');
const playerScreen = document.getElementById('player-screen');
const masterScreen = document.getElementById('master-screen');
const playerLeversContainer = document.getElementById('player-levers');
const masterLeversList = document.getElementById('master-levers-list');
const numberLeversInput = document.getElementById('number-levers');
const playBtn = document.getElementById('play-btn');
const playerFeedback = document.getElementById('player-feedback');
const presentationModeBtn = document.getElementById('presentation-mode-btn');
const headerElement = document.querySelector('header'); // Seleciona o header

// Nomes dos arquivos de imagem das alavancas
const leverImages = {
  type1: {
    up: 'images/Alavanca-fina-1-cima.png',
    down: 'images/Alavanca-fina-1.png'
  },
  type2: {
    up: 'images/Alavanca-fina-2-cima.png',
    down: 'images/Alavanca-fina-2.png'
  }
};

// Cria as alavancas para jogadores, alternando os tipos
function createPlayerLevers(count) {
  playerLeversContainer.innerHTML = '';
  playerActiveLevers.clear();

  for (let i = 1; i <= count; i++) {
    const leverType = (i % 2 === 1) ? 'type1' : 'type2'; // Alterna tipo 1 e tipo 2
    const initialState = 'up'; // Estado inicial é 'para cima' (desativado)
    const initialImage = leverImages[leverType][initialState];

    const lev = document.createElement('div');
    lev.className = 'alavanca-jogador';
    lev.setAttribute('data-id', i);
    lev.setAttribute('data-type', leverType); // Armazena o tipo da alavanca
    lev.setAttribute('role', 'button');
    lev.setAttribute('tabindex', '0');
    lev.setAttribute('aria-pressed', 'false');
    lev.setAttribute('aria-label', `Alavanca ${i}, desativada`);

    const img = document.createElement('div');
    img.className = 'alavanca-img';
    img.style.backgroundImage = `url('${initialImage}')`;

    const label = document.createElement('div');
    label.className = 'alavanca-label';
    lev.appendChild(img);
    lev.appendChild(label);

    // Clique e teclado para ativar/desativar
    lev.addEventListener('click', () => togglePlayerLever(i, lev));
    lev.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePlayerLever(i, lev);
      }
    });

    playerLeversContainer.appendChild(lev);
  }
}

function togglePlayerLever(id, element) {
  const leverType = element.getAttribute('data-type');
  const imgElement = element.querySelector('.alavanca-img');
  let newState, newImage, newAriaLabel;

  if (playerActiveLevers.has(id)) {
    playerActiveLevers.delete(id);
    newState = 'up'; // Desativado -> para cima
    newAriaLabel = `Alavanca ${id}, desativada`;
    element.setAttribute('aria-pressed', 'false');
    element.classList.remove('active'); // Remove a classe active do CSS
  } else {
    playerActiveLevers.add(id);
    newState = 'down'; // Ativado -> para baixo
    newAriaLabel = `Alavanca ${id}, ativada`;
    element.setAttribute('aria-pressed', 'true');
    element.classList.add('active'); // Adiciona a classe active do CSS
  }

  newImage = leverImages[leverType][newState];
  imgElement.style.backgroundImage = `url('${newImage}')`;
  element.setAttribute('aria-label', newAriaLabel);

  playerFeedback.textContent = ''; // Limpa feedback ao interagir
}

// Criar as alavancas para mestre definir as necessárias para o play
function createMasterLevers(count) {
  masterLeversList.innerHTML = '';
  masterActiveLevers.clear(); // Limpa seleção anterior ao recriar

  for (let i = 1; i <= count; i++) {
    const container = document.createElement('label');
    container.className = 'alavanca-mestre';
    container.setAttribute('data-id', i);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `Alavanca ${i} deve ser puxada para o play`);

    checkbox.addEventListener('change', e => {
      const leverId = i;
      if (e.target.checked) {
        masterActiveLevers.add(leverId);
        container.classList.add('selected');
      } else {
        masterActiveLevers.delete(leverId);
        container.classList.remove('selected');
      }
    });

    container.appendChild(checkbox);
    container.appendChild(document.createTextNode(` Alavanca ${i}`));

    masterLeversList.appendChild(container);
  }
}

// Validação ao clicar no play
function onPlayClick() {
  if (playerActiveLevers.size !== masterActiveLevers.size) {
    showFeedback(false);
    return;
  }
  for (let id of masterActiveLevers) {
    if (!playerActiveLevers.has(id)) {
      showFeedback(false);
      return;
    }
  }
  showFeedback(true);
}

function showFeedback(success) {
  if (success) {
    playerFeedback.textContent = 'Alavancas corretamente ativada, cena ativada.';
    playerFeedback.className = 'feedback success';
  } else {
    playerFeedback.textContent = 'Combinação errada.';
    playerFeedback.className = 'feedback fail';
  }
}

// Atualiza o número de alavancas nas duas telas
function onNumberLeversChange(value) {
  const count = Math.min(12, Math.max(1, Number(value)));
  if (isNaN(count)) return; // Ignora se não for número

  numberOfLevers = count;
  numberLeversInput.value = count; // Garante que o input reflita o valor usado
  createMasterLevers(count);
  createPlayerLevers(count);
  playerFeedback.textContent = ''; // Limpa feedback ao mudar número
}

// Troca de tabs entre mestre e jogadores
function setupTabs() {
  tabPlayers.addEventListener('click', () => {
    tabPlayers.classList.add('active');
    tabPlayers.setAttribute('aria-selected', 'true');
    tabMaster.classList.remove('active');
    tabMaster.setAttribute('aria-selected', 'false');
    playerScreen.classList.add('active');
    masterScreen.classList.remove('active');
    playerScreen.focus();
  });
  tabMaster.addEventListener('click', () => {
    tabMaster.classList.add('active');
    tabMaster.setAttribute('aria-selected', 'true');
    tabPlayers.classList.remove('active');
    tabPlayers.setAttribute('aria-selected', 'false');
    masterScreen.classList.add('active');
    playerScreen.classList.remove('active');
    masterScreen.focus();
  });
}

// --- Fullscreen Logic ---
let isFullscreen = false;

function togglePresentationMode() {
  const elem = document.documentElement; // Target the whole page for fullscreen

  if (!isFullscreen) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    // Entrou em fullscreen
    document.body.classList.add('fullscreen-active');
    isFullscreen = true;
    presentationModeBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Full Screen';
    presentationModeBtn.style.display = 'none'; // Esconde o botão
  } else {
    // Saiu do fullscreen
    document.body.classList.remove('fullscreen-active');
    isFullscreen = false;
    presentationModeBtn.innerHTML = '<i class="fas fa-expand"></i> Full Screen';
    presentationModeBtn.style.display = 'inline-block'; // Mostra o botão de volta
  }
}

// Inicialização
function init() {
  setupTabs();
  onNumberLeversChange(numberLeversInput.value);

  numberLeversInput.addEventListener('change', e => {
    onNumberLeversChange(e.target.value);
  });
  playBtn.addEventListener('click', onPlayClick);

  if (presentationModeBtn) {
    presentationModeBtn.addEventListener('click', togglePresentationMode);
  }
}

// Garante que o DOM esteja carregado antes de executar o init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM já carregado
}
