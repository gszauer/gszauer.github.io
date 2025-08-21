export function circleCircleCollision(circle1, circle2) {
    const dx = circle2.x - circle1.x;
    const dy = circle2.y - circle1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

export function obbCircleCollision(obb, circle) {
    const cos = Math.cos(-obb.rotation);
    const sin = Math.sin(-obb.rotation);
    
    const circleLocalX = (circle.x - obb.center.x) * cos - (circle.y - obb.center.y) * sin;
    const circleLocalY = (circle.x - obb.center.x) * sin + (circle.y - obb.center.y) * cos;
    
    const closestX = Math.max(-obb.halfExtents.x, Math.min(obb.halfExtents.x, circleLocalX));
    const closestY = Math.max(-obb.halfExtents.y, Math.min(obb.halfExtents.y, circleLocalY));
    
    const dx = circleLocalX - closestX;
    const dy = circleLocalY - closestY;
    
    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

export function pointInCircle(px, py, circle) {
    const dx = px - circle.x;
    const dy = py - circle.y;
    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

export function createOBB(centerX, centerY, halfWidth, halfHeight, rotation) {
    return {
        center: { x: centerX, y: centerY },
        halfExtents: { x: halfWidth, y: halfHeight },
        rotation: rotation
    };
}