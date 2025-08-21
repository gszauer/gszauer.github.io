export default class PhysicsManager {
    constructor(scene, config) {
        this.scene = scene;
        this.knockbackForce = config.physics.knockbackForce || 1500;
        this.knockbackBias = config.physics.knockbackBias || 150;
        this.gravityEnabled = false;
    }
    
    calculateKnockback(source, target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            return {
                x: (dx / dist) * this.knockbackForce,
                y: (dy / dist) * this.knockbackForce - this.knockbackBias
            };
        } else {
            return {
                x: this.knockbackForce,
                y: -this.knockbackBias
            };
        }
    }
    
    applyKnockback(entity, forceX, forceY) {
        if (entity.setBouncing) {
            entity.setBouncing(forceX, forceY);
        }
    }
    
    updateEntityPhysics(entity, delta) {
        if (this.gravityEnabled && entity.velocityY !== undefined) {
            entity.velocityY += 980 * (delta / 1000);
        }
    }
    
    calculateBounceVector(incoming, normal) {
        const dot = incoming.x * normal.x + incoming.y * normal.y;
        return {
            x: incoming.x - 2 * dot * normal.x,
            y: incoming.y - 2 * dot * normal.y
        };
    }
}