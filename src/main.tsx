import { createRoot } from 'react-dom/client';
import './index.css';
import 'swiper/swiper-bundle.css';
import 'flatpickr/dist/flatpickr.css';
import App from './App.tsx';
import { AppWrapper } from './components/common/PageMeta.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Provider } from 'react-redux'
import store from './store'

// بدون StrictMode درخواست‌های API و effectها در حالت توسعه فقط یک بار اجرا می‌شوند.
// (در React 18 با StrictMode، effectها عمداً دو بار اجرا می‌شوند و باعث دوبار زدن درخواست می‌شد.)
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </ThemeProvider>
  </Provider>

);
