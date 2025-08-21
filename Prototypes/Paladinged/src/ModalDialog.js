export default class ModalDialog {
    constructor(scene) {
        this.scene = scene;
        this.modalQueue = [];
        this.currentModal = null;
        this.isShowing = false;
    }

    createModal(config = {}) {
        const modal = {
            title: config.title || '',
            text: config.text || '',
            showCloseButton: config.showCloseButton || false,
            showOkButton: config.showOkButton || false,
            showCancelButton: config.showCancelButton || false,
            okButtonText: config.okButtonText || 'OK',
            cancelButtonText: config.cancelButtonText || 'Cancel',
            centerButtons: config.centerButtons || false,
            onOk: config.onOk || null,
            onCancel: config.onCancel || null,
            onClose: config.onClose || null,
            width: config.width || 450,
            backgroundColor: config.backgroundColor || 0xffffff,
            borderColor: config.borderColor || 0x333333,
            borderWidth: config.borderWidth || 2,
            titleFontSize: config.titleFontSize || '28px',
            textFontSize: config.textFontSize || '20px',
            buttonFontSize: config.buttonFontSize || '20px'
        };

        this.modalQueue.push(modal);
        
        if (!this.isShowing) {
            this.showNextModal();
        }
    }

    showNextModal() {
        if (this.modalQueue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        const modal = this.modalQueue.shift();
        this.displayModal(modal);
    }

    displayModal(modal) {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // Disable input when modal is shown
        if (this.scene.inputManager) {
            this.scene.inputManager.setEnabled(false);
        }

        // Create container for all modal elements
        this.currentModal = this.scene.add.container(0, 0);
        this.currentModal.setDepth(1000);

        // Dark background overlay
        this.overlay = this.scene.add.rectangle(
            centerX, 
            centerY, 
            this.scene.cameras.main.width, 
            this.scene.cameras.main.height, 
            0x000000, 
            0.7
        );
        this.overlay.setInteractive();
        this.currentModal.add(this.overlay);

        // Layout constants
        const headerHeight = 60;
        const footerHeight = 70;
        const verticalPadding = 30;
        const contentPadding = 40;
        
        // Calculate dynamic height based on content
        let bodyHeight = 80; // minimum body height
        
        // Create temporary text to measure actual height
        if (modal.text) {
            const tempText = this.scene.add.text(0, 0, modal.text, {
                fontSize: modal.textFontSize,
                color: '#000000',
                wordWrap: { width: modal.width - contentPadding * 2 },
                align: 'center',
                lineSpacing: 5
            });
            bodyHeight = Math.max(80, tempText.height + verticalPadding * 2);
            tempText.destroy();
        }
        
        // Calculate total modal height
        const totalHeight = headerHeight + bodyHeight + 
                          (modal.showOkButton || modal.showCancelButton ? footerHeight : 0);
        
        // Ensure minimum total height
        const minHeight = 200;
        const finalHeight = Math.max(minHeight, totalHeight);
        
        // Modal window background
        this.modalBg = this.scene.add.rectangle(
            centerX,
            centerY,
            modal.width,
            finalHeight,
            modal.backgroundColor
        );
        this.currentModal.add(this.modalBg);

        // Modal window border
        this.modalBorder = this.scene.add.rectangle(
            centerX,
            centerY,
            modal.width,
            finalHeight
        );
        this.modalBorder.setStrokeStyle(modal.borderWidth, modal.borderColor);
        this.currentModal.add(this.modalBorder);

        // Header section with background
        const headerY = centerY - finalHeight/2 + headerHeight/2;
        const headerBg = this.scene.add.rectangle(
            centerX,
            headerY,
            modal.width,
            headerHeight,
            0xf0f0f0
        );
        this.currentModal.add(headerBg);
        
        // Header separator line
        const headerLine = this.scene.add.rectangle(
            centerX,
            centerY - finalHeight/2 + headerHeight,
            modal.width - 2,
            2,
            0xdddddd
        );
        this.currentModal.add(headerLine);

        // Title text in header
        if (modal.title) {
            this.titleText = this.scene.add.text(
                centerX,
                headerY,
                modal.title,
                {
                    fontSize: modal.titleFontSize,
                    color: '#000000',
                    fontStyle: 'bold'
                }
            );
            this.titleText.setOrigin(0.5);
            this.currentModal.add(this.titleText);
        }

        // Body section - Main text
        if (modal.text) {
            const bodyY = centerY - finalHeight/2 + headerHeight + bodyHeight/2;
            this.mainText = this.scene.add.text(
                centerX,
                bodyY,
                modal.text,
                {
                    fontSize: modal.textFontSize,
                    color: '#333333',
                    wordWrap: { width: modal.width - contentPadding * 2 },
                    align: 'center',
                    lineSpacing: 5
                }
            );
            this.mainText.setOrigin(0.5);
            this.currentModal.add(this.mainText);
        }
        
        // Footer separator line (if buttons exist)
        if (modal.showOkButton || modal.showCancelButton) {
            const footerLine = this.scene.add.rectangle(
                centerX,
                centerY + finalHeight/2 - footerHeight,
                modal.width - 2,
                2,
                0xdddddd
            );
            this.currentModal.add(footerLine);
        }

        // Close button (X in upper right of header)
        if (modal.showCloseButton) {
            const closeX = centerX + modal.width/2 - 30;
            const closeY = headerY;
            
            this.closeButton = this.scene.add.text(
                closeX,
                closeY,
                '✕',
                {
                    fontSize: '28px',
                    color: '#666666',
                    fontStyle: 'bold'
                }
            );
            this.closeButton.setOrigin(0.5);
            this.closeButton.setInteractive({ useHandCursor: true });
            
            this.closeButton.on('pointerover', () => {
                this.closeButton.setColor('#ff0000');
            });
            
            this.closeButton.on('pointerout', () => {
                this.closeButton.setColor('#666666');
            });
            
            this.closeButton.on('pointerdown', () => {
                this.handleClose(modal);
            });
            
            this.currentModal.add(this.closeButton);
        }

        // OK and Cancel buttons in footer
        const buttonY = centerY + finalHeight/2 - footerHeight/2;
        const buttonHeight = 40;
        const buttonPadding = 30; // Horizontal padding inside button
        const buttonSpacing = 20; // Space between buttons
        const minButtonWidth = 80; // Minimum button width

        if (modal.showOkButton || modal.showCancelButton) {
            let buttonsToShow = [];
            
            if (modal.showCancelButton) {
                buttonsToShow.push({
                    text: modal.cancelButtonText,
                    callback: () => this.handleCancel(modal)
                });
            }
            
            if (modal.showOkButton) {
                buttonsToShow.push({
                    text: modal.okButtonText,
                    callback: () => this.handleOk(modal)
                });
            }

            // Calculate button widths based on text
            const buttonWidths = buttonsToShow.map(buttonInfo => {
                const tempText = this.scene.add.text(0, 0, buttonInfo.text, {
                    fontSize: modal.buttonFontSize,
                    fontStyle: 'bold'
                });
                const textWidth = tempText.width;
                tempText.destroy();
                return Math.max(minButtonWidth, textWidth + buttonPadding);
            });

            // Calculate total width and positioning
            const totalWidth = buttonWidths.reduce((sum, width) => sum + width, 0) +
                             (buttonsToShow.length - 1) * buttonSpacing;
            
            let currentX;
            if (modal.centerButtons) {
                currentX = centerX - totalWidth / 2;
            } else {
                currentX = centerX + modal.width/2 - totalWidth - 20;
            }

            buttonsToShow.forEach((buttonInfo, index) => {
                const buttonWidth = buttonWidths[index];
                const buttonX = currentX + buttonWidth / 2;
                
                // Determine button color based on type
                const isOkButton = buttonInfo.text === modal.okButtonText;
                const buttonColor = isOkButton ? 0x4CAF50 : 0xe0e0e0;
                const hoverColor = isOkButton ? 0x66BB6A : 0xcccccc;
                const textColor = isOkButton ? '#ffffff' : '#333333';
                
                const buttonBg = this.scene.add.graphics();
                buttonBg.fillStyle(buttonColor, 1);
                buttonBg.fillRoundedRect(
                    buttonX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight,
                    5
                );
                
                const hitArea = new Phaser.Geom.Rectangle(
                    buttonX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight
                );
                buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
                
                const buttonText = this.scene.add.text(
                    buttonX,
                    buttonY,
                    buttonInfo.text,
                    {
                        fontSize: modal.buttonFontSize,
                        color: textColor,
                        fontStyle: 'bold'
                    }
                );
                buttonText.setOrigin(0.5);
                
                buttonBg.on('pointerover', () => {
                    buttonBg.clear();
                    buttonBg.fillStyle(hoverColor, 1);
                    buttonBg.fillRoundedRect(
                        buttonX - buttonWidth/2,
                        buttonY - buttonHeight/2,
                        buttonWidth,
                        buttonHeight,
                        5
                    );
                    this.scene.input.setDefaultCursor('pointer');
                });
                
                buttonBg.on('pointerout', () => {
                    buttonBg.clear();
                    buttonBg.fillStyle(buttonColor, 1);
                    buttonBg.fillRoundedRect(
                        buttonX - buttonWidth/2,
                        buttonY - buttonHeight/2,
                        buttonWidth,
                        buttonHeight,
                        5
                    );
                    this.scene.input.setDefaultCursor('default');
                });
                
                buttonBg.on('pointerdown', () => {
                    // Reset cursor before executing callback
                    this.scene.input.setDefaultCursor('default');
                    buttonInfo.callback();
                });
                
                this.currentModal.add(buttonBg);
                this.currentModal.add(buttonText);
                
                // Move currentX to position for next button
                currentX += buttonWidth + buttonSpacing;
            });
        }

        // Store modal info for cleanup
        this.currentModalConfig = modal;
    }

    handleOk(modal) {
        if (modal.onOk) {
            modal.onOk();
        }
        this.closeCurrentModal();
    }

    handleCancel(modal) {
        if (modal.onCancel) {
            modal.onCancel();
        }
        this.closeCurrentModal();
    }

    handleClose(modal) {
        if (modal.onClose) {
            modal.onClose();
        }
        this.closeCurrentModal();
    }

    closeCurrentModal() {
        if (this.currentModal) {
            // Reset cursor to default when closing modal
            this.scene.input.setDefaultCursor('default');
            
            this.currentModal.destroy();
            this.currentModal = null;
            this.currentModalConfig = null;
        }
        
        // Re-enable input if no more modals
        if (this.modalQueue.length === 0 && this.scene.inputManager) {
            this.scene.inputManager.setEnabled(true);
        }
        
        // Show next modal in queue if any
        this.showNextModal();
    }

    // Utility methods for common modal types
    showMessage(title, text, onClose = null) {
        this.createModal({
            title: title,
            text: text,
            showOkButton: true,
            onOk: onClose
        });
    }

    showConfirm(title, text, onConfirm = null, onCancel = null) {
        this.createModal({
            title: title,
            text: text,
            showOkButton: true,
            showCancelButton: true,
            okButtonText: 'Yes',
            cancelButtonText: 'No',
            centerButtons: true,
            onOk: onConfirm,
            onCancel: onCancel
        });
    }

    showAlert(title, text) {
        this.createModal({
            title: title,
            text: text,
            showCloseButton: true
        });
    }

    // Clear all modals
    clearQueue() {
        this.modalQueue = [];
        if (this.currentModal) {
            this.closeCurrentModal();
        }
    }

    // Get queue size
    getQueueSize() {
        return this.modalQueue.length + (this.isShowing ? 1 : 0);
    }
}