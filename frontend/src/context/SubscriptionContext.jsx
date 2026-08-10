import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../services/api';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [plan, setPlan] = useState('free');
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  const updateState = useCallback((data) => {
    setPlan(data.plan || 'free');
    setIsPremium(data.is_premium || false);
    setExpiresAt(data.expires_at || null);
    setFeatures(data.features || {});
  }, []);

  // Fetch subscription status when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setPlan('free');
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const res = await subscriptionAPI.get();
        updateState(res.data);
      } catch {
        // Default to free if fetch fails
        setPlan('free');
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, updateState]);

  const activate = useCallback(async () => {
    const res = await subscriptionAPI.activate();
    updateState(res.data);
    // Update user in AuthContext so subscription_plan is reflected
    if (updateUser) {
      updateUser({ subscription_plan: 'pro' });
    }
    return res.data;
  }, [updateState, updateUser]);

  const cancel = useCallback(async () => {
    const res = await subscriptionAPI.cancel();
    updateState(res.data);
    if (updateUser) {
      updateUser({ subscription_plan: 'free' });
    }
    return res.data;
  }, [updateState, updateUser]);

  const refresh = useCallback(async () => {
    try {
      const res = await subscriptionAPI.get();
      updateState(res.data);
    } catch {
      // silent fail
    }
  }, [updateState]);

  const value = {
    plan,
    isPremium,
    expiresAt,
    features,
    loading,
    activate,
    cancel,
    refresh,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}

export default SubscriptionContext;
