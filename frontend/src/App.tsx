import './App.css';
import Navigation from './navigation/Navigation';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import EditParty from './party/edit/EditParty';
import PartiesOverview from './party/PartyList';
import ViewParty from './party/view/ViewParty';
import PostPartyItem from './party/post/PostPartyItem';
import { useCallback, useState } from 'react';
import { appContext as initialAppContext, AppContext, IAppContext } from './appContext';
import StartScreen from './start/StartScreen';
import { QueryClient, QueryClientProvider } from 'react-query';

function WithUser() {
  return (
    <Switch>
      <Route exact path="/">
        <PartiesOverview />
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
    </Switch>
  );
}

const queryClient = new QueryClient();

function App() {
  const [appContext, setAppContext] = useState(initialAppContext);
  const setContextCb = useCallback((context) => setAppContext(context as IAppContext), []);

  return (
    <div className="App">
      <Router>
        <QueryClientProvider client={queryClient}>
          <AppContext.Provider value={[appContext, setContextCb]}>
            <Navigation />
            <div className="container mx-auto">{appContext.user ? <WithUser /> : <StartScreen />}</div>
          </AppContext.Provider>
        </QueryClientProvider>
      </Router>
    </div>
  );
}

export default App;
