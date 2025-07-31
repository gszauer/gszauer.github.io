
document.addEventListener('DOMContentLoaded', function() {
    

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
            this.currentValue = 0;
            this.movesLeft = 0;
            this.showingHint = false;
            this.gameState = 'playing';
            this.optionsMode = false;
            this.selectedLevel = 1; // For level selector
            this.actualLevels = []; // Store indices of actual gameplay levels
            this.pointingArrow = null; // For tutorial pointing arrow
            this.arrowTween = null; // For arrow animation
            this.currentLevel = 0;
            this.progressLevel = 0;
            this.showingModal = false; // For modal popup state
        }

        create() {
            this.cameras.main.setBackgroundColor('#2a2a2a');

            this.displayContainer = this.add.container(360, 320);
            this.buttonsContainer = this.add.container(360, 920);

            // Find all actual gameplay levels (not dialogs)
            this.actualLevels = [];
            levels.forEach((item, index) => {
                if (item.level) {
                    this.actualLevels.push({ levelNum: item.level, index: index });
                }
            });
            this.createDisplay();
            this.createButtons();
            this.currentLevel = PlayerData.Instance.GetNumber('currentLevel', 0);
            this.progressLevel = PlayerData.Instance.GetNumber('progressLevel', 0);
            this.loadLevel(this.currentLevel);
        }

        createDisplay() {
            const displayBg = this.add.graphics();
            displayBg.fillStyle(0x1a1a1a, 1);
            displayBg.fillRoundedRect(-340, -300, 680, 500, 20);
            this.displayContainer.add(displayBg);

            this.levelText = this.add.text(-320, -280, 'Level: 1', {
                fontSize: '50px',
                color: '#cccccc',
                fontFamily: 'Arial'
            });
            this.displayContainer.add(this.levelText);

            const solar = this.add.graphics();
            solar.fillStyle(0x444444, 1);
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 2; j++) {
                    solar.fillRect(240 + i * 20, -280 + j * 20, 15, 15);
                }
            }
            this.displayContainer.add(solar);

            const screen = this.add.graphics();
            screen.fillStyle(0x8fb98f, 1);
            screen.fillRoundedRect(-320, -220, 640, 400, 15);
            this.displayContainer.add(screen);

            this.smileyContainer = this.add.container(-240, -170);
            this.drawSmiley('normal');
            this.displayContainer.add(this.smileyContainer);

            this.movesBox = this.add.graphics();
            this.movesBox.fillStyle(0x2a2a2a, 1);
            this.movesBox.fillRoundedRect(-165, -205, 230, 70, 10);
            this.displayContainer.add(this.movesBox);

            this.movesText = this.add.text(-50, -170, 'moves: 0', {
                fontSize: '48px',
                color: '#8fb98f',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.displayContainer.add(this.movesText);

            this.goalBox = this.add.graphics();
            this.goalBox.fillStyle(0x2a2a2a, 1);
            this.goalBox.fillRoundedRect(80, -205, 230, 70, 10);
            this.displayContainer.add(this.goalBox);

            this.goalText = this.add.text(195, -170, 'goal: 0', {
                fontSize: '48px',
                color: '#8fb98f',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.displayContainer.add(this.goalText);

            this.valueText = this.add.text(300, 0, '0', {
                fontSize: '140px',
                color: '#2a2a2a',
                fontFamily: 'Arial'
            }).setOrigin(1, 0.5);
            this.displayContainer.add(this.valueText);

            this.hintText = this.add.text(0, 130, '', {
                fontSize: '40px',
                color: '#2a2a2a',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.displayContainer.add(this.hintText);

            // Speech bubble container for narrative levels
            this.speechBubbleContainer = this.add.container(0, 60);
            this.speechBubbleContainer.setVisible(false);
            this.displayContainer.add(this.speechBubbleContainer);

            // Modal popup container - position at scene center, not display container center
            this.modalContainer = this.add.container(360, 640); // Center of 720x1280 screen
            this.modalContainer.setVisible(false);

            // Create speech bubble background
            this.speechBubbleBg = this.add.graphics();
            this.speechBubbleContainer.add(this.speechBubbleBg);

            // Create speech text
            this.speechText = this.add.text(0, 0, '', {
                fontSize: '32px',
                color: '#2a2a2a',
                fontFamily: 'Arial',
                wordWrap: { width: 580 },
                align: 'center'
            }).setOrigin(0.5);
            this.speechBubbleContainer.add(this.speechText);
        }

        drawSmiley(type) {
            this.smileyContainer.removeAll(true);

            const g = this.add.graphics();
            g.fillStyle(0x2a2a2a, 1);
            g.fillRoundedRect(-60, -35, 120, 70, 10);

            g.fillStyle(0x8fb98f, 1);
            g.fillCircle(-30, -10, 8);
            g.fillCircle(30, -10, 8);

            if (type === 'normal') {
                g.lineStyle(4, 0x8fb98f);
                g.beginPath();
                g.arc(0, 2, 25, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
                g.strokePath();
            } else if (type === 'win') {
                g.fillStyle(0x8fb98f, 1);
                g.fillEllipse(0, 15, 40, 25);
            } else if (type === 'lose') {
                g.lineStyle(4, 0x8fb98f);
                g.beginPath();
                g.arc(0, 25, 25, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
                g.strokePath();
            } else if (type === 'talking1') {
                // Open mouth for talking animation
                g.fillStyle(0x8fb98f, 1);
                g.fillEllipse(0, 15, 30, 20);
            } else if (type === 'talking2') {
                // Slightly closed mouth for talking animation
                g.fillStyle(0x8fb98f, 1);
                g.fillEllipse(0, 15, 25, 10);
            }

            this.smileyContainer.add(g);
        }

        drawSpeechBubble(y, text, width = 0.9) {
            this.speechBubbleBg.clear();

            // Calculate bubble dimensions based on width parameter
            const maxWidth = 600;
            const bubbleWidth = maxWidth * width;
            const bubbleX = -300; // Keep left-aligned at same position
            const bubbleY = y;

            // Calculate nib position to align with robot face center
            const nibX = -240; // Align with robot face x position

            // Draw dark triangle outline (bigger, 2px taller to match foreground)
            this.speechBubbleBg.fillStyle(0x2a2a2a, 1);
            this.speechBubbleBg.beginPath();
            this.speechBubbleBg.moveTo(nibX - 25, bubbleY + 2); // 2px into the rectangle
            this.speechBubbleBg.lineTo(nibX, bubbleY - 35);
            this.speechBubbleBg.lineTo(nibX + 25, bubbleY + 2); // 2px into the rectangle
            this.speechBubbleBg.closePath();
            this.speechBubbleBg.fillPath();

            // Draw main bubble with calculator screen color
            this.speechBubbleBg.fillStyle(0x8fb98f, 1); // Same as calculator screen
            this.speechBubbleBg.lineStyle(3, 0x2a2a2a, 1);
            this.speechBubbleBg.fillRoundedRect(bubbleX, bubbleY, bubbleWidth, 200, 20);
            this.speechBubbleBg.strokeRoundedRect(bubbleX, bubbleY, bubbleWidth, 200, 20);

            // Draw screen-colored triangle on top (smaller, 2px taller)
            this.speechBubbleBg.fillStyle(0x8fb98f, 1); // Same as calculator screen
            this.speechBubbleBg.beginPath();
            this.speechBubbleBg.moveTo(nibX - 20, bubbleY + 2); // 2px into the rectangle
            this.speechBubbleBg.lineTo(nibX, bubbleY - 30);
            this.speechBubbleBg.lineTo(nibX + 20, bubbleY + 2); // 2px into the rectangle
            this.speechBubbleBg.closePath();
            this.speechBubbleBg.fillPath();

            // Update text wrap width based on bubble width and position
            this.speechText.setWordWrapWidth(bubbleWidth - 40);
            this.speechText.setX(bubbleX + bubbleWidth / 2); // Center text in the bubble
            this.speechText.setY(bubbleY + 100); // Center text vertically in bubble
            this.speechText.setText(text);
        }

        startTalkingAnimation() {
            // Stop any existing animation
            if (this.talkingTimer) {
                this.talkingTimer.destroy();
            }

            let frame = 0;
            this.talkingTimer = this.time.addEvent({
                delay: 200,
                callback: () => {
                    this.drawSmiley(frame % 2 === 0 ? 'talking1' : 'talking2');
                    frame++;
                },
                loop: true
            });
        }

        stopTalkingAnimation() {
            if (this.talkingTimer) {
                this.talkingTimer.destroy();
                this.talkingTimer = null;
            }
            this.drawSmiley('normal');
        }

        showResetModal() {
            this.showingModal = true;
            this.modalContainer.removeAll(true);
            
            // Full-screen semi-transparent black overlay
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.5);
            overlay.fillRect(-360, -640, 720, 1280); // Full screen coverage
            this.modalContainer.add(overlay);
            
            // Modal background
            const modalBg = this.add.graphics();
            modalBg.fillStyle(0x333333, 1);
            modalBg.lineStyle(3, 0x666666, 1);
            modalBg.fillRoundedRect(-250, -120, 500, 240, 20);
            modalBg.strokeRoundedRect(-250, -120, 500, 240, 20);
            this.modalContainer.add(modalBg);
            
            // Modal text
            const modalText = this.add.text(0, -40, 'This will reset your progress.\nAre you sure?', {
                fontSize: '36px',
                color: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);
            this.modalContainer.add(modalText);
            
            // Yes button
            const yesButton = this.add.graphics();
            yesButton.fillStyle(0xcc4444, 1);
            yesButton.fillRoundedRect(-90, 40, 80, 40, 10);
            this.modalContainer.add(yesButton);
            
            const yesText = this.add.text(-50, 60, 'Yes', {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.modalContainer.add(yesText);
            
            // No button
            const noButton = this.add.graphics();
            noButton.fillStyle(0x888888, 1);
            noButton.fillRoundedRect(10, 40, 80, 40, 10);
            this.modalContainer.add(noButton);
            
            const noText = this.add.text(50, 60, 'No', {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.modalContainer.add(noText);
            
            // Make buttons interactive
            yesButton.setInteractive(new Phaser.Geom.Rectangle(-90, 40, 80, 40), Phaser.Geom.Rectangle.Contains);
            noButton.setInteractive(new Phaser.Geom.Rectangle(10, 40, 80, 40), Phaser.Geom.Rectangle.Contains);
            
            yesButton.on('pointerdown', () => this.resetProgress());
            noButton.on('pointerdown', () => this.hideModal());
            
            this.modalContainer.setVisible(true);
        }

        hideModal() {
            this.showingModal = false;
            this.modalContainer.setVisible(false);
        }

        resetProgress() {
            // Reset player data
            PlayerData.Instance.SetNumber('currentLevel', 0);
            PlayerData.Instance.SetNumber('progressLevel', 0);
            
            // Update local state
            this.currentLevel = 0;
            this.progressLevel = 0;
            this.selectedLevel = 1;
            
            // Hide modal and exit options mode
            this.hideModal();
            this.optionsMode = false;
            this.valueText.setFontSize('140px');
            
            // Restore button font sizes and alpha (same as when exiting options)
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    this.buttons[row][col].text.setFontSize('48px');
                    this.buttons[row][col].setAlpha(1); // Re-enable all buttons
                }
            }
            
            this.loadLevel(0);
        }

        createPointingArrow(target) {
            // Remove existing arrow if any
            this.removePointingArrow();

            // Create arrow graphics
            this.pointingArrow = this.add.graphics();
            this.pointingArrow.fillStyle(0xff6644, 1); // Orange color

            let targetX, targetY;

            if (target === 'moves') {
                // Point to moves box center from above
                targetX = -40; // movesText x position
                targetY = -175; // movesText y position

                // Position arrow above the moves box
                const arrowX = targetX;
                const arrowY = targetY - 80;

                // Draw triangle pointing down (tip pointing at moves)
                this.pointingArrow.beginPath();
                this.pointingArrow.moveTo(arrowX, arrowY + 20); // tip
                this.pointingArrow.lineTo(arrowX - 15, arrowY); // left corner
                this.pointingArrow.lineTo(arrowX + 15, arrowY); // right corner
                this.pointingArrow.closePath();
                this.pointingArrow.fillPath();

                // Draw rectangular stem above triangle
                this.pointingArrow.fillRect(arrowX - 4, arrowY - 30, 8, 30);

            } else if (target === 'goal') {
                // Point to goal box center from above
                targetX = 202; // goalText x position
                targetY = -175; // goalText y position

                // Position arrow above the goal box
                const arrowX = targetX;
                const arrowY = targetY - 80;

                // Draw triangle pointing down (tip pointing at goal)
                this.pointingArrow.beginPath();
                this.pointingArrow.moveTo(arrowX, arrowY + 20); // tip
                this.pointingArrow.lineTo(arrowX - 15, arrowY); // left corner
                this.pointingArrow.lineTo(arrowX + 15, arrowY); // right corner
                this.pointingArrow.closePath();
                this.pointingArrow.fillPath();

                // Draw rectangular stem above triangle
                this.pointingArrow.fillRect(arrowX - 4, arrowY - 30, 8, 30);
            } else if (target === 'value') {
                // Point to value display from the left
                targetX = 280; // Approximate position near value text
                targetY = 0; // valueText y position

                // Position arrow to the left of the value
                const arrowX = targetX - 80;
                const arrowY = targetY;

                // Draw triangle pointing right (tip pointing at value)
                this.pointingArrow.beginPath();
                this.pointingArrow.moveTo(arrowX + 20, arrowY); // tip
                this.pointingArrow.lineTo(arrowX, arrowY - 15); // top corner
                this.pointingArrow.lineTo(arrowX, arrowY + 15); // bottom corner
                this.pointingArrow.closePath();
                this.pointingArrow.fillPath();

                // Draw rectangular stem to the left of triangle
                this.pointingArrow.fillRect(arrowX - 30, arrowY - 4, 30, 8);
            }

            this.displayContainer.add(this.pointingArrow);

            // Start bouncing animation
            this.arrowTween = this.tweens.add({
                targets: this.pointingArrow,
                y: this.pointingArrow.y + 15,
                duration: 800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }

        removePointingArrow() {
            if (this.pointingArrow) {
                this.pointingArrow.destroy();
                this.pointingArrow = null;
            }
            if (this.arrowTween) {
                this.arrowTween.destroy();
                this.arrowTween = null;
            }
        }

        createButtons() {
            const buttonSize = 180;
            const spacing = 20;
            const startX = -(buttonSize + spacing);
            const startY = -(buttonSize + spacing);

            this.buttons = [];

            for (let row = 0; row < 3; row++) {
                this.buttons[row] = [];
                for (let col = 0; col < 3; col++) {
                    const x = startX + col * (buttonSize + spacing);
                    const y = startY + row * (buttonSize + spacing);

                    const button = this.createButton(x, y, buttonSize, 'EMP');
                    this.buttonsContainer.add(button);
                    this.buttons[row][col] = button;
                }
            }
        }

        createButton(x, y, size, type) {
            const container = this.add.container(x, y);

            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.3);
            shadow.fillRoundedRect(-size/2 + 5, -size/2 + 5, size, size, 15);
            container.add(shadow);

            const bg = this.add.graphics();
            container.add(bg);

            const text = this.add.text(0, 0, '', {
                fontSize: '48px',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            container.add(text);

            container.bg = bg;
            container.text = text;
            container.buttonType = type;
            container.size = size;

            this.updateButtonAppearance(container, type);

            container.setInteractive(new Phaser.Geom.Rectangle(-size/2, -size/2, size, size), Phaser.Geom.Rectangle.Contains);

            container.on('pointerover', () => {
                if (container.buttonType !== 'EMP') {
                    this.tweens.add({
                        targets: container,
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 100
                    });
                }
            });

            container.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });

            container.on('pointerdown', () => this.onButtonClick(container));

            return container;
        }

        updateButtonAppearance(button, type) {
            const colors = {
                'EMP': 0x222222,
                'CLR': 0xcc4444,
                'RST': 0xcc4444,
                'NXT': 0x44cc44,
                'HNT': 0x4444cc,
                'OPT': 0xcccc44,
                'LVL': 0x555555,
                '<<<': 0xcc8844,
                '>>>': 0xcc8844,
                '+/-': 0xdd6644, // Reddish orange
                'CONFIRM': 0x44cc44, // Green like NXT
                '-': 0x888888, // Gray for decrease
                '+': 0x888888, // Gray for increase
                'RESET': 0xcc4444, // Red for reset
                'BACK': 0x44cc44, // Green for back
                'default': 0x555555
            };

            let color = colors[type] || colors['default'];

            // Handle append (_NUM) and prepend (NUM_) buttons
            if (type.includes('_') && (type.startsWith('_') || type.endsWith('_'))) {
                color = 0x8844cc; // Purple color
            }

            // Handle NUM=>NUM replace buttons
            if (type.includes('=>')) {
                color = 0xdd88cc; // Pink color
            }

            // Handle NUM^2 square buttons
            if (type.includes('^2')) {
                color = 0x44ccaa; // Greenish blue
            }

            // Handle pure numeric buttons
            if (!isNaN(parseInt(type)) && !type.includes('_')) {
                color = 0x6666cc; // Blue color for numeric buttons
            }
            button.bg.clear();
            button.bg.fillStyle(color, 1);
            button.bg.fillRoundedRect(-button.size/2, -button.size/2, button.size, button.size, 15);

            button.text.setColor(type === 'EMP' ? '#444444' : '#ffffff');

            if (type === 'EMP') {
                // Empty buttons show no text
                button.text.setText('');
            } else if (type === 'CONFIRM') {
                // Don't set text here, it will be set separately
            } else if (type.startsWith('LVL')) {
                button.text.setText(type.substring(3));
            } else if (type === '-' || type === '+') {
                button.text.setText(type);
            } else if (type.startsWith('+') || type.startsWith('-') || type.startsWith('x') || type.startsWith('/')) {
                button.text.setText(type);
            } else if (type === '<<<' || type === '>>>') {
                button.text.setText(type);
            } else if (type.includes('_') && (type.startsWith('_') || type.endsWith('_'))) {
                button.text.setText(type);
            } else if (type.includes('=>') || type.includes('^2') || type === '+/-') {
                button.text.setText(type);
            } else {
                button.text.setText(type);
            }

            button.buttonType = type;
        }

        loadLevel(levelIndex) {
            const level = levels[levelIndex];

            // Check if this is a narrative level
            if (level.dialog) {
                this.loadNarrativeLevel(level);
            } else {
                this.loadGameLevel(level);
            }
        }

        loadNarrativeLevel(level) {
            this.gameState = 'narrative';
            this.optionsMode = false;

            // Hide game elements by default
            this.levelText.setVisible(false);
            this.movesText.setVisible(false);
            this.goalText.setVisible(false);
            this.valueText.setText('');
            this.hintText.setText('');

            // Lower opacity of moves and goal boxes by default
            this.movesBox.setAlpha(0.5);
            this.goalBox.setAlpha(0.5);

            // Show moves if specified in dialog config
            if (level.moves !== undefined) {
                this.movesText.setVisible(true);
                this.movesText.setText(`moves: ${level.moves}`);
                this.movesBox.setAlpha(1);
            }

            // Show goal if specified in dialog config
            if (level.goal !== undefined) {
                this.goalText.setVisible(true);
                this.goalText.setText(`goal: ${level.goal}`);
                this.goalBox.setAlpha(1);
            }

            // Show value if specified in dialog config
            if (level.value !== undefined) {
                this.currentValue = level.value;
                this.valueText.setText(level.value.toString());
            }

            // Create pointing arrow if specified
            if (level.pointAt) {
                this.createPointingArrow(level.pointAt);
            }

            // Show speech bubble
            this.speechBubbleContainer.setVisible(true);
            // Set width to 1.0 unless value is present
            const bubbleWidth = level.value !== undefined ? (level.width || 0.9) : 1.0;
            this.drawSpeechBubble(-150, level.dialog, bubbleWidth);

            // Start talking animation
            this.startTalkingAnimation();

            // Clear all buttons
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    this.updateButtonAppearance(this.buttons[row][col], 'EMP');
                }
            }

            // Set up confirm button in the middle
            this.updateButtonAppearance(this.buttons[1][1], 'CONFIRM');
            this.buttons[1][1].text.setText(level.confirm);

            // Set up preview button if provided
            if (level.preview_btn) {
                this.updateButtonAppearance(this.buttons[0][1], level.preview_btn);
                // Make it non-interactive
                this.buttons[0][1].removeInteractive();
            }
        }

        loadGameLevel(level) {
            this.currentValue = level.initial;
            this.movesLeft = level.moves;
            this.showingHint = false;
            this.gameState = 'playing';
            this.optionsMode = false;

            // Update progressLevel when we reach a new gameplay level
            if (level.level > this.progressLevel) {
                this.progressLevel = level.level;
                PlayerData.Instance.SetNumber('progressLevel', this.progressLevel);
            }

            // Remove any pointing arrow
            this.removePointingArrow();

            // Show game elements
            this.levelText.setVisible(true);
            this.movesText.setVisible(true);
            this.goalText.setVisible(true);

            // Restore full opacity of moves and goal boxes
            this.movesBox.setAlpha(1);
            this.goalBox.setAlpha(1);

            // Hide speech bubble
            this.speechBubbleContainer.setVisible(false);

            // Stop talking animation
            this.stopTalkingAnimation();

            this.levelText.setText(`Level: ${level.level}`);
            this.movesText.setText(`moves: ${this.movesLeft}`);
            this.goalText.setText(`goal: ${level.goal}`);
            this.valueText.setText(this.currentValue.toString());
            this.hintText.setText('');

            this.drawSmiley('normal');

            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    this.updateButtonAppearance(this.buttons[row][col], level.buttons[row][col]);
                    // Re-enable interactivity
                    if (!this.buttons[row][col].input) {
                        this.buttons[row][col].setInteractive(new Phaser.Geom.Rectangle(-this.buttons[row][col].size/2, -this.buttons[row][col].size/2, this.buttons[row][col].size, this.buttons[row][col].size), Phaser.Geom.Rectangle.Contains);
                    }
                }
            }
        }

        onButtonClick(button) {
            const type = button.buttonType;

            if (type === 'EMP') return;
            
            // Block all button clicks when modal is showing
            if (this.showingModal) return;

            // Handle narrative level confirm button
            if (this.gameState === 'narrative' && type === 'CONFIRM') {
                this.removePointingArrow(); // Remove arrow when leaving narrative
                this.currentLevel = (this.currentLevel + 1) % levels.length;
                this.loadLevel(this.currentLevel);
                return;
            }

            // Handle level selector buttons
            if (this.optionsMode) {
                if (type === '-') {
                    // Decrease level
                    if (this.selectedLevel > 1) {
                        this.selectedLevel--;
                        this.updateButtonAppearance(this.buttons[1][1], `LVL${this.selectedLevel}`);
                        this.updateLevelSelectorButtonStates();
                    }
                    return;
                } else if (type === '+') {
                    // Increase level - allow up to progressLevel (inclusive)  
                    if (this.selectedLevel < Math.min(this.actualLevels.length, this.progressLevel)) {
                        this.selectedLevel++;
                        this.updateButtonAppearance(this.buttons[1][1], `LVL${this.selectedLevel}`);
                        this.updateLevelSelectorButtonStates();
                    }
                    return;
                }
            }

            if (type === 'OPT' || type === 'BACK') {
                this.toggleOptionsMode();
                return;
            }

            if (type === 'RESET' && this.optionsMode) {
                this.showResetModal();
                return;
            }

            if (this.gameState === 'win' && type === 'NXT') {
                // Update progress level if we're progressing to a new level
                const nextLevelIndex = (this.currentLevel + 1) % levels.length;
                const nextLevel = levels[nextLevelIndex];
                
                // If the next level is a gameplay level (not dialog)
                if (nextLevel && nextLevel.level) {
                    // Update progressLevel if we've reached a new high
                    if (nextLevel.level > this.progressLevel) {
                        this.progressLevel = nextLevel.level;
            
                        PlayerData.Instance.SetNumber('progressLevel', this.progressLevel);
                    }
                }
                
                this.currentLevel = nextLevelIndex;
                PlayerData.Instance.SetNumber('currentLevel', this.currentLevel);
                this.loadLevel(this.currentLevel);
                return;
            }

            if ((this.gameState === 'lose' && type === 'RST') || type === 'CLR') {
                this.loadLevel(this.currentLevel);
                return;
            }

            if (this.gameState !== 'playing' || this.optionsMode) return;

            if (type === 'HNT') {
                this.hintText.setText(levels[this.currentLevel].hint);
                return;
            }

            if (type === '+/-') {
                // Flip the sign
                if (!isNaN(this.currentValue)) {
                    this.currentValue = -this.currentValue;
                } else {
                    this.currentValue = 0;
                }
                this.movesLeft--;
            } else if (type.startsWith('+')) {
                const num = parseInt(type.substring(1));
                this.currentValue += num;
                this.movesLeft--;
            } else if (type.startsWith('-')) {
                const num = parseInt(type.substring(1));
                this.currentValue -= num;
                this.movesLeft--;
            } else if (type.startsWith('x')) {
                const num = parseInt(type.substring(1));
                this.currentValue *= num;
                this.movesLeft--;
            } else if (type.startsWith('/')) {
                const num = parseInt(type.substring(1));
                this.currentValue = Math.floor(this.currentValue / num);
                this.movesLeft--;
            } else if (type === '<<<') {
                // Left shift - remove last digit
                this.currentValue = Math.floor(this.currentValue / 10);
                this.movesLeft--;
            } else if (type === '>>>') {
                // Right shift - remove first digit
                const str = this.currentValue.toString();
                if (str.length > 1) {
                    this.currentValue = parseInt(str.substring(1));
                } else {
                    this.currentValue = 0;
                }
                this.movesLeft--;
            } else if (type.startsWith('_')) {
                // Append digit
                const digit = type.substring(1);
                this.currentValue = parseInt(this.currentValue.toString() + digit);
                this.movesLeft--;
            } else if (type.endsWith('_')) {
                // Prepend digit
                const digit = type.substring(0, type.length - 1);
                this.currentValue = parseInt(digit + this.currentValue.toString());
                this.movesLeft--;
            } else if (type.includes('=>')) {
                // Replace ALL occurrences of first digit with second digit
                const parts = type.split('=>');
                const fromDigit = parts[0];
                const toDigit = parts[1];
                const valueStr = this.currentValue.toString();
                const newValueStr = valueStr.replace(new RegExp(fromDigit, 'g'), toDigit);
                this.currentValue = parseInt(newValueStr) || 0;
                this.movesLeft--;
            } else if (type.includes('^2')) {
                // Square the current value
                this.currentValue = this.currentValue * this.currentValue;
                this.movesLeft--;
            } else if (!isNaN(parseInt(type))) {
                // Direct number button (like '12')
                this.currentValue = parseInt(type);
                this.movesLeft--;
            }

            this.updateDisplay();
            this.checkGameState();
        }

        toggleOptionsMode() {
            this.optionsMode = !this.optionsMode;

            if (this.optionsMode) {
                // Find current level number
                const currentLevelData = levels[this.currentLevel];
                if (currentLevelData && currentLevelData.level) {
                    this.selectedLevel = currentLevelData.level;
                }

                this.valueText.setText('Level Select');
                this.valueText.setFontSize('110px');
                this.hintText.setText('');

                // Clear all buttons
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        this.updateButtonAppearance(this.buttons[row][col], 'EMP');
                    }
                }

                // Set up level selector interface
                // Middle row: - [level number] +
                this.updateButtonAppearance(this.buttons[1][0], '-');
                this.updateButtonAppearance(this.buttons[1][1], `LVL${this.selectedLevel}`);
                this.updateButtonAppearance(this.buttons[1][2], '+');
                
                // Update button states based on limits
                this.updateLevelSelectorButtonStates();

                // Change options button to BACK button
                this.updateButtonAppearance(this.buttons[2][0], 'BACK');
                
                // Add Reset Progress button
                this.updateButtonAppearance(this.buttons[2][2], 'RESET');
                this.buttons[2][2].text.setText('RESET');
              //  this.buttons[2][2].text.setFontSize('36px');
                this.buttons[2][2].text.setAlign('center');
            } else {
                // Check if selected level changed
                const currentLevelData = levels[this.currentLevel];
                if (!currentLevelData || !currentLevelData.level || currentLevelData.level !== this.selectedLevel) {
                    // Only allow switching to levels up to progressLevel
                    if (this.selectedLevel <= this.progressLevel) {
                        // Find the index for the selected level
                        const levelInfo = this.actualLevels.find(l => l.levelNum === this.selectedLevel);
                        if (levelInfo) {
                            this.currentLevel = levelInfo.index;

                            PlayerData.Instance.SetNumber('currentLevel', this.currentLevel);
                        }
                    }
                }
                // Restore original font size
                this.valueText.setFontSize('140px');
                
                // Restore button font sizes and alpha when exiting options
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        this.buttons[row][col].text.setFontSize('48px');
                        this.buttons[row][col].setAlpha(1); // Re-enable all buttons
                    }
                }
                
                this.loadLevel(this.currentLevel);
            }
        }

        updateDisplay() {
            this.valueText.setText(this.currentValue.toString());
            this.movesText.setText(`moves: ${this.movesLeft}`);
        }

        updateLevelSelectorButtonStates() {
            // Update prev button (-) state
            if (this.selectedLevel <= 1) {
                // Disable prev button
                this.buttons[1][0].setAlpha(0.3);
            } else {
                // Enable prev button
                this.buttons[1][0].setAlpha(1);
            }
            
            // Update next button (+) state - allow if the next level is within progress
            if (this.selectedLevel >= Math.min(this.actualLevels.length, this.progressLevel)) {
                // Disable next button
                this.buttons[1][2].setAlpha(0.3);
            } else {
                // Enable next button
                this.buttons[1][2].setAlpha(1);
            }
        }

        checkGameState() {
            const level = levels[this.currentLevel];

            if (this.currentValue === level.goal) {
                this.gameState = 'win';
                this.valueText.setText('WIN');
                this.drawSmiley('win');

                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        if (row === 0 && col === 2) {
                            this.updateButtonAppearance(this.buttons[row][col], 'NXT');
                        } else {
                            this.updateButtonAppearance(this.buttons[row][col], 'EMP');
                        }
                    }
                }
            } else if (this.movesLeft === 0) {
                this.gameState = 'lose';
                this.valueText.setText('LOSE');
                this.drawSmiley('lose');

                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        if (row === 0 && col === 2) {
                            this.updateButtonAppearance(this.buttons[row][col], 'RST');
                        } else {
                            this.updateButtonAppearance(this.buttons[row][col], 'EMP');
                        }
                    }
                }
            }
        }
    }

    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 720,
            height: 1280
        },
        resolution: window.devicePixelRatio || 1,
        antialias: true,
        pixelArt: false,
        roundPixels: false,
        scene: GameScene
    };

    AdManager.Initialize(() => {
        // Load saved data BEFORE creating the game
        const playerData = new PlayerData(() => {
            const game = new Phaser.Game(config);
        });
        
        // Some fake events for now
        setTimeout(() => {
            AdManager.instance.LoadingFinished();
            AdManager.instance.GameplayStart();
            setTimeout(() => {
                AdManager.instance.GameplayStop();
                AdManager.instance.GameplayStart();
            }, 2000);
        }, 2000);
    });
});