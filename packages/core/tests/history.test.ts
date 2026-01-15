import { describe, it, expect, vi } from 'vitest';
import { createMemoryHistory } from '../src/history';

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
});
