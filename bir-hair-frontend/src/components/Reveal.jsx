import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};


const customMotionCache = new Map();

function getMotionComponent(as) {
  if (typeof as === 'string') {
    
    return motion[as] || motion.div;
  }

 
  if (customMotionCache.has(as)) return customMotionCache.get(as);
  const Wrapped = motion.create ? motion.create(as) : motion(as);
  customMotionCache.set(as, Wrapped);
  return Wrapped;
}


export default function Reveal({ children, delay = 0, className = '', as = 'div', ...rest }) {
  const MotionTag = getMotionComponent(as);
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