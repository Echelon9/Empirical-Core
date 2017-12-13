import BackOff from './utils/backOff';
import React from 'react';
import { render } from 'react-dom';
import createStore from './utils/configureStore';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import App from './app.jsx';
import AdminRoot from './components/root';
import StudentRoot from './components/studentRoot';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import conceptActions from './actions/concepts';
import conceptsFeedbackActions from './actions/concepts-feedback';
import questionActions from './actions/questions';
import fillInBlankActions from './actions/fillInBlank';
import sentenceFragmentActions from './actions/sentenceFragments';
import lessonActions from './actions/lessons';
import levelActions from './actions/item-levels';
import Passthrough from './components/shared/passthrough.jsx';
import { AppContainer } from 'react-hot-loader';
// import createBrowserHistory from 'history/lib/createBrowserHistory';
// const history = createBrowserHistory()
// import createHashHistory from 'history/lib/createHashHistory';

BackOff();
// const hashhistory = createHashHistory({ queryKey: false, });
const store = createStore();

// create an enhanced history that syncs navigation events with the store
// const history = syncHistoryWithStore(hashhistory, store);

const root = document.getElementById('root');

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

render((
  <AppContainer>
    <Provider store={store} >
      <App />
    </Provider>
  </AppContainer>),
  root
);

// Hot Module Replacement API
if (module.hot) {
  console.log('hot');
  module.hot.accept('./app.jsx', () => {
    console.log('hot');
    const NextApp = require('./app.jsx').default;
    render(
      <AppContainer>
        <Provider store={store} >
          <NextApp />
        </Provider>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

setTimeout(() => {
  store.dispatch(conceptActions.startListeningToConcepts());
  store.dispatch(conceptsFeedbackActions.loadConceptsFeedback());
  store.dispatch(questionActions.loadQuestions());
  store.dispatch(fillInBlankActions.loadQuestions());
  store.dispatch(sentenceFragmentActions.loadSentenceFragments());
  // store.dispatch( pathwayActions.loadPathways() );
  store.dispatch(lessonActions.loadLessons());
  store.dispatch(levelActions.loadItemLevels());
});
