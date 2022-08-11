import Navigation from './navigation/Navigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EditParty from './party/edit/EditParty';
import ViewParty from './party/view/ViewParty';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from './user/session';
import { SignIn, SignUp } from './user/SignInAndSignUp';
import Home from './home/Home';
import EditProfile from './user/EditProfile';
import CreateParty from './party/create/CreateParty';
import { toast, ToastContainer } from 'react-toastify';
import { RequestError, useParties } from './api/api';
import { useEffect, useState } from 'react';
import OwnSubmissions from './party/submissions/OwnSubmissions';
import { createWebSocket, WebSocketContext } from './api/api-websockets';
import Changelog from './Changelog';

function WithUser() {
  const parties = useParties();
  const [, setSession] = useSession();

  useEffect(() => {
    if (!parties.isLoading && (parties.error as RequestError)?.status === 401) {
      console.error(parties.error);
      toast('Your session has expired', { type: 'error' });
      setSession(undefined);
    }
  }, [parties.error, parties.isLoading, setSession]);

  return (
    <Routes>
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/party">
        <Route path="create" element={<CreateParty />} />
        <Route path="view/:id" element={<ViewParty />} />
        <Route path="edit/:id" element={<EditParty />} />
        <Route path="my-submissions/:id" element={<OwnSubmissions />} />
      </Route>
      <Route path="/profile" element={<EditProfile />} />
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

function WithoutUser() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  const [session] = useSession();
  const [webSocket] = useState(createWebSocket);

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <WebSocketContext.Provider value={{ webSocket }}>
          <Navigation />
          <ToastContainer position="bottom-right" />
          <div className="container mx-auto px-4">{session ? <WithUser /> : <WithoutUser />}</div>
        </WebSocketContext.Provider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
