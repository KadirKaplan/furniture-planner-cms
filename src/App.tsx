import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { CategoryFormPage } from '@/pages/categories/CategoryFormPage';
import { MaterialsPage } from '@/pages/materials/MaterialsPage';
import { MaterialFormPage } from '@/pages/materials/MaterialFormPage';
import { ModulesPage } from '@/pages/modules/ModulesPage';
import { ModuleFormPage } from '@/pages/modules/ModuleFormPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { ProductFormPage } from '@/pages/products/ProductFormPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { UserFormPage } from '@/pages/users/UserFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>

      <Route path="/categories">
        <ProtectedRoute component={CategoriesPage} />
      </Route>
      <Route path="/categories/new">
        <ProtectedRoute component={CategoryFormPage} />
      </Route>
      <Route path="/categories/:id/edit">
        <ProtectedRoute component={CategoryFormPage} />
      </Route>

      <Route path="/materials">
        <ProtectedRoute component={MaterialsPage} />
      </Route>
      <Route path="/materials/new">
        <ProtectedRoute component={MaterialFormPage} />
      </Route>
      <Route path="/materials/:id/edit">
        <ProtectedRoute component={MaterialFormPage} />
      </Route>

      <Route path="/modules">
        <ProtectedRoute component={ModulesPage} />
      </Route>
      <Route path="/modules/new">
        <ProtectedRoute component={ModuleFormPage} />
      </Route>
      <Route path="/modules/:id/edit">
        <ProtectedRoute component={ModuleFormPage} />
      </Route>

      <Route path="/products">
        <ProtectedRoute component={ProductsPage} />
      </Route>
      <Route path="/products/new">
        <ProtectedRoute component={ProductFormPage} />
      </Route>
      <Route path="/products/:id/edit">
        <ProtectedRoute component={ProductFormPage} />
      </Route>

      <Route path="/users">
        <ProtectedRoute component={UsersPage} />
      </Route>
      <Route path="/users/new">
        <ProtectedRoute component={UserFormPage} />
      </Route>
      <Route path="/users/:id/edit">
        <ProtectedRoute component={UserFormPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
