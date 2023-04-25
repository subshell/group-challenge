import Navigation from './navigation/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from './user/session';
import { SignIn, SignUp } from './user/SignInAndSignUp';
import { ToastContainer } from 'react-toastify';
import { lazy, Suspense, useState } from 'react';
import { createWebSocket, WebSocketContext } from './api/api-websockets';
import { useThemeClass } from './theme';
import { FC } from 'react';

const Changelog = lazy(() => import('./Changelog'));
const CreateParty = lazy(() => import('./party/create/CreateParty'));
const ViewParty = lazy(() => import('./party/view/ViewParty'));
const EditParty = lazy(() => import('./party/edit/EditParty'));
const OwnSubmissions = lazy(() => import('./party/submissions/OwnSubmissions'));
const EditProfile = lazy(() => import('./user/EditProfile'));
const Home = lazy(() => import('./home/Home'));
const Collage = lazy(() => import('./collage/Collage'));

const WithUser: FC = () => {
  return (
    <Suspense fallback={<span></span>}>
      <Routes>
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/party">
          <Route path="create" element={<CreateParty />} />
          <Route path="view/:id" element={<ViewParty />} />
          <Route path="edit/:id" element={<EditParty />} />
          <Route path="my-submissions/:id" element={<OwnSubmissions />} />
        </Route>
        <Route path="/collage" element={<Collage />} />
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </Suspense>
  );
};

const WithoutUser: FC = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/*" element={<SignIn />} />
    </Routes>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [session] = useSession();
  const [webSocket] = useState(createWebSocket);
  const themeClass = useThemeClass();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <WebSocketContext.Provider value={{ webSocket }}>
          <div className={themeClass}>
            <div className="print:bg-white bg-slate-100 dark:bg-slate-800 dark:text-white min-h-screen">
              <Navigation />
              <ToastContainer position="bottom-right" className="text-black" />
              <div className="container mx-auto px-4">{session ? <WithUser /> : <WithoutUser />}</div>
            </div>
          </div>
        </WebSocketContext.Provider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
