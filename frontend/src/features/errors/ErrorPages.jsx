import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-8xl font-bold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </motion.div>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-8xl font-bold gradient-text mb-4">401</p>
        <h1 className="text-2xl font-bold text-white mb-2">Unauthorized</h1>
        <p className="text-gray-400 mb-8">You need to log in to access this page.</p>
        <Link to="/login"><Button>Log In</Button></Link>
      </motion.div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-8xl font-bold gradient-text mb-4">403</p>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-8">You don&apos;t have permission to access this resource.</p>
        <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
      </motion.div>
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-8xl font-bold gradient-text mb-4">500</p>
        <h1 className="text-2xl font-bold text-white mb-2">Server Error</h1>
        <p className="text-gray-400 mb-8">Something went wrong on our end. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </motion.div>
    </div>
  );
}
