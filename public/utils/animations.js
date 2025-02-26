const animatedObjects = []; // Store all animated objects

/**
 * Add an animation to an object.
 * @param {THREE.Object3D} object - The 3D object to animate.
 * @param {string} animationType - The type of animation ("rotate", "scalePulse").
 * @param {object} options - Options for the animation (e.g., speed, minScale, maxScale).
 */
function addAnimation(object, animationType, options = {}) {
    removeAnimation(object);
    console.log(`Animation for object ${object} added.`);
    console.log("animation type: " + animationType + " " + options.speed)
    console.log("final speed: "+ object.rotation.y)
    animatedObjects.push({ object, animationType, options });
}

/**
 * Remove an animation from an object.
 * @param {THREE.Object3D} object - The 3D object to remove the animation from.
 */
function removeAnimation(object) {
    const index = animatedObjects.findIndex(item => item.object === object);
    
    if (index !== -1) {
        animatedObjects.length = 0;  // Remove the animation from the array
        console.log(`Animation for object ${object} removed.`);
    } else {
        console.warn(`No animation found for object ${object}.`);
    }
}

/**
 * Update all animations in the `animatedObjects` array.
 */
function updateAnimations() {
    animatedObjects.forEach(({ object, animationType, options }) => {
        if (!object) {
            console.warn(`Object for animation ${animationType} is undefined.`);
            return;
        }
        if (animations[animationType]) {

            animations[animationType](object, ...Object.values(options));
        }
    });
}

// Define the supported animations
const animations = {
    rotate: (object, speed = 0.005) => {
        object.rotation.y += 0.005;
    },
    scalePulse: (object, minScale = 0.8, maxScale = 1.2, speed = 0.5) => {
        const scale =
            Math.sin(Date.now() * 0.001 * speed) * (maxScale - minScale) / 2 +
            (minScale + maxScale) / 2;
        object.scale.set(scale, scale, scale);
    },
};

// Export functions
export default {
    addAnimation,
    removeAnimation,
    updateAnimations,
};
