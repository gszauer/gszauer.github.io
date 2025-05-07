const MAJOR_ARCANA = [
  { 
    name: 'The Fool', 
    image: './images/0.png',
    upright: 'New beginnings, innocence, spontaneity, free spirit',
    upsideDown: 'Recklessness, risk-taking, foolish decisions'
  },
  { 
    name: 'The Magician', 
    image: './images/1.png',
    upright: 'Manifestation, resourcefulness, power, inspired action',
    upsideDown: 'Manipulation, poor planning, untapped talents'
  },
  { 
    name: 'The High Priestess', 
    image: './images/2.png',
    upright: 'Intuition, sacred knowledge, divine feminine, the subconscious mind',
    upsideDown: 'Secrets, disconnected from intuition, withdrawal and silence'
  },
  { 
    name: 'The Empress', 
    image: './images/3.png',
    upright: 'Femininity, beauty, nature, nurturing, abundance',
    upsideDown: 'Creative block, dependence on others, empty luxury'
  },
  { 
    name: 'The Emperor', 
    image: './images/4.png',
    upright: 'Authority, establishment, structure, a father figure',
    upsideDown: 'Domination, excessive control, lack of discipline'
  },
  { 
    name: 'The Hierophant', 
    image: './images/5.png',
    upright: 'Spiritual wisdom, religious beliefs, conformity, tradition',
    upsideDown: 'Personal beliefs, freedom, challenging the status quo'
  },
  { 
    name: 'The Lovers', 
    image: './images/6.png',
    upright: 'Love, harmony, relationships, values alignment, choices',
    upsideDown: 'Self-love, disharmony, imbalance, misalignment of values'
  },
  { 
    name: 'The Chariot', 
    image: './images/7.png',
    upright: 'Control, willpower, success, ambition, determination',
    upsideDown: 'Self-discipline, opposition, lack of direction'
  },
  { 
    name: 'Strength', 
    image: './images/8.png',
    upright: 'Strength, courage, persuasion, influence, compassion',
    upsideDown: 'Inner strength, self-doubt, low energy, raw emotion'
  },
  { 
    name: 'The Hermit', 
    image: './images/9.png',
    upright: 'Soul-searching, introspection, being alone, inner guidance',
    upsideDown: 'Isolation, loneliness, withdrawal'
  },
  { 
    name: 'Wheel of Fortune', 
    image: './images/10.png',
    upright: 'Good luck, karma, life cycles, destiny, a turning point',
    upsideDown: 'Bad luck, resistance to change, breaking cycles'
  },
  { 
    name: 'Justice', 
    image: './images/11.png',
    upright: 'Justice, fairness, truth, cause and effect, law',
    upsideDown: 'Unfairness, lack of accountability, dishonesty'
  },
  { 
    name: 'The Hanged Man', 
    image: './images/12.png',
    upright: 'Pause, surrender, letting go, new perspectives',
    upsideDown: 'Delays, resistance, stalling, indecision'
  },
  { 
    name: 'Death', 
    image: './images/13.png',
    upright: 'Endings, change, transformation, transition',
    upsideDown: 'Resistance to change, inability to move on'
  },
  { 
    name: 'Temperance', 
    image: './images/14.png',
    upright: 'Balance, moderation, patience, purpose',
    upsideDown: 'Imbalance, excess, lack of long-term vision'
  },
  { 
    name: 'The Devil', 
    image: './images/15.png',
    upright: 'Shadow self, attachment, addiction, restriction, sexuality',
    upsideDown: 'Releasing limiting beliefs, exploring dark thoughts, detachment'
  },
  { 
    name: 'The Tower', 
    image: './images/16.png',
    upright: 'Sudden change, upheaval, chaos, revelation, awakening',
    upsideDown: 'Personal transformation, fear of change, averting disaster'
  },
  { 
    name: 'The Star', 
    image: './images/17.png',
    upright: 'Hope, faith, purpose, renewal, spirituality',
    upsideDown: 'Lack of faith, despair, self-trust, disconnection'
  },
  { 
    name: 'The Moon', 
    image: './images/18.png',
    upright: 'Illusion, fear, anxiety, subconscious, intuition',
    upsideDown: 'Release of fear, repressed emotion, inner confusion'
  },
  { 
    name: 'The Sun', 
    image: './images/19.png',
    upright: 'Positivity, fun, warmth, success, vitality',
    upsideDown: 'Inner child, feeling down, overly optimistic'
  },
  { 
    name: 'Judgement', 
    image: './images/20.png',
    upright: 'Judgement, rebirth, inner calling, absolution',
    upsideDown: 'Self-doubt, inner critic, ignoring the call'
  },
  { 
    name: 'The World', 
    image: './images/21.png',
    upright: 'Completion, integration, accomplishment, travel',
    upsideDown: 'Seeking personal closure, short-cuts, delays'
  },
];

if (window.location.pathname === '/browse.html') {
  initializeBrowsePage();
} else {
  initializeReadingPage();
}

const POSITION_DESCRIPTIONS = {
  Past: 'Events, people, or influences from your past that are affecting your current situation',
  Present: 'Current circumstances, challenges, or opportunities you are facing now',
  Future: 'Potential outcomes, upcoming influences, or possibilities that lie ahead'
};

function createModal(card, isUpsideDown, position = null) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => modal.remove();
  
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'modal-toggle';
  
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const title = document.createElement('h2');
  title.textContent = card.name;
  
  header.appendChild(title);
  header.appendChild(toggleBtn);
  header.appendChild(closeBtn);
  
  const cardView = document.createElement('div');
  cardView.className = 'card-view';
  cardView.style.backgroundImage = `url(./${card.image})`;
  cardView.style.display = 'none';

  const meaningSection = document.createElement('div');
  meaningSection.className = 'meaning-section';
  
  if (position) {
    const currentMeaning = document.createElement('p');
    currentMeaning.innerHTML = isUpsideDown ? `<strong>Reversed:</strong> ${card.upsideDown}` : card.upright;
    meaningSection.appendChild(currentMeaning);
  } else {
    const uprightTitle = document.createElement('h3');
    uprightTitle.textContent = 'Upright';
    const uprightMeaning = document.createElement('p');
    uprightMeaning.textContent = card.upright;
    
    const reversedTitle = document.createElement('h3');
    reversedTitle.textContent = 'Reversed';
    const reversedMeaning = document.createElement('p');
    reversedMeaning.textContent = card.upsideDown;
    
    meaningSection.appendChild(uprightTitle);
    meaningSection.appendChild(uprightMeaning);
    meaningSection.appendChild(reversedTitle);
    meaningSection.appendChild(reversedMeaning);
  }

  let showingCard = false;
  toggleBtn.textContent = 'View Card';
  toggleBtn.onclick = () => {
    showingCard = !showingCard;
    toggleBtn.textContent = showingCard ? 'View Details' : 'View Card';
    meaningSection.style.display = showingCard ? 'none' : 'block';
    cardView.style.display = showingCard ? 'block' : 'none';
    if (position) {
      const positionSection = document.querySelector('.position-section');
      if (positionSection) {
        positionSection.style.display = showingCard ? 'none' : 'block';
      }
    }
  };
  
  content.appendChild(header);
  content.appendChild(cardView);
  content.appendChild(meaningSection);
  
  if (position) {
    const positionSection = document.createElement('div');
    positionSection.className = 'position-section';
    
    const positionTitle = document.createElement('h3');
    positionTitle.textContent = position;
    
    const positionDesc = document.createElement('p');
    positionDesc.className = 'position-description';
    positionDesc.textContent = POSITION_DESCRIPTIONS[position];
    
    positionSection.appendChild(positionTitle);
    positionSection.appendChild(positionDesc);
    content.appendChild(positionSection);
  }
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function initializeBrowsePage() {
  const gallery = document.getElementById('card-gallery');
  MAJOR_ARCANA.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.style.backgroundImage = `url(./${card.image})`;
    cardElement.title = card.name;
    cardElement.onclick = () => createModal(card, false);
    gallery.appendChild(cardElement);
  });
}

function initializeReadingPage() {
  let shuffleStartTime = 0;
  let dealtCards = 0;
  let deck = document.getElementById('deck');
  let usedCards = new Set();

  function createDeck() {
    const deckElement = document.createElement('div');
    deckElement.id = 'deck';
    deckElement.className = 'deck';
    
    const card1 = document.createElement('div');
    card1.id = 'card1';
    card1.className = 'card card-back';
    
    const card2 = document.createElement('div');
    card2.id = 'card2';
    card2.className = 'card card-back';
    
    if (dealtCards >= 3) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'reset-button';
      resetBtn.textContent = 'Reset';
      resetBtn.onclick = resetReading;
      card1.appendChild(resetBtn);
    }
    
    deckElement.appendChild(card1);
    deckElement.appendChild(card2);
    return deckElement;
  }

  function resetReading() {
    dealtCards = 0;
    usedCards.clear();
    const readingArea = document.querySelector('.reading-area');
    const oldDeck = document.getElementById('deck');
    
    if (oldDeck) {
      const newDeck = createDeck();
      readingArea.replaceChild(newDeck, oldDeck);
      deck = newDeck;
      attachDeckEventListeners(newDeck);
    }
    
    document.querySelectorAll('.card-slot').forEach(slot => {
      slot.innerHTML = `<div class="placeholder">${slot.dataset.position}</div>`;
    });
  }

  function startShuffle(e) {
    e.preventDefault();
    if (dealtCards >= 3) return;
    shuffleStartTime = Date.now();
    deck.classList.add('shuffling');
  }

  function dealCard(e) {
    e.preventDefault();
    if (dealtCards >= 3) return;
    
    deck.classList.remove('shuffling');
    const shuffleDuration = Date.now() - shuffleStartTime;
    
    let card;
    let randomIndex;
    do {
      const seed = shuffleDuration % MAJOR_ARCANA.length;
      randomIndex = Math.floor(Math.random() * MAJOR_ARCANA.length);
      card = MAJOR_ARCANA[(seed + randomIndex) % MAJOR_ARCANA.length];
    } while (usedCards.has(card.name));
    
    usedCards.add(card.name);
    dealtCards++;
    const slot = document.getElementById(`slot${dealtCards}`);
    const position = slot.dataset.position;
    slot.innerHTML = '';
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card dealing';
    const isUpsideDown = Math.random() < 0.5;
    if (isUpsideDown) {
      cardElement.classList.add('upside-down');
    }
    
    cardElement.style.backgroundImage = `url(./${card.image})`;
    cardElement.title = `${card.name}${isUpsideDown ? ' (Upside Down)' : ''}`;
    cardElement.onclick = () => createModal(card, isUpsideDown, position);
    
    slot.appendChild(cardElement);

    if (dealtCards >= 3) {
      const newDeck = createDeck();
      deck.parentNode.replaceChild(newDeck, deck);
      deck = newDeck;
      attachDeckEventListeners(deck);
    }
  }

  function attachDeckEventListeners(deckElement) {
    deckElement.addEventListener('mousedown', startShuffle);
    deckElement.addEventListener('touchstart', startShuffle);
    deckElement.addEventListener('mouseup', dealCard);
    deckElement.addEventListener('touchend', dealCard);
  }

  if (deck) {
    attachDeckEventListeners(deck);
  }
}