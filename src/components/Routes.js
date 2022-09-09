import '../App.scss';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { VideoCompressorPage } from './index';

const Routes = () => (
  <div>
    <Router>
      <Switch>

        <Route exact path="/" component={VideoCompressorPage} />

      </Switch>
    </Router>
  </div>
);

export default Routes;
