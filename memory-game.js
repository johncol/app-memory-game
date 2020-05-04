const gameImgSources = Array.from({ length: 8 }).map((_, index) => `./images/${index}.png`);
const staticImgSources = {
  placeholder: './images/placeholder.png',
  done: './images/done.png',
};

const state = {
  waitingForCheck: false,
  currentVisible: null,
  completed: [],
  score: 0,
  triesSinceLastMatch: 0,

  setCurrentVisible(imgElement) {
    this.currentVisible = imgElement;
  },

  addCompleted(imgElement) {
    this.completed.push(imgElement);
  },

  increaseScore() {
    this.score += 1 / this.triesSinceLastMatch;
    this.triesSinceLastMatch = 0;
  },
};

const showImage = (imgElement) => {
  imgElement.setAttribute('src', imgElement.getAttribute('data-src'));
};

const hideImage = (imgElement) => {
  imgElement.setAttribute('src', staticImgSources.placeholder);
};

const isImageVisible = (imgElement) => {
  return imgElement.getAttribute('src').indexOf('placeholder') === -1;
};

const isImageDone = (imgElement) => {
  return imgElement.getAttribute('data-done') === 'true';
};

const markAsDone = (imgElement) => {
  imgElement.setAttribute('data-done', true);
  imgElement.setAttribute('src', staticImgSources.done);
  state.addCompleted(imgElement);
};

const imagesMatch = (imgElement) => {
  if (!state.currentVisible) {
    throw new Error('First image expected to have already been selected, but no');
  }
  return state.currentVisible.getAttribute('data-src') === imgElement.getAttribute('data-src');
};

const updateView = () => {
  document.getElementById('score').innerText = state.score.toFixed(2);
};

const compareAndUpdateScore = (imgElement) => {
  if (imagesMatch(imgElement)) {
    markAsDone(imgElement);
    markAsDone(state.currentVisible);
    state.increaseScore();
    updateView();
  } else {
    hideImage(imgElement);
    hideImage(state.currentVisible);
  }
};

const waitAMomentAndThen = (callback) => {
  setTimeout(callback, 1000);
};

const toggleImage = (event) => {
  if (state.waitingForCheck) {
    return;
  }

  const imgElement = event.target;
  if (isImageDone(imgElement)) {
    return;
  }

  if (!isImageVisible(imgElement)) {
    showImage(imgElement);
    const isFirstImg = !state.currentVisible;
    const isSecondImg = !isFirstImg;
    state.waitingForCheck = isSecondImg;
    if (isFirstImg) {
      state.setCurrentVisible(imgElement);
    } else {
      waitAMomentAndThen(() => {
        state.triesSinceLastMatch++;
        compareAndUpdateScore(imgElement);
        state.setCurrentVisible(null);
        state.waitingForCheck = false;
      });
    }
  }
};

const buildImgElements = (gameImgSources) => {
  return gameImgSources.map((src, index) => {
    const imgElement = document.createElement('img');
    imgElement.setAttribute('src', staticImgSources.placeholder);
    imgElement.setAttribute('data-index', index);
    imgElement.setAttribute('data-src', src);
    imgElement.addEventListener('click', toggleImage);
    return imgElement;
  });
};

const addImagesToGameGrid = (imgElements) => {
  const gameGrid = document.getElementById('game');
  imgElements.forEach((imgElement) => {
    gameGrid.appendChild(imgElement);
  });
};

const imgElements = [...buildImgElements(gameImgSources), ...buildImgElements(gameImgSources)].sort(
  () => 0.5 - Math.random()
);
addImagesToGameGrid(imgElements);
updateView();
