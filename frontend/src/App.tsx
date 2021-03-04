import './App.css';
import Navigation from './navigation/Navigation';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import EditParty from './party/edit/EditParty';
import PartiesOverview from './party/PartyList';
import ViewParty from './party/view/ViewParty';
import PostPartyItem from './party/post/PostPartyItem';
import StartScreen from './start/StartScreen';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSession } from './api';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { useEvent } from 'react-use';

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
  const [session] = useSession();

  return (
    <div className="App">
      <Router>
        <QueryClientProvider client={queryClient}>
          <Navigation />
          <div className="container mx-auto">{session ? <WithUser /> : <StartScreen />}</div>
        </QueryClientProvider>
      </Router>
    </div>
  );
}

export default App;
