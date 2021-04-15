import Navigation from './navigation/Navigation';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import EditParty from './party/edit/EditParty';
import ViewParty from './party/view/ViewParty';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSession } from './user/session';
import { SignIn, SignUp } from './user/SignInAndSignUp';
import Home from './home/Home';
import EditProfile from './user/EditProfile';
import CreateParty from './party/create/CreateParty';
import { toast, ToastContainer } from 'react-toastify';
import { RequestError, useParties } from './api';
import { useEffect } from 'react';
import PostPartySubmission from './party/submissions/PostPartySubmission';
import OwnSubmissions from './party/own-submissions/OwnSubmissions';

function WithUser() {
  const parties = useParties();
  const [, , removeSession] = useSession();

  useEffect(() => {
    if (!parties.isLoading && (parties.error as RequestError)?.status === 401) {
      console.error(parties.error);
      toast('Your session has expired', { type: 'error' });
      removeSession();
    }
  }, [parties.error, parties.isLoading, removeSession]);

  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/party/create">
        <CreateParty />
      </Route>
      <Route path="/party/view/:id">
        <ViewParty />
      </Route>
      <Route path="/party/post/:id">
        <PostPartySubmission />
      </Route>
      <Route path="/party/edit/:id">
        <EditParty />
      </Route>
      <Route path="/party/my-submissions/:id">
        <OwnSubmissions />
      </Route>
      <Route path="/profile">
        <EditProfile />
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function WithoutUser() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/signin">
        <SignIn />
      </Route>
      <Route path="/signup">
        <SignUp />
      </Route>
      <Route path="/">
        <Redirect to="/" />
      </Route>
    </Switch>
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

  return (
    <div className="App mb-16">
      <Router>
        <QueryClientProvider client={queryClient}>
          <Navigation />
          <ToastContainer position="bottom-right" />
          <div className="container mx-auto">{session ? <WithUser /> : <WithoutUser />}</div>
        </QueryClientProvider>
      </Router>
    </div>
  );
}

export default App;
