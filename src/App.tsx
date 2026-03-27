import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './ui/navigation/AppRouter';
import { SidebarProvider } from './ui/context/SidebarContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AppRouter />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;
