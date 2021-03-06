import './App.css';
import Navigation from './navigation/Navigation';

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import EditParty from './party/edit/EditParty';
import ViewParty from './party/view/ViewParty';
import PostPartyItem from './party/post/PostPartyItem';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSession } from './user/session';
import { SignIn, SignUp } from './user/SignInAndSignUp';
import Home from './home/Home';

function WithUser() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/event/view/:id">
        <ViewParty />
      </Route>
      <Route path="/event/post/:id">
        <PostPartyItem />
      </Route>
      <Route path="/event/edit/:id">
        <EditParty />
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
    </Switch>
  );
}

const queryClient = new QueryClient();

function App() {
  const [session] = useSession();

  return (
    <div className="App">
      <Router>
        <QueryClientProvider client={queryClient}>
          <Navigation />
          <div className="container mx-auto">{session ? <WithUser /> : <WithoutUser />}</div>
        </QueryClientProvider>
      </Router>
    </div>
  );
}

export default App;
