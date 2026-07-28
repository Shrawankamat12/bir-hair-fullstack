import { useStore } from '../context/StoreContext';
import './Toast.css';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  const type = typeof toast === 'string' ? 'success' : toast.type || 'success';
  const message = typeof toast === 'string' ? toast : toast.message;
  return (
    <div className={`toast glass toast-${type}`}>
      <span className="toast-dot" />
      {message}
    </div>
  );
}
