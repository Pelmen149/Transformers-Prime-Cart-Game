class CardGame {
    constructor() {
        // Инициализация свойств игры
        this.cards = cardsData.cards; // Все доступные карточки
        this.player1Deck = []; // Колода игрока 1
        this.player2Deck = []; // Колода игрока 2
        this.player1CurrentCard = null; // Текущая карта игрока 1
        this.player2CurrentCard = null; // Текущая карта игрока 2
        this.currentPlayer = 2; // Игрок, выбирающий характеристику (по правилам - раздающий)
        this.selectedCategory = null; // Выбранная характеристика для сравнения
        this.gameStarted = false; // Флаг начала игры
        this.round = 1; // Номер текущего раунда
        
        this.initEventListeners(); // Инициализация обработчиков событий
    }
    
	
	
	
	
	
	initEventListeners() {
		// Привязка функций к кнопкам на странице
		document.getElementById('start-game').addEventListener('click', () => this.startGame());
		document.getElementById('next-round').addEventListener('click', () => this.nextRound());
		document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
	}
    
	
	
	
	
	
	
	//НАЧАЛО ИГРЫ
	startGame() {
		if (this.gameStarted) return; // Если игра уже идет, ничего не делаем
		
		// 1. Перетасовка всех карточек (алгоритм Фишера-Йейтса)
		const shuffledCards = this.shuffleCards([...this.cards]);
		
		// 2. Раздача поровну между игроками
	    const cardsPerPlayer = 10;
		const maxCards = Math.min(shuffledCards.length, cardsPerPlayer * 2);
		
		this.player1Deck = shuffledCards.slice(0, cardsPerPlayer);
		this.player2Deck = shuffledCards.slice(cardsPerPlayer, cardsPerPlayer * 2);
		
		// 3. Лишние карты откладываем
		const leftoverCards = shuffledCards.slice(cardsPerPlayer * 2);

		// 4. Установка флагов состояния
		this.gameStarted = true;
		
		// 5. Обновление интерфейса
		this.updateUI();
		
		// 6. Активация/деактивация кнопок
		document.getElementById('start-game').disabled = true;
		document.getElementById('next-round').disabled = true;
		document.getElementById('restart-game').disabled = false;
		
		// 7. Начало первого раунда
		this.nextRound();
	}




	//ПЕРЕМЕШИВАНИЕ КАРТ
	shuffleCards(cards) {
		// Алгоритм Фишера-Йейтса - стандартный способ перемешивания массива
		for (let i = cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[cards[i], cards[j]] = [cards[j], cards[i]]; // Обмен местами
		}
		return cards;
	}
	
	
	
	
	
	
	//СЛЕДУЮЩИЙ РАУНД
	nextRound() {
		if (!this.gameStarted) return; // Проверка, что игра начата
		
		// Проверка окончания игры (у кого-то закончились карты)
		if (this.player1Deck.length === 0 || this.player2Deck.length === 0) {
			this.endGame();
			return;
		}
		
		// Чередуем игрока, который выбирает характеристику
		this.currentPlayer = this.currentPlayer === 2 ? 1 : 2;
	
		// 1. Берем по одной верхней карте из каждой колоды
		this.player1CurrentCard = this.player1Deck.shift(); // shift() удаляет первый элемент
		this.player2CurrentCard = this.player2Deck.shift();
		
		// 2. Сбрасываем выбранную характеристику
		this.selectedCategory = null;
		
		// 3. Показываем карты на экране
		this.updateCardDisplay();
		
		// 4. Показываем интерфейс выбора характеристики
		this.showCategorySelector();
		
		// 5. Обновляем UI
		this.updateUI();
		
		document.getElementById('next-round').disabled = true;
	}
    
	
	
	
	
	
	
	//ВЫБОР ХАРАКТЕРИСТИКИ
	showCategorySelector() {
		const categorySelector = document.getElementById('category-selector');
		const categoriesDiv = document.getElementById('categories');
		
		// Очищаем предыдущие кнопки
		categoriesDiv.innerHTML = '';
		
		 // Определяем, чью карту использовать для показа характеристик
		const currentPlayerCard = this.currentPlayer === 1 ? this.player1CurrentCard : this.player2CurrentCard;
		
		// Создаем кнопку для каждой характеристики текущей карты игрока 1
		const stats = currentPlayerCard.stats;
		Object.keys(stats).forEach(stat => {
			const button = document.createElement('button');
			button.textContent = this.getStatName(stat) + ` (${stats[stat]})`;
			button.addEventListener('click', () => this.selectCategory(stat));
			button.style.margin = '5px';
			button.style.padding = '10px 15px';
			button.style.backgroundColor = '#4CAF50';
			button.style.color = 'white';
			button.style.border = 'none';
			button.style.borderRadius = '5px';
			button.style.cursor = 'pointer';
			button.style.fontSize = '14px';
			categoriesDiv.appendChild(button);
		});
		
		 // Обновляем заголовок с указанием, кто выбирает
		const selectorTitle = categorySelector.querySelector('h3');
		if (selectorTitle) {
			selectorTitle.textContent = `Игрок ${this.currentPlayer} выбирает характеристику для карты "${currentPlayerCard.name}":`;
			selectorTitle.style.marginBottom = '20px';
		}
	    // Добавляем стили для блока выбора категорий
		categorySelector.style.display = 'block';
		categorySelector.style.margin = '20px 0';
		categorySelector.style.padding = '20px';
		categorySelector.style.backgroundColor = '#e8f4fd';
		categorySelector.style.border = '2px solid #2196F3';
		categorySelector.style.borderRadius = '10px';
		categorySelector.style.textAlign = 'center';

		// Показываем блок выбора
		categorySelector.style.display = 'block';
	}
	selectCategory(category) {
		this.selectedCategory = category;
		
		// Скрываем блок выбора
		document.getElementById('category-selector').style.display = 'none';
		
		// Определяем победителя раунда
		this.determineWinner();
	}
    
	
	
	
	//ПРОВЕРКА ПОБЕДИТЕЛЯ В РАУНДЕ
	determineWinner() {
		// Получаем значения выбранной характеристики для обеих карт
		const player1Value = this.player1CurrentCard.stats[this.selectedCategory];
		const player2Value = this.player2CurrentCard.stats[this.selectedCategory];
		
		let winner = null;
		
		const p1Card = this.player1CurrentCard;
		const p2Card = this.player2CurrentCard;
		
		// Сравниваем значения
		if (player1Value > player2Value) {
			winner = 1;
			// Игрок 1 забирает обе карты (свою и противника)
			this.player1Deck.push(p1Card, p2Card);
		} else if (player2Value > player1Value) {
			winner = 2;
			// Игрок 2 забирает обе карты
			this.player2Deck.push(p1Card, p2Card);
		} else {
			// НИЧЬЯ (по правилам нужно сравнивать следующую карту, но пока упрощаем)
			this.player1Deck.push(p1Card);
			this.player2Deck.push(p2Card);
		}
		
		this.player1CurrentCard = null;
		this.player2CurrentCard = null;
		
		// Обновление интерфейса
		this.updateUI();
		
		// Переход к следующему раунду
		this.round++;
		
		// Сброс текущих карт
		this.player1CurrentCard = null;
		this.player2CurrentCard = null;
		
		//Запрет следующего хода до выбора характеристики
		document.getElementById('next-round').disabled = false;
	}
    
	
	
	
	
	
	//НОВЫЕ КАРТЫ ПОСЛЕ ХОДА
	updateCardDisplay() {
		// Добавляем стили для контейнеров карт
		const player1Card = document.getElementById('player1-card');
		const player2Card = document.getElementById('player2-card');
		
		player1Card.style.padding = '15px';
		player1Card.style.border = '2px solid #ccc';
		player1Card.style.borderRadius = '10px';
		player1Card.style.backgroundColor = '#f5f5f5';
		player1Card.style.marginTop = '10px';
		
		player2Card.style.padding = '15px';
		player2Card.style.border = '2px solid #ccc';
		player2Card.style.borderRadius = '10px';
		player2Card.style.backgroundColor = '#f5f5f5';
		player2Card.style.marginTop = '10px';
		
		this.updateCardElement('player1-card', this.player1CurrentCard);
		this.updateCardElement('player2-card', this.player2CurrentCard);
	}

	updateCardElement(elementId, card) {
	const element = document.getElementById(elementId);
	
	if (!card) {
		element.innerHTML = '<p>Карта не выбрана</p>';
		return;
	}
	
	// Формирование HTML для отображения карты
		element.innerHTML = `
		<div class="card-image">
			<img src="${card.imageUrl}" alt="${card.name}" 
				 style="max-width: 500px; max-height: 400px; border-radius: 5px; margin-bottom: 10px;">
			<div style="font-size: 12px; color: #666;">ID: ${card.id}</div>
		</div>
		<h4 style="margin: 10px 0;">${card.name}</h4>
		<div style="margin-bottom: 5px;">
			<strong>Группа:</strong> ${this.getGroupName(card.group)}
		</div>
		<div style="margin-bottom: 5px;">
			<strong>Редкость:</strong> ${this.getTypeName(card.type)}
		</div>
		<div>
			<strong>Характеристики:</strong>
			<div style="margin-top: 5px;">
				<div>Сила: <strong>${card.stats.strength}</strong></div>
				<div>Скорость: <strong>${card.stats.speed}</strong></div>
				<div>Ловкость: <strong>${card.stats.agility}</strong></div>
				<div>Интеллект: <strong>${card.stats.intelligence}</strong></div>
				<div>Огневая мощь: <strong>${card.stats.firepower}</strong></div>
			</div>
		</div>
	`;
}
	
	
	
	
	//ОТОБРАЖЕНИЕ КАРТ
	highlightWinner(winner) {
		const player1Area = document.getElementById('player1-area');
		const player2Area = document.getElementById('player2-area');
		const player1Card = document.getElementById('player1-card');
		const player2Card = document.getElementById('player2-card');
		
		// Сбрасываем стили
		player1Area.classList.remove('winner', 'loser');
		player2Area.classList.remove('winner', 'loser');
		player1Card.style.border = '';
		player2Card.style.border = '';
		
		if (winner === 1) {
			player1Area.classList.add('winner');
			player2Area.classList.add('loser');
			player1Card.style.border = '3px solid #00ff00';
			player2Card.style.border = '3px solid #ff0000';
		} else if (winner === 2) {
			player2Area.classList.add('winner');
			player1Area.classList.add('loser');
			player2Card.style.border = '3px solid #00ff00';
			player1Card.style.border = '3px solid #ff0000';
		}
	}


	


    //ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
	updateUI() {
		// Текущие карты на столе
		const currentCardsCount = (this.player1CurrentCard ? 1 : 0) + (this.player2CurrentCard ? 1 : 0);
		
		// Общее количество карт = в колоде + на столе
		const player1Total = this.player1Deck.length + (this.player1CurrentCard ? 1 : 0);
		const player2Total = this.player2Deck.length + (this.player2CurrentCard ? 1 : 0);
		
		// Обновляем счетчики карт в колодах
		document.getElementById('player1-count').textContent = `${player1Total}`;
		document.getElementById('player2-count').textContent = `${player2Total}`;
		
		// Обновляем номер раунда
		document.getElementById('round').textContent = this.round;
		
		// Обновляем текстовый статус игры
		const statusText = document.getElementById('status-text');
		if (!this.gameStarted) {
			statusText.textContent = 'Начало игры';
		} else if (this.selectedCategory) {
			statusText.textContent = `Раунд завершен. Выбрана характеристика: ${this.getStatName(this.selectedCategory)}. Победил Игрок ${this.currentPlayer}`;
		} else {
			statusText.textContent = `Раунд ${this.round}: выбор характеристики`;
		}
	}
    
	
	
	
	//ЗАВЕРШЕНИЕ ИГРЫ
	endGame() {
		// Определение победителя по количеству карт
		let winner = null;
		
		if (this.player1Deck.length > this.player2Deck.length) {
			winner = 1;
		} else if (this.player2Deck.length > this.player1Deck.length) {
			winner = 2;
		}

		// Блокировка кнопки следующего раунда
		this.gameStarted = false;
		document.getElementById('next-round').disabled = true;
	}





	//РЕСТАРТ ИГРЫ
	restartGame() {
		// Сброс всех свойств игры к начальным значениям
		this.player1Deck = [];
		this.player2Deck = [];
		this.player1CurrentCard = null;
		this.player2CurrentCard = null;
		this.selectedCategory = null;
		this.gameStarted = false;
		this.round = 1;
		this.currentPlayer = 2;
		
		// Активация/деактивация кнопок
		document.getElementById('start-game').disabled = false;
		document.getElementById('next-round').disabled = true;
		document.getElementById('restart-game').disabled = true;
		
		// Сброс интерфейса
		this.updateCardDisplay();
		this.updateUI();
		
		// Сбрасываем стили и имена игроков
		const player1Area = document.getElementById('player1-area');
		const player2Area = document.getElementById('player2-area');
		const player1Card = document.getElementById('player1-card');
		const player2Card = document.getElementById('player2-card');
		
		player1Area.classList.remove('winner', 'loser');
		player2Area.classList.remove('winner', 'loser');
		player1Card.style.border = '2px solid #ccc';
		player2Card.style.border = '2px solid #ccc';
		
		const player1Name = player1Area.querySelector('.player-name');
		const player2Name = player2Area.querySelector('.player-name');
		if (player1Name) player1Name.textContent = 'Игрок 1';
		if (player2Name) player2Name.textContent = 'Игрок 2';
		
		// Скрываем селектор категорий
		const categorySelector = document.getElementById('category-selector');
		categorySelector.style.display = 'none';
		
		// Сброс CSS классов
		document.getElementById('player1-area').classList.remove('winner', 'loser');
		document.getElementById('player2-area').classList.remove('winner', 'loser');
		
		// Скрытие селектора характеристик
		document.getElementById('category-selector').style.display = 'none';
		

	}
		
		
		
		

	
	
	getStatName(stat) {
		const statNames = {
			'strength': 'Сила',
			'speed': 'Скорость',
			'agility': 'Ловкость',
			'intelligence': 'Интеллект',
			'firepower': 'Огневая мощь'
		};
		return statNames[stat] || stat; // Возвращаем перевод или оригинал
	}
	getGroupName(group) {
		const groupNames = {
			'autobots': 'Автоботы',
			'decepticons': 'Десептиконы',
			'autobots_allies': 'Союзники Автоботов',
			'autobots_enemies': 'Враги Автоботов'
		};
		return groupNames[group] || group;
	}
	getTypeName(type) {
		const typeNames = {
			'common': 'Обычная',
			'rare': 'Редкая',
			'super_rare': 'Супер-редкая',
			'ultra_rare': 'Ультра-редкая'
		};
		return typeNames[type] || type;
	}
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.game = new CardGame();
});