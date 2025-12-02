/**
 * Material Design 3 Animation Utilities
 * 
 * Provides reusable animation configurations and transitions
 * following Material Design 3 motion principles.
 */

import type { Transition, Variants } from 'framer-motion';

/**
 * Material Design 3 Easing Functions
 */
export const easing = {
    standard: [0.2, 0.0, 0, 1.0] as const,
    emphasized: [0.3, 0.0, 0, 1.0] as const,
    decelerate: [0.0, 0.0, 0, 1.0] as const,
    accelerate: [0.3, 0.0, 1, 1.0] as const,
};

/**
 * Material Design 3 Duration Tokens
 */
export const duration = {
    short: 0.1,
    medium: 0.25,
    long: 0.4,
    extraLong: 0.6,
};

/**
 * Standard fade-in animation
 */
export const fadeIn: Variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -10,
    },
};

/**
 * Slide up animation (for bottom sheets, modals)
 */
export const slideUp: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: 20,
    },
};

/**
 * Scale animation (for dialogs, popups)
 */
export const scaleIn: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        scale: 1,
    },
    exit: {
        opacity: 0,
        scale: 0.9,
    },
};

/**
 * Slide from right (for detail views, sheets)
 */
export const slideFromRight: Variants = {
    initial: {
        x: '100%',
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: '100%',
        opacity: 0,
    },
};

/**
 * Slide from left
 */
export const slideFromLeft: Variants = {
    initial: {
        x: '-100%',
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: '-100%',
        opacity: 0,
    },
};

/**
 * List item stagger animation
 */
export const listContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
        },
    },
};

export const listItem: Variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -10,
    },
};

/**
 * Tab transition (crossfade with slight slide)
 */
export const tabTransition: Variants = {
    initial: {
        opacity: 0,
        x: 20,
    },
    animate: {
        opacity: 1,
        x: 0,
    },
    exit: {
        opacity: 0,
        x: -20,
    },
};

/**
 * Card hover animation config
 */
export const cardHover = {
    rest: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: duration.medium,
            ease: easing.standard,
        },
    },
    tap: {
        scale: 0.98,
        y: 0,
    },
};

/**
 * Button press animation
 */
export const buttonPress = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: duration.short,
            ease: easing.standard,
        },
    },
    tap: {
        scale: 0.95,
    },
};

/**
 * Standard transition config following Material 3
 */
export const standardTransition: Transition = {
    duration: duration.medium,
    ease: easing.standard,
};

/**
 * Emphasized transition for important elements
 */
export const emphasizedTransition: Transition = {
    duration: duration.long,
    ease: easing.emphasized,
};

/**
 * Decelerate transition (for entering elements)
 */
export const decelerateTransition: Transition = {
    duration: duration.medium,
    ease: easing.decelerate,
};

/**
 * Accelerate transition (for exiting elements)
 */
export const accelerateTransition: Transition = {
    duration: duration.medium,
    ease: easing.accelerate,
};

/**
 * Layout animation config (for reordering, resizing)
 */
export const layoutTransition: Transition = {
    type: 'spring',
    stiffness: 350,
    damping: 30,
};

/**
 * Spring animation for elastic effects
 */
export const springTransition: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 25,
};

/**
 * Success feedback animation
 */
export const successFeedback: Variants = {
    initial: {
        scale: 0,
        opacity: 0,
    },
    animate: {
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        transition: {
            duration: 0.5,
            times: [0, 0.6, 1],
            ease: easing.emphasized,
        },
    },
    exit: {
        scale: 0,
        opacity: 0,
    },
};

/**
 * Error shake animation
 */
export const errorShake: Variants = {
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.4,
        },
    },
};

/**
 * Shimmer loading animation props
 */
export const shimmerAnimation = {
    animate: {
        backgroundPosition: ['0% 0%', '100% 0%'],
    },
    transition: {
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
    },
};

/**
 * Pull to refresh animation
 */
export const pullToRefresh: Variants = {
    pulling: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    releasing: {
        rotate: 360,
        transition: {
            duration: 0.6,
            ease: easing.emphasized,
        },
    },
};

/**
 * Notification slide in from top
 */
export const notificationSlide: Variants = {
    initial: {
        y: -100,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: -100,
        opacity: 0,
    },
};

/**
 * Modal backdrop fade
 */
export const backdropFade: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

/**
 * Bottom sheet slide up
 */
export const bottomSheet: Variants = {
    initial: {
        y: '100%',
    },
    animate: {
        y: 0,
        transition: {
            type: 'spring',
            damping: 30,
            stiffness: 300,
        },
    },
    exit: {
        y: '100%',
        transition: {
            duration: duration.medium,
            ease: easing.accelerate,
        },
    },
};

/**
 * Page transition (fade + slide)
 */
export const pageTransition: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: duration.long,
            ease: easing.emphasized,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: duration.medium,
            ease: easing.accelerate,
        },
    },
};
