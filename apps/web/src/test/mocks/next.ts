import { vi } from 'vitest';

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
const back = vi.fn();
const forward = vi.fn();
const prefetch = vi.fn();

export const mockRouter = {
  push,
  replace,
  refresh,
  back,
  forward,
  prefetch,
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
