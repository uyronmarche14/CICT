type NavigateFn = (url: string) => void;

let navigateFn: NavigateFn | null = null;

export const registerNavigate = (fn: NavigateFn) => {
  navigateFn = fn;
};

export const unregisterNavigate = () => {
  navigateFn = null;
};

export const safePush = (url: string) => {
  if (navigateFn) {
    navigateFn(url);
  } else {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }
};
