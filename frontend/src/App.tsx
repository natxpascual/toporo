import React, { useState, useEffect, useCallback } from 'react';
import { BrandSite } from './components/brandsite/BrandSite';
import { SignupPage } from './components/auth/SignupPage';
import { LoginPage } from './components/auth/LoginPage';
import { TopologyStudio } from './components/studio/TopologyStudio';
import { AdminPortal } from './components/admin/AdminPortal';
import { TermsPage } from './components/legal/TermsPage';
import { PrivacyPage } from './components/legal/PrivacyPage';
import { CookiePolicyPage } from './components/legal/CookiePolicyPage';
import { AccessibilityPage } from './components/legal/AccessibilityPage';
import { useAuthStore } from './store/useAuthStore';

export type AppRoute =
  | '/'
  | '/signup'
  | '/login'
  | '/studio'
  | '/manage'
  | '/terms'
  | '/privacy'
  | '/cookies'
  | '/accessibility';

export function normalizeRoute(raw: string): AppRoute {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed === '/' || trimmed === '#') return '/';

  // Strip protocol and host if present
  const clean = trimmed.toLowerCase().replace(/^[a-z]+:\/\/[^/]+/i, '');

  // Split into path and hash, ignoring query strings on route match
  const [pathWithQuery, hashWithQuery] = clean.split('#');
  const pathPart = (pathWithQuery || '').split('?')[0];
  const hashPart = (hashWithQuery || '').split('?')[0];

  // Check pathname first
  const pathClean = (pathPart || '').replace(/^\/+/, '').split('/')[0];
  if (pathClean === 'signup') return '/signup';
  if (pathClean === 'login') return '/login';
  if (pathClean === 'studio') return '/studio';
  if (pathClean === 'manage') return '/manage';
  if (pathClean === 'terms') return '/terms';
  if (pathClean === 'privacy') return '/privacy';
  if (pathClean === 'cookies') return '/cookies';
  if (pathClean === 'accessibility') return '/accessibility';

  // If path is root or empty, check hash for standalone page route vs in-page anchor
  if (hashPart) {
    const hashClean = hashPart.replace(/^\/+/, '').split('/')[0];
    if (hashClean === 'signup') return '/signup';
    if (hashClean === 'login') return '/login';
    if (hashClean === 'studio') return '/studio';
    if (hashClean === 'manage') return '/manage';
    if (hashClean === 'terms') return '/terms';
    if (hashClean === 'privacy') return '/privacy';
    if (hashClean === 'cookies') return '/cookies';
    if (hashClean === 'accessibility') return '/accessibility';
    // All in-page anchors (e.g. 'visual-studio', 'code-inspector', 'ai-copilot', etc.) belong to homepage ('/')
    return '/';
  }

  return '/';
}

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return '/';
  const fromHash = window.location.hash ? normalizeRoute(window.location.hash) : null;
  if (fromHash && fromHash !== '/') return fromHash;
  return normalizeRoute(window.location.pathname);
}

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [postLoginRoute, setPostLoginRoute] = useState<string>('/studio');

  const {
    user,
    token,
    isElevatedAdminSession,
    isAuthReady,
    initializeSession,
    applyOAuthToken,
  } = useAuthStore();

  const isAuthenticated = Boolean(token && user && user.emailVerified && user.status === 'active');

  const navigate = useCallback(
    (targetRoute: string) => {
      // If target is an in-page anchor on the homepage (starts with '#')
      if (targetRoute.startsWith('#')) {
        const anchorId = targetRoute.replace(/^#/, '');
        if (currentRoute !== '/') {
          setCurrentRoute('/');
          window.history.pushState({}, '', `/#${anchorId}`);
          setTimeout(() => {
            document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          window.history.pushState({}, '', `/#${anchorId}`);
          document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      const next = normalizeRoute(targetRoute);
      const hasQuery = targetRoute.includes('?');
      const urlToPush = hasQuery ? targetRoute : next === '/' ? '/' : next;

      setCurrentRoute(next);

      try {
        if (window.history && window.history.pushState) {
          window.history.pushState({}, '', urlToPush);
        }
        if (!hasQuery) {
          window.location.hash = next === '/' ? '' : next;
        }
      } catch {
        window.location.hash = next;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentRoute]
  );

  // Initialize session & handle OAuth callback hash on mount
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#oauth-callback')) {
      const queryPart = hash.split('?')[1] || '';
      const params = new URLSearchParams(queryPart);
      const oauthToken = params.get('token');
      const elevated = params.get('elevated') === '1';
      if (oauthToken) {
        applyOAuthToken(oauthToken, elevated).then((authedUser) => {
          if (authedUser) {
            navigate(elevated && authedUser.role === 'admin' ? '/manage' : '/studio');
          } else {
            navigate('/login');
          }
        });
        return;
      }
    }
    initializeSession();
  }, [applyOAuthToken, initializeSession, navigate]);

  // Enforce strict route guards for /studio and /manage once auth hydration completes
  useEffect(() => {
    if (!isAuthReady) return;

    if (currentRoute === '/studio' && !isAuthenticated) {
      setPostLoginRoute('/studio');
      navigate('/login');
      return;
    }

    if (currentRoute === '/manage') {
      const canAccessManage = isAuthenticated && user?.role === 'admin' && isElevatedAdminSession;
      if (!canAccessManage) {
        // Redirect strictly to plain /login without exposing ?session=elevate
        navigate('/login');
      }
    }
  }, [currentRoute, isAuthReady, isAuthenticated, user, isElevatedAdminSession, navigate]);

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const routeFromHash = normalizeRoute(hash);
        if (routeFromHash !== '/') {
          setCurrentRoute(routeFromHash);
        } else {
          setCurrentRoute('/');
          const targetId = hash.replace(/^#\/?/, '');
          if (targetId && !targetId.startsWith('oauth-callback')) {
            setTimeout(() => {
              document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            }, 80);
          }
        }
      } else {
        setCurrentRoute(normalizeRoute(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    if (window.location.hash) {
      const anchor = window.location.hash.replace(/^#\/?/, '');
      if (
        anchor &&
        !anchor.startsWith('oauth-callback') &&
        !['studio', 'manage', 'login', 'signup', 'terms', 'privacy', 'cookies', 'accessibility'].includes(anchor)
      ) {
        setTimeout(() => {
          document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Expose router to window for automated testing and verification
  useEffect(() => {
    (window as any).__APP_ROUTER__ = {
      currentRoute,
      navigate,
    };
  }, [currentRoute, navigate]);

  // Wait for initial session check before rendering protected routes
  if (!isAuthReady && (currentRoute === '/studio' || currentRoute === '/manage')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121613] text-[#F5F5F4] font-mono text-xs">
        Verifying Toporo session...
      </div>
    );
  }

  switch (currentRoute) {
    case '/signup':
      return <SignupPage onNavigate={navigate} onSuccess={() => navigate('/studio')} />;
    case '/login':
      return (
        <LoginPage
          onNavigate={navigate}
          onSuccess={(opts) => navigate(opts?.elevated ? '/manage' : postLoginRoute || '/studio')}
        />
      );
    case '/studio':
      if (!isAuthenticated) {
        return <LoginPage onNavigate={navigate} onSuccess={() => navigate('/studio')} />;
      }
      return <TopologyStudio onNavigate={navigate} />;
    case '/manage':
      if (!isAuthenticated || user?.role !== 'admin' || !isElevatedAdminSession) {
        return <LoginPage onNavigate={navigate} onSuccess={(opts) => navigate(opts?.elevated ? '/manage' : '/studio')} />;
      }
      return <AdminPortal onNavigate={navigate} />;
    case '/terms':
      return <TermsPage onNavigate={navigate} />;
    case '/privacy':
      return <PrivacyPage onNavigate={navigate} />;
    case '/cookies':
      return <CookiePolicyPage onNavigate={navigate} />;
    case '/accessibility':
      return <AccessibilityPage onNavigate={navigate} />;
    case '/':
    default:
      return <BrandSite onNavigate={navigate} />;
  }
};
