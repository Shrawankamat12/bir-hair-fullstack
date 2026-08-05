import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();
  const type = toast ? (typeof toast === 'string' ? 'success' : toast.type || 'success') : null;
  const message = toast ? (typeof toast === 'string' ? toast : toast.message) : null;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={message}
          className={`toast glass toast-${type}`}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
