class ChessPiece extends Phaser.GameObjects.Container {
    // Static constants for move patterns to avoid recreating arrays
    static KNIGHT_MOVES = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    static KING_MOVES = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    
    static BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    static ROOK_DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    static QUEEN_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]];
    
    constructor(scene, x, y, unit, color, board) {
        super(scene, x, y);
        this.unit = unit;
        this.color = color;
        this.board = board;
        this.boardX = Math.floor((x - board.xOffset) / board.tileSize);
        this.boardY = Math.floor((y - board.yOffset) / board.tileSize);
        
        scene.add.existing(this);
        this.createPieceGraphics();
        this.setSize(board.tileSize * 0.8, board.tileSize * 0.8);
        this.setInteractive();
        this.setDepth(20);
    }

    createPieceGraphics() {
        // Add the real chess piece image
        const prefix = this.color === 'white' ? 'hero_' : 'enemy_';
        const frameName = prefix + this.unit + '.png';
        
        if (this.scene.textures.exists('characters')) {
            const pieceImage = this.scene.add.image(0, this.board.tileSize / 2.0, 'characters', frameName);
            const scale = (this.board.tileSize * 0.8) / pieceImage.width; // max (width, height), but i only need to fit width wise
            pieceImage.setScale(scale);
            pieceImage.setOrigin(0.5, 1.0);
            this.add(pieceImage);
        }
        
        if (Gameplay.ShowGraphics) {
            // Keep the existing graphics as a fallback/overlay
            const graphics = this.scene.add.graphics();
            const size = this.board.tileSize * 0.7;
            const fillColor = this.color === 'white' ? 0xFFFFFF : 0x333333;
            const strokeColor = this.color === 'white' ? 0x333333 : 0xFFFFFF;
            
            graphics.fillStyle(fillColor, 1);
            graphics.lineStyle(2, strokeColor, 1);
            
            switch(this.unit) {
                case 'knight':
                    this.drawKnight(graphics, size);
                    break;
                case 'king':
                    this.drawKing(graphics, size);
                    break;
                case 'pawn':
                    this.drawPawn(graphics, size);
                    break;
                case 'bishop':
                    this.drawBishop(graphics, size);
                    break;
                case 'rook':
                    this.drawRook(graphics, size);
                    break;
                case 'queen':
                    this.drawQueen(graphics, size);
                    break;
            }
            
            //graphics.setAlpha(0.3);  // Make graphics semi-transparent since we have real images
            this.add(graphics);
        }
    }

    drawKnight(graphics, size) {
        graphics.beginPath();
        graphics.moveTo(-size * 0.3, size * 0.4);
        graphics.lineTo(-size * 0.3, size * 0.1);
        graphics.lineTo(-size * 0.2, -size * 0.1);
        graphics.lineTo(-size * 0.1, -size * 0.3);
        graphics.lineTo(0, -size * 0.35);
        graphics.lineTo(size * 0.15, -size * 0.3);
        graphics.lineTo(size * 0.25, -size * 0.15);
        graphics.lineTo(size * 0.3, 0);
        graphics.lineTo(size * 0.25, size * 0.2);
        graphics.lineTo(size * 0.1, size * 0.4);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-size * 0.05, -size * 0.15, size * 0.05);
    }

    drawKing(graphics, size) {
        graphics.fillRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
        graphics.fillRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.3);
        graphics.fillRect(-size * 0.15, -size * 0.25, size * 0.3, size * 0.15);
        
        graphics.fillRect(-size * 0.05, -size * 0.4, size * 0.1, size * 0.15);
        graphics.fillRect(-size * 0.1, -size * 0.35, size * 0.2, size * 0.05);
        
        graphics.strokeRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
        graphics.strokeRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.3);
        graphics.strokeRect(-size * 0.15, -size * 0.25, size * 0.3, size * 0.15);
        graphics.strokeRect(-size * 0.05, -size * 0.4, size * 0.1, size * 0.15);
        graphics.strokeRect(-size * 0.1, -size * 0.35, size * 0.2, size * 0.05);
    }

    drawPawn(graphics, size) {
        graphics.fillCircle(0, -size * 0.15, size * 0.2);
        graphics.fillRect(-size * 0.15, 0, size * 0.3, size * 0.2);
        graphics.fillRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
        
        graphics.strokeCircle(0, -size * 0.15, size * 0.2);
        graphics.strokeRect(-size * 0.15, 0, size * 0.3, size * 0.2);
        graphics.strokeRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
    }

    drawBishop(graphics, size) {
        graphics.beginPath();
        graphics.moveTo(-size * 0.25, size * 0.4);
        graphics.lineTo(-size * 0.15, size * 0.1);
        graphics.lineTo(-size * 0.1, -size * 0.1);
        graphics.lineTo(-size * 0.05, -size * 0.25);
        graphics.lineTo(0, -size * 0.35);
        graphics.lineTo(size * 0.05, -size * 0.25);
        graphics.lineTo(size * 0.1, -size * 0.1);
        graphics.lineTo(size * 0.15, size * 0.1);
        graphics.lineTo(size * 0.25, size * 0.4);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(0, -size * 0.35, size * 0.08);
    }

    drawRook(graphics, size) {
        // Base of the rook
        graphics.fillRect(-size * 0.3, size * 0.2, size * 0.6, size * 0.2);
        graphics.strokeRect(-size * 0.3, size * 0.2, size * 0.6, size * 0.2);
        
        // Tower body
        graphics.fillRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.4);
        graphics.strokeRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.4);
        
        // Battlements
        graphics.fillRect(-size * 0.25, -size * 0.35, size * 0.1, size * 0.15);
        graphics.fillRect(-size * 0.05, -size * 0.35, size * 0.1, size * 0.15);
        graphics.fillRect(size * 0.15, -size * 0.35, size * 0.1, size * 0.15);
        
        graphics.strokeRect(-size * 0.25, -size * 0.35, size * 0.1, size * 0.15);
        graphics.strokeRect(-size * 0.05, -size * 0.35, size * 0.1, size * 0.15);
        graphics.strokeRect(size * 0.15, -size * 0.35, size * 0.1, size * 0.15);
    }

    drawQueen(graphics, size) {
        // Base of the queen
        graphics.fillRect(-size * 0.3, size * 0.2, size * 0.6, size * 0.2);
        graphics.strokeRect(-size * 0.3, size * 0.2, size * 0.6, size * 0.2);
        
        // Body
        graphics.fillRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.3);
        graphics.strokeRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.3);
        
        // Crown base
        graphics.fillRect(-size * 0.15, -size * 0.25, size * 0.3, size * 0.15);
        graphics.strokeRect(-size * 0.15, -size * 0.25, size * 0.3, size * 0.15);
        
        // Crown points
        graphics.beginPath();
        graphics.moveTo(-size * 0.15, -size * 0.25);
        graphics.lineTo(-size * 0.1, -size * 0.4);
        graphics.lineTo(-size * 0.05, -size * 0.3);
        graphics.lineTo(0, -size * 0.4);
        graphics.lineTo(size * 0.05, -size * 0.3);
        graphics.lineTo(size * 0.1, -size * 0.4);
        graphics.lineTo(size * 0.15, -size * 0.25);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        // Crown jewel
        graphics.fillStyle(this.color === 'white' ? 0x333333 : 0xFFFFFF, 1);
        graphics.fillCircle(0, -size * 0.4, size * 0.06);
    }

    moveTo(boardX, boardY, onComplete) {
        const oldBoardX = this.boardX;
        const oldBoardY = this.boardY;
        this.boardX = boardX;
        this.boardY = boardY;
        const newX = this.board.xOffset + boardX * this.board.tileSize + this.board.tileSize / 2;
        const newY = this.board.yOffset + boardY * this.board.tileSize + this.board.tileSize / 2;
        
        // Bring moving piece to front
        this.setDepth(100);
        
        // Create dotted path for movement
        this.createMovementPath(oldBoardX, oldBoardY, boardX, boardY);
        
        // Special L-shaped movement for knights
        if (this.unit === 'knight') {
            const dx = boardX - oldBoardX;
            const dy = boardY - oldBoardY;
            
            // Determine intermediate position (move larger distance first)
            let intermediateX, intermediateY;
            if (Math.abs(dx) > Math.abs(dy)) {
                // Move horizontally first, then vertically
                intermediateX = this.board.xOffset + boardX * this.board.tileSize + this.board.tileSize / 2;
                intermediateY = this.board.yOffset + oldBoardY * this.board.tileSize + this.board.tileSize / 2;
            } else {
                // Move vertically first, then horizontally
                intermediateX = this.board.xOffset + oldBoardX * this.board.tileSize + this.board.tileSize / 2;
                intermediateY = this.board.yOffset + boardY * this.board.tileSize + this.board.tileSize / 2;
            }
            
            // Bounce parameters - consistent regardless of distance
            const bounceHeight = 25;
            const bounceDuration = 200; // Fixed duration per bounce
            const bounceSpacing = 180; // Fixed pixels between bounces
            
            // Calculate distances for each segment
            const dist1 = Math.sqrt(Math.pow(intermediateX - this.x, 2) + Math.pow(intermediateY - this.y, 2));
            const dist2 = Math.sqrt(Math.pow(newX - intermediateX, 2) + Math.pow(newY - intermediateY, 2));
            
            // Calculate bounce counts based on distance
            const bounceCount1 = Math.max(1, Math.floor(dist1 / bounceSpacing));
            const bounceCount2 = Math.max(1, Math.floor(dist2 / bounceSpacing));
            
            // Calculate durations based on bounce counts
            const duration1 = bounceCount1 * bounceDuration * 2;
            const duration2 = bounceCount2 * bounceDuration * 2;
            
            // First part of L-shape with hopping
            this.scene.tweens.add({
                targets: this,
                x: intermediateX,
                duration: duration1,
                ease: 'Linear',
                onComplete: () => {
                    // Second part of L-shape with hopping
                    this.scene.tweens.add({
                        targets: this,
                        x: newX,
                        y: newY,
                        duration: duration2,
                        ease: 'Linear',
                        onComplete: () => {
                            // Reset depth after movement
                            this.setDepth(20);
                            // Clear the movement path
                            this.clearMovementPath();
                            // Call the completion callback if provided
                            if (onComplete) onComplete();
                        }
                    });
                    
                    // Create bouncing animation during second segment
                    for (let i = 0; i < bounceCount2; i++) {
                        this.scene.tweens.add({
                            targets: this.list[0], // Target the piece image
                            y: -bounceHeight,
                            duration: bounceDuration,
                            delay: i * (bounceDuration * 2),
                            yoyo: true,
                            ease: 'Sine.easeOut'
                        });
                    }
                }
            });
            
            // Add vertical bounce for first segment
            this.scene.tweens.add({
                targets: this,
                y: intermediateY,
                duration: duration1,
                ease: 'Linear'
            });
            
            // Create bouncing animation during first segment
            for (let i = 0; i < bounceCount1; i++) {
                this.scene.tweens.add({
                    targets: this.list[0], // Target the piece image
                    y: -bounceHeight,
                    duration: bounceDuration,
                    delay: i * (bounceDuration * 2),
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });
            }
        } else {
            // Normal linear movement for other pieces with hopping
            // Calculate distance for consistent bounce speed
            const distance = Math.sqrt(Math.pow(newX - this.x, 2) + Math.pow(newY - this.y, 2));
            const bounceHeight = 25;
            const bounceDuration = 200; // Fixed duration per bounce
            const bounceSpacing = 180; // Fixed pixels between bounces
            
            // Calculate number of bounces based on distance
            const bounceCount = Math.max(1, Math.floor(distance / bounceSpacing));
            const moveDuration = bounceCount * bounceDuration * 2; // Total duration based on bounces
            
            // Horizontal and vertical movement
            this.scene.tweens.add({
                targets: this,
                x: newX,
                y: newY,
                duration: moveDuration,
                ease: 'Linear',
                onComplete: () => {
                    // Reset depth after movement
                    this.setDepth(20);
                    // Clear the movement path
                    this.clearMovementPath();
                    // Call the completion callback if provided
                    if (onComplete) onComplete();
                }
            });
            
            // Create bouncing animation during movement
            for (let i = 0; i < bounceCount; i++) {
                this.scene.tweens.add({
                    targets: this.list[0], // Target the piece image
                    y: -bounceHeight,
                    duration: bounceDuration,
                    delay: i * (bounceDuration * 2),
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });
            }
        }
    }

    getValidMoves() {
        const moves = [];
        
        switch(this.unit) {
            case 'knight':
                // Use static constant instead of recreating array each time
                for (let i = 0; i < ChessPiece.KNIGHT_MOVES.length; i++) {
                    const [dx, dy] = ChessPiece.KNIGHT_MOVES[i];
                    const newX = this.boardX + dx;
                    const newY = this.boardY + dy;
                    if (newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
                        const pieceAt = this.board.getPieceAt(newX, newY);
                        if (!pieceAt || pieceAt.color !== this.color) {
                            moves.push({ x: newX, y: newY });
                        }
                    }
                }
                break;
                
            case 'pawn':
                const direction = this.color === 'white' ? -1 : 1;
                const forwardY = this.boardY + direction;
                if (forwardY >= 0 && forwardY < BOARD_HEIGHT) {
                    const pieceAtForward = this.board.getPieceAt(this.boardX, forwardY);
                    if (!pieceAtForward) {
                        moves.push({ x: this.boardX, y: forwardY });
                    }
                    
                    [-1, 1].forEach(dx => {
                        const captureX = this.boardX + dx;
                        if (captureX >= 0 && captureX < BOARD_WIDTH) {
                            const pieceAtCapture = this.board.getPieceAt(captureX, forwardY);
                            if (pieceAtCapture && pieceAtCapture.color !== this.color) {
                                // Only white knights can capture black king
                                if (!(this.color === 'white' && pieceAtCapture.unit === 'king' && pieceAtCapture.color === 'black')) {
                                    moves.push({ x: captureX, y: forwardY });
                                }
                            }
                        }
                    });
                }
                break;
                
            case 'bishop':
                // Use static constant instead of recreating array each time
                for (let d = 0; d < ChessPiece.BISHOP_DIRECTIONS.length; d++) {
                    const [dx, dy] = ChessPiece.BISHOP_DIRECTIONS[d];
                    for (let i = 1; i < Math.max(BOARD_WIDTH, BOARD_HEIGHT); i++) {
                        const newX = this.boardX + dx * i;
                        const newY = this.boardY + dy * i;
                        if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) break;
                        
                        const piece = this.board.getPieceAt(newX, newY);
                        if (piece) {
                            if (piece.color !== this.color) {
                                // Only white knights can capture black king
                                if (!(this.color === 'white' && piece.unit === 'king' && piece.color === 'black')) {
                                    moves.push({ x: newX, y: newY });
                                }
                            }
                            break;
                        }
                        moves.push({ x: newX, y: newY });
                    }
                }
                break;
                
            case 'rook':
                // Rook moves horizontally and vertically
                for (let d = 0; d < ChessPiece.ROOK_DIRECTIONS.length; d++) {
                    const [dx, dy] = ChessPiece.ROOK_DIRECTIONS[d];
                    for (let i = 1; i < Math.max(BOARD_WIDTH, BOARD_HEIGHT); i++) {
                        const newX = this.boardX + dx * i;
                        const newY = this.boardY + dy * i;
                        if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) break;
                        
                        const piece = this.board.getPieceAt(newX, newY);
                        if (piece) {
                            if (piece.color !== this.color) {
                                // Only white knights can capture black king
                                if (!(this.color === 'white' && piece.unit === 'king' && piece.color === 'black')) {
                                    moves.push({ x: newX, y: newY });
                                }
                            }
                            break;
                        }
                        moves.push({ x: newX, y: newY });
                    }
                }
                break;
                
            case 'queen':
                // Queen moves both diagonally and straight (combination of rook and bishop)
                for (let d = 0; d < ChessPiece.QUEEN_DIRECTIONS.length; d++) {
                    const [dx, dy] = ChessPiece.QUEEN_DIRECTIONS[d];
                    for (let i = 1; i < Math.max(BOARD_WIDTH, BOARD_HEIGHT); i++) {
                        const newX = this.boardX + dx * i;
                        const newY = this.boardY + dy * i;
                        if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) break;
                        
                        const piece = this.board.getPieceAt(newX, newY);
                        if (piece) {
                            if (piece.color !== this.color) {
                                // Only white knights can capture black king
                                if (!(this.color === 'white' && piece.unit === 'king' && piece.color === 'black')) {
                                    moves.push({ x: newX, y: newY });
                                }
                            }
                            break;
                        }
                        moves.push({ x: newX, y: newY });
                    }
                }
                break;
                
            case 'king':
                // Use static constant instead of recreating array each time
                for (let i = 0; i < ChessPiece.KING_MOVES.length; i++) {
                    const [dx, dy] = ChessPiece.KING_MOVES[i];
                    const newX = this.boardX + dx;
                    const newY = this.boardY + dy;
                    if (newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
                        const pieceAt = this.board.getPieceAt(newX, newY);
                        if (!pieceAt || pieceAt.color !== this.color) {
                            moves.push({ x: newX, y: newY });
                        }
                    }
                }
                break;
        }
        
        return moves;
    }

    getAttackPositions() {
        const attacks = [];
        
        switch(this.unit) {
            case 'pawn':
                const direction = this.color === 'white' ? -1 : 1;
                const forwardY = this.boardY + direction;
                if (forwardY >= 0 && forwardY < BOARD_HEIGHT) {
                    [-1, 1].forEach(dx => {
                        const captureX = this.boardX + dx;
                        if (captureX >= 0 && captureX < BOARD_WIDTH) {
                            attacks.push({ x: captureX, y: forwardY });
                        }
                    });
                }
                break;
                
            default:
                // For all other pieces, attack positions are the same as valid moves
                return this.getValidMoves();
        }
        
        return attacks;
    }
    
    createMovementPath(fromX, fromY, toX, toY) {
        // Clear any existing path
        this.clearMovementPath();
        
        // Create graphics for the path
        this.pathGraphics = this.scene.add.graphics();
        this.pathGraphics.setDepth(10); // Below pieces (which are at depth 20+)
        
        // Get world coordinates for start and end
        const startX = this.board.xOffset + fromX * this.board.tileSize + this.board.tileSize / 2;
        const startY = this.board.yOffset + fromY * this.board.tileSize + this.board.tileSize / 2;
        const endX = this.board.xOffset + toX * this.board.tileSize + this.board.tileSize / 2;
        const endY = this.board.yOffset + toY * this.board.tileSize + this.board.tileSize / 2;
        
        // Generate path points
        let pathPoints = [];
        
        if (this.unit === 'knight') {
            // L-shaped path for knight
            const dx = toX - fromX;
            const dy = toY - fromY;
            
            // Determine intermediate position
            let intermediateX, intermediateY;
            if (Math.abs(dx) > Math.abs(dy)) {
                // Move horizontally first, then vertically
                intermediateX = endX;
                intermediateY = startY;
            } else {
                // Move vertically first, then horizontally
                intermediateX = startX;
                intermediateY = endY;
            }
            
            // Generate dots for L-shaped path with consistent spacing
            pathPoints = this.generateLShapedPath(startX, startY, intermediateX, intermediateY, endX, endY);
        } else {
            // Direct straight path for other pieces
            pathPoints = this.generateDotsAlongLine(startX, startY, endX, endY);
        }
        
        // Set dot color based on piece color
        const dotColor = this.color === 'white' ? 0xFFFFFF : 0x000000;
        this.pathGraphics.fillStyle(dotColor, 1);
        
        pathPoints.forEach(point => {
            this.pathGraphics.fillCircle(point.x, point.y, DOT_RADIUS);
        });
        
        // Animate dots appearing
        this.pathGraphics.setAlpha(0);
        this.scene.tweens.add({
            targets: this.pathGraphics,
            alpha: 0.8,
            duration: 200,
            ease: 'Power2'
        });
    }
    
    generateDotsAlongLine(x1, y1, x2, y2) {
        const dots = [];
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Use larger spacing between dots (double the DOT_STEP for better visibility)
        const dotSpacing = DOT_STEP * 2;
        
        // Calculate number of dots that fit in the distance
        const numDots = Math.floor(distance / dotSpacing) + 1;
        
        // Place dots evenly along the entire line from center to center
        for (let i = 0; i <= numDots; i++) {
            const t = i / numDots;
            dots.push({
                x: x1 + (x2 - x1) * t,
                y: y1 + (y2 - y1) * t
            });
        }
        
        return dots;
    }
    
    generateLShapedPath(startX, startY, midX, midY, endX, endY) {
        const dots = [];
        
        // Use larger spacing for better visibility
        const dotSpacing = DOT_STEP * 2;
        
        // Calculate total path length
        const dist1 = Math.sqrt(Math.pow(midX - startX, 2) + Math.pow(midY - startY, 2));
        const dist2 = Math.sqrt(Math.pow(endX - midX, 2) + Math.pow(endY - midY, 2));
        const totalDistance = dist1 + dist2;
        
        // Calculate how many dots we can fit along the entire path
        const totalDots = Math.floor(totalDistance / dotSpacing);
        
        // Place dots along the entire L-shaped path with consistent spacing
        for (let i = 0; i <= totalDots; i++) {
            const currentDistance = (i / totalDots) * totalDistance;
            let x, y;
            
            if (currentDistance <= dist1) {
                // First segment
                const t = currentDistance / dist1;
                x = startX + (midX - startX) * t;
                y = startY + (midY - startY) * t;
            } else {
                // Second segment
                const segmentDistance = currentDistance - dist1;
                const t = segmentDistance / dist2;
                x = midX + (endX - midX) * t;
                y = midY + (endY - midY) * t;
            }
            
            dots.push({ x, y });
        }
        
        return dots;
    }
    
    clearMovementPath() {
        if (this.pathGraphics) {
            this.pathGraphics.destroy();
            this.pathGraphics = null;
        }
    }
}