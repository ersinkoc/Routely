import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMemoryHistory, createBrowserHistory, createHashHistory } from '../src/history';

describe('createBrowserHistory', () => {
  let originalWindow: typeof window;

  const createMockWindow = () => ({
    location: {
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      href: 'http://localhost/',
    },
    history: {
      length: 1,
      state: null,
      pushState: vi.fn(),
      replaceState: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  beforeEach(() => {
    originalWindow = global.window;
    // @ts-ignore - mocking window
    global.window = createMockWindow();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should create browser history', () => {
    const history = createBrowserHistory();

    expect(history.location.pathname).toBe('/');
    expect(history.location.search).toBe('');
    expect(history.location.hash).toBe('');
    expect(history.location.state).toBeNull();
  });

  it('should push new entry', () => {
    const history = createBrowserHistory();

    history.push('/users');

    // @ts-ignore
    expect(window.history.pushState).toHaveBeenCalledWith(undefined, '', '/users');
  });

  it('should push with state', () => {
    const history = createBrowserHistory();
    const state = { foo: 'bar' };

    history.push('/users', state);

    // @ts-ignore
    expect(window.history.pushState).toHaveBeenCalledWith(state, '', '/users');
  });

  it('should replace current entry', () => {
    const history = createBrowserHistory();

    history.replace('/users');

    // @ts-ignore
    expect(window.history.replaceState).toHaveBeenCalledWith(undefined, '', '/users');
  });

  it('should replace with state', () => {
    const history = createBrowserHistory();
    const state = { foo: 'bar' };

    history.replace('/users', state);

    // @ts-ignore
    expect(window.history.replaceState).toHaveBeenCalledWith(state, '', '/users');
  });

  it('should navigate back', () => {
    const history = createBrowserHistory();

    history.back();

    // @ts-ignore
    expect(window.history.go).toHaveBeenCalledWith(-1);
  });

  it('should navigate forward', () => {
    const history = createBrowserHistory();

    history.forward();

    // @ts-ignore
    expect(window.history.go).toHaveBeenCalledWith(1);
  });

  it('should navigate with delta', () => {
    const history = createBrowserHistory();

    history.go(-2);

    // @ts-ignore
    expect(window.history.go).toHaveBeenCalledWith(-2);
  });

  it('should register popstate event listener on first listen', () => {
    const history = createBrowserHistory();
    const listener = vi.fn();

    // Event listener is added lazily when first listener is registered
    history.listen(listener);

    // @ts-ignore
    expect(window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('should listen to location changes', () => {
    const history = createBrowserHistory();
    const listener = vi.fn();

    const unsubscribe = history.listen(listener);

    expect(typeof unsubscribe).toBe('function');
  });
});

describe('createHashHistory', () => {
  let originalWindow: typeof window;

  const createMockWindow = () => ({
    location: {
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      href: 'http://localhost/',
    },
    history: {
      length: 1,
      state: null,
      pushState: vi.fn(),
      replaceState: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  beforeEach(() => {
    originalWindow = global.window;
    // @ts-ignore - mocking window
    global.window = createMockWindow();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should create hash history', () => {
    const history = createHashHistory();

    expect(history.location.pathname).toBe('/');
    expect(history.location.search).toBe('');
    expect(history.location.hash).toBe('');
    expect(history.location.state).toBeNull();
  });

  it('should create hash history with initial hash', () => {
    // @ts-ignore
    window.location.hash = '#/users';
    const history = createHashHistory();

    expect(history.location.pathname).toBe('/users');
  });

  it('should push new entry', () => {
    const history = createHashHistory();

    history.push('/users');

    // @ts-ignore
    expect(window.location.hash).toBe('/users');
  });

  it('should replace current entry', () => {
    const history = createHashHistory();

    history.replace('/users');

    // @ts-ignore
    expect(window.location.replace).toHaveBeenCalledWith('http://localhost/#/users');
  });

  it('should navigate back', () => {
    const history = createHashHistory();

    history.back();

    // @ts-ignore
    expect(window.history.go).toHaveBeenCalledWith(-1);
  });

  it('should navigate forward', () => {
    const history = createHashHistory();

    history.forward();

    // @ts-ignore
    expect(window.history.go).toHaveBeenCalledWith(1);
  });

  it('should navigate with delta', () => {
    const history = createHashHistory();

    history.go(-2);

    // @ts-ignore
    expect(window.history.go).toHaveBeenCalledWith(-2);
  });

  it('should handle hash with search and hash', () => {
    // @ts-ignore
    window.location.hash = '#/users?page=1#section';
    const history = createHashHistory();

    expect(history.location.pathname).toBe('/users');
    expect(history.location.search).toBe('?page=1');
    expect(history.location.hash).toBe('#section');
  });

  it('should register hashchange event listener on first listen', () => {
    const history = createHashHistory();
    const listener = vi.fn();

    // Event listener is added lazily when first listener is registered
    history.listen(listener);

    // @ts-ignore
    expect(window.addEventListener).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  it('should handle replace with existing hash in URL', () => {
    // @ts-ignore
    window.location.href = 'http://localhost/#/old';
    const history = createHashHistory();

    history.replace('/new');

    // @ts-ignore
    expect(window.location.replace).toHaveBeenCalledWith('http://localhost/#/new');
  });

  it('should handle replace without existing hash in URL', () => {
    // @ts-ignore
    window.location.href = 'http://localhost/';
    // @ts-ignore
    window.location.hash = '';
    const history = createHashHistory();

    history.replace('/new');

    // @ts-ignore
    expect(window.location.replace).toHaveBeenCalledWith('http://localhost/#/new');
  });

  it('should listen to location changes', () => {
    const history = createHashHistory();
    const listener = vi.fn();

    const unsubscribe = history.listen(listener);

    expect(typeof unsubscribe).toBe('function');
  });
});

describe('createMemoryHistory', () => {
  it('should create memory history with default initial entry', () => {
    const history = createMemoryHistory();

    expect(history.location.pathname).toBe('/');
    expect(history.location.search).toBe('');
    expect(history.location.hash).toBe('');
  });

  it('should create memory history with custom initial entries', () => {
    const history = createMemoryHistory({
      initialEntries: ['/users', '/posts'],
      initialIndex: 1,
    });

    expect(history.location.pathname).toBe('/posts');
  });

  it('should push new entry', () => {
    const history = createMemoryHistory();

    history.push('/users');

    expect(history.location.pathname).toBe('/users');
  });

  it('should replace current entry', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.replace('/users');

    expect(history.location.pathname).toBe('/users');
  });

  it('should navigate back', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.push('/users');
    history.push('/posts');

    expect(history.location.pathname).toBe('/posts');

    history.back();

    expect(history.location.pathname).toBe('/users');
  });

  it('should navigate forward', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.push('/users');
    history.push('/posts');
    history.back();

    expect(history.location.pathname).toBe('/users');

    history.forward();

    expect(history.location.pathname).toBe('/posts');
  });

  it('should navigate with delta', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.push('/users');
    history.push('/posts');
    history.push('/comments');

    expect(history.location.pathname).toBe('/comments');

    history.go(-2);

    expect(history.location.pathname).toBe('/users');

    history.go(1);

    expect(history.location.pathname).toBe('/posts');
  });

  it('should not navigate beyond bounds', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.go(-10); // Try to go back beyond beginning

    expect(history.location.pathname).toBe('/');

    history.go(10); // Try to go forward beyond end

    expect(history.location.pathname).toBe('/');
  });

  it('should handle empty entries array', () => {
    const history = createMemoryHistory({ initialEntries: [] });

    expect(history.location.pathname).toBe('/');
  });

  it('should notify listeners on push', () => {
    const history = createMemoryHistory();
    const listener = vi.fn();

    history.listen(listener);
    history.push('/users');

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/users',
      })
    );
  });

  it('should notify listeners on replace', () => {
    const history = createMemoryHistory();
    const listener = vi.fn();

    history.listen(listener);
    history.replace('/users');

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/users',
      })
    );
  });

  it('should notify listeners on go', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    history.push('/users');

    const listener = vi.fn();
    history.listen(listener);

    history.go(-1);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/',
      })
    );
  });

  it('should unsubscribe listener', () => {
    const history = createMemoryHistory();
    const listener = vi.fn();

    const unsubscribe = history.listen(listener);
    unsubscribe();

    history.push('/users');

    expect(listener).not.toHaveBeenCalled();
  });

  it('should parse URL components', () => {
    const history = createMemoryHistory();

    history.push('/users?page=1#section');

    expect(history.location.pathname).toBe('/users');
    expect(history.location.search).toBe('?page=1');
    expect(history.location.hash).toBe('#section');
  });

  it('should clear entries after current when pushing', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.push('/users');
    history.push('/posts');
    history.back(); // Now at /users

    expect(history.location.pathname).toBe('/users');

    history.push('/new'); // This should clear /posts

    expect(history.location.pathname).toBe('/new');

    history.forward(); // Should not go to /posts

    expect(history.location.pathname).toBe('/new');
  });

  it('should handle initialIndex correctly', () => {
    const history = createMemoryHistory({
      initialEntries: ['/a', '/b', '/c'],
      initialIndex: 0,
    });

    expect(history.location.pathname).toBe('/a');

    history.forward(); // Goes to /b

    expect(history.location.pathname).toBe('/b');
  });

  it('should handle going back from first entry', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.back();

    expect(history.location.pathname).toBe('/');
  });

  it('should handle going forward from last entry', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    history.forward();

    expect(history.location.pathname).toBe('/');
  });

  it('should have null state always', () => {
    const history = createMemoryHistory();

    expect(history.location.state).toBeNull();

    history.push('/users', { some: 'state' });

    expect(history.location.state).toBeNull();
  });
});
