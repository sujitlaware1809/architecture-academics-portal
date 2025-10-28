"use client"

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ReactNode } from 'react'

// Animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const slideInFromBottom: Variants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Animated Components
interface AnimatedProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export const FadeInUp: React.FC<AnimatedProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.5 
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration, 
      delay, 
      ease: [0.4, 0, 0.2, 1] 
    }}
  >
    {children}
  </motion.div>
)

export const FadeInDown: React.FC<AnimatedProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.5 
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration, 
      delay, 
      ease: [0.4, 0, 0.2, 1] 
    }}
  >
    {children}
  </motion.div>
)

export const ScaleIn: React.FC<AnimatedProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.4 
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      duration, 
      delay, 
      ease: [0.4, 0, 0.2, 1] 
    }}
  >
    {children}
  </motion.div>
)

export const SlideInFromBottom: React.FC<AnimatedProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.6 
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration, 
      delay, 
      ease: [0.4, 0, 0.2, 1] 
    }}
  >
    {children}
  </motion.div>
)

interface StaggeredProps extends AnimatedProps {
  staggerDelay?: number
}

export const StaggeredContainer: React.FC<StaggeredProps> = ({ 
  children, 
  className = "",
  delay = 0,
  staggerDelay = 0.1 
}) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    variants={{
      initial: {},
      animate: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }}
  >
    {children}
  </motion.div>
)

export const StaggeredItem: React.FC<AnimatedProps> = ({ 
  children, 
  className = "",
  duration = 0.5 
}) => (
  <motion.div
    className={className}
    variants={{
      initial: {
        opacity: 0,
        y: 20,
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          ease: [0.4, 0, 0.2, 1],
        },
      },
    }}
  >
    {children}
  </motion.div>
)

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = "" 
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1] 
    }}
  >
    {children}
  </motion.div>
)

// Modal/Dialog animations
export const modalOverlay: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Utility components for common animations
export const HoverScale: React.FC<{
  children: ReactNode
  className?: string
  scale?: number
}> = ({ children, className = "", scale = 1.05 }) => (
  <motion.div
    className={className}
    whileHover={{ 
      scale,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    }}
    whileTap={{ 
      scale: 0.95,
      transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
    }}
  >
    {children}
  </motion.div>
)

export const FloatingElement: React.FC<{
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
}> = ({ children, className = "", amplitude = 10, duration = 3 }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -amplitude, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
)

// Loading spinner with animation
export const LoadingSpinner: React.FC<{
  size?: number
  className?: string
}> = ({ size = 24, className = "" }) => (
  <motion.div
    className={`inline-block border-2 border-current border-t-transparent rounded-full ${className}`}
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }}
  />
)

// Animated counter
export const AnimatedCounter: React.FC<{
  from: number
  to: number
  duration?: number
  className?: string
}> = ({ from, to, duration = 2, className = "" }) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ textContent: from }}
        animate={{ textContent: to }}
        transition={{ duration, ease: "easeOut" }}
      />
    </motion.span>
  )
}