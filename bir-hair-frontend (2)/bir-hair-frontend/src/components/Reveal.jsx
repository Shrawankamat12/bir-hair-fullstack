import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Scroll-triggered reveal wrapper, now powered by Framer Motion.
 * Same public API as before (`as`, `delay`, `className`, children) so every
 * page that already renders <Reveal as="section" ...> keeps working as-is.
 */
export default function Reveal({ children, delay = 0, className = '', as = 'div', ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.14 }}
      variants={variants}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
