export function useDebounce<T>(value: () => T, delay: number): { get current(): T } {
  let debouncedValue = $state(value());
  let timeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    const currentValue = value();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue = currentValue;
    }, delay);

    return () => clearTimeout(timeout);
  });

  return {
    get current() {
      return debouncedValue;
    }
  };
}
