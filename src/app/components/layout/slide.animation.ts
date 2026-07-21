import { Animation, AnimationController } from '@ionic/angular';

export const slideAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const animationCtrl = new AnimationController();
  const rootAnimation = animationCtrl.create();

  const enteringEl = opts?.enteringEl;
  const leavingEl = opts?.leavingEl;
  const direction = opts?.direction;

  // If elements are missing, return empty animation
  if (!enteringEl || !leavingEl) {
    return rootAnimation;
  }

  // Entering page animation
  const enteringAnimation = animationCtrl
    .create()
    .addElement(enteringEl)
    .duration(300)
    .easing('ease-in-out')
    .beforeRemoveClass('ion-page-invisible'); // Ensure visibility

  // Leaving page animation
  const leavingAnimation = animationCtrl
    .create()
    .addElement(leavingEl)
    .duration(300)
    .easing('ease-in-out');

  // Define slide direction based on navigation
  if (direction === 'forward') {
    enteringAnimation.fromTo('transform', 'translateX(100%)', 'translateX(0)');
    leavingAnimation.fromTo('transform', 'translateX(0)', 'translateX(-100%)');
  } else if (direction === 'back') {
    enteringAnimation.fromTo('transform', 'translateX(-100%)', 'translateX(0)');
    leavingAnimation.fromTo('transform', 'translateX(0)', 'translateX(100%)');
  } else {
    // Fallback for undefined direction (e.g., initial load)
    enteringAnimation.fromTo('transform', 'translateX(0)', 'translateX(0)');
    leavingAnimation.fromTo('transform', 'translateX(0)', 'translateX(0)');
  }

  // Combine animations
  return rootAnimation.addAnimation([enteringAnimation, leavingAnimation]);
};
