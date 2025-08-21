export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.enabled = true;
        this.touchStartPosition = null;
    }
    
    create() {
        this.scene.input.on('pointerdown', (pointer) => {
            this.handlePointerDown(pointer);
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            this.handlePointerUp(pointer);
        });
        
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            if (this.enabled) {
                this.scene.events.emit('hammerSwing');
            }
        });
        
        this.scene.input.keyboard.on('keydown-ESC', () => {
            if (this.enabled) {
                this.scene.events.emit('returnToMenu');
            }
        });
        
        this.scene.input.keyboard.on('keydown-P', () => {
            if (this.enabled) {
                this.scene.events.emit('pauseToggle');
            }
        });
    }
    
    handlePointerDown(pointer) {
        if (!this.enabled) return;
        
        this.touchStartPosition = {
            x: pointer.x,
            y: pointer.y,
            time: Date.now()
        };
    }
    
    handlePointerUp(pointer) {
        if (!this.enabled) return;
        
        if (this.touchStartPosition) {
            const timeDiff = Date.now() - this.touchStartPosition.time;
            const distX = pointer.x - this.touchStartPosition.x;
            const distY = pointer.y - this.touchStartPosition.y;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (timeDiff < 500 && distance < 50) {
                this.scene.events.emit('hammerSwing');
            } else if (this.isSwipeGesture(this.touchStartPosition, pointer)) {
                const swipeDirection = this.getSwipeDirection(this.touchStartPosition, pointer);
                this.scene.events.emit('swipe', swipeDirection);
            }
        }
        
        this.touchStartPosition = null;
    }
    
    isSwipeGesture(start, end) {
        const distX = end.x - start.x;
        const distY = end.y - start.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        const timeDiff = Date.now() - start.time;
        
        return distance > 100 && timeDiff < 1000;
    }
    
    getSwipeDirection(start, end) {
        const distX = end.x - start.x;
        const distY = end.y - start.y;
        
        if (Math.abs(distX) > Math.abs(distY)) {
            return distX > 0 ? 'right' : 'left';
        } else {
            return distY > 0 ? 'down' : 'up';
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}