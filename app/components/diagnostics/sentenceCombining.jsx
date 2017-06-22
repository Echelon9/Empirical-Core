import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Question from '../../libs/diagnosticQuestion';
import Textarea from 'react-textarea-autosize';
import icon from '../../img/question_icon.svg';
import _ from 'underscore';
import { hashToCollection } from '../../libs/hashToCollection';
import { submitResponse, clearResponses } from '../../actions/diagnostics.js';
import ReactTransition from 'react-addons-css-transition-group';
import questionActions from '../../actions/questions';
import pathwayActions from '../../actions/pathways';
const C = require('../../constants').default;
import rootRef from '../../libs/firebase';
const sessionsRef = rootRef.child('sessions');
import ResponseComponent from '../questions/responseComponent.jsx';
import {
  loadResponseDataAndListen,
  stopListeningToResponses,
  getResponsesWithCallback,
  getGradedResponsesWithCallback
} from '../../actions/responses.js';

import RenderQuestionFeedback from '../renderForQuestions/feedbackStatements.jsx';
import RenderQuestionCues from '../renderForQuestions/cues.jsx';
import RenderSentenceFragments from '../renderForQuestions/sentenceFragments.jsx';
import RenderFeedback from '../renderForQuestions/feedback.jsx';
import generateFeedbackString from '../renderForQuestions/generateFeedbackString.js';
import getResponse from '../renderForQuestions/checkAnswer.js';
import handleFocus from '../renderForQuestions/handleFocus.js';
import submitQuestionResponse from '../renderForQuestions/submitResponse.js';
import updateResponseResource from '../renderForQuestions/updateResponseResource.js';
import submitPathway from '../renderForQuestions/submitPathway.js';

import StateFinished from '../renderForQuestions/renderThankYou.jsx';
import AnswerForm from '../renderForQuestions/renderFormForAnswer.jsx';
import TextEditor from '../renderForQuestions/renderTextEditor.jsx';
import Error from '../shared/error.jsx';

const feedbackStrings = C.FEEDBACK_STRINGS;

const PlayDiagnosticQuestion = React.createClass({
  getInitialState() {
    return {
      editing: false,
      response: '',
      readyForNext: false,
    };
  },

  componentDidMount() {
    getGradedResponsesWithCallback(
      this.props.question.key,
      (data) => {
        this.setState({ responses: data, });
      }
    );
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.question !== nextProps.question) {
      return true;
    } else if (this.state.response !== nextState.response) {
      return true;
    } else if (this.state.responses !== nextState.responses) {
      return true;
    } else if (this.state.error !== nextState.error) {
      return true;
    }
    return false;
  },

  getInitialValue() {
    if (this.props.prefill) {
      return this.getQuestion().prefilledText;
    }
  },

  getResponses() {
    return this.state.responses;
    // return this.props.responses.data[this.props.question.key];
  },

  removePrefilledUnderscores() {
    this.setState({ response: this.state.response.replace(/_/g, ''), });
  },

  getQuestion() {
    return this.props.question;
  },

  getResponse2(rid) {
    return this.props.responses[rid];
  },

  submitResponse(response) {
    submitQuestionResponse(response, this.props, this.state.sessionKey, submitResponse);
  },

  renderSentenceFragments() {
    return <RenderSentenceFragments prompt={this.getQuestion().prompt} />;
  },

  listCuesAsString(cues) {
    const newCues = cues.slice(0);
    return `${newCues.splice(0, newCues.length - 1).join(', ')} or ${newCues.pop()}.`;
  },

  renderFeedback() {
    return (<RenderFeedback
      question={this.props.question} renderFeedbackStatements={this.renderFeedbackStatements}
      sentence="We have not seen this sentence before. Could you please try writing it in another way?"
      getQuestion={this.getQuestion} listCuesAsString={this.listCuesAsString}
    />);
  },

  getErrorsForAttempt(attempt) {
    return _.pick(attempt, ...C.ERROR_TYPES);
  },

  renderFeedbackStatements(attempt) {
    return <RenderQuestionFeedback attempt={attempt} getErrorsForAttempt={this.getErrorsForAttempt} getQuestion={this.getQuestion} />;
  },

  renderCues() {
    return <RenderQuestionCues getQuestion={this.getQuestion} />;
  },

  updateResponseResource(response) {
    updateResponseResource(response, this.getQuestion().key, this.getQuestion().attempts, this.props.dispatch);
  },

  submitPathway(response) {
    submitPathway(response, this.props);
  },

  checkAnswer(e) {
    if (this.state.editing) {
      this.removePrefilledUnderscores();
      const response = getResponse(this.getQuestion(), this.state.response, this.getResponses(), this.props.marking);
      this.updateResponseResource(response);
      if (response.found && response.response.author === 'Missing Details Hint') {
        this.setState({
          editing: false,
          error: 'Your answer is too short. Please read the directions carefully and try again.',
        });
      } else {
        this.submitResponse(response);
        this.setState({
          editing: false,
          response: '',
          error: undefined,
        },
          this.nextQuestion()
        );
      }
    }
  },

  toggleDisabled() {
    if (this.state.editing) {
      return '';
    }
    return 'is-disabled';
  },

  handleChange(e) {
    this.setState({ editing: true, response: e, });
  },

  readyForNext() {
    if (this.props.question.attempts.length > 0) {
      const latestAttempt = getLatestAttempt(this.props.question.attempts);
      if (latestAttempt.found) {
        const errors = _.keys(this.getErrorsForAttempt(latestAttempt));
        if (latestAttempt.response.optimal && errors.length === 0) {
          return true;
        }
      }
    }
    return false;
  },

  getProgressPercent() {
    return this.props.question.attempts.length / 3 * 100;
  },

  finish() {
    this.setState({ finished: true, });
  },

  nextQuestion() {
    this.props.nextQuestion();
  },

  renderNextQuestionButton(correct) {
    if (correct) {
      return (<button className="button is-outlined is-success" onClick={this.nextQuestion}>Next</button>);
    } else {
      return (<button className="button is-outlined is-warning" onClick={this.nextQuestion}>Next</button>);
    }
  },

  render() {
    const questionID = this.props.question.key;
    const button = this.state.responses ? <button className="button student-submit" onClick={this.checkAnswer}>Submit</button> : <button className="button student-submit is-disabled" onClick={() => {}}>Submit</button>;
    if (this.props.question) {
      const instructions = (this.props.question.instructions && this.props.question.instructions !== '') ? this.props.question.instructions : 'Combine the sentences into one sentence.';
      return (
        <div className="student-container-inner-diagnostic">
          {this.renderSentenceFragments()}
          {this.renderCues()}
          <div className="feedback-row">
            <img src={icon} />
            <p>{instructions}</p>
          </div>
          <ReactTransition transitionName={'text-editor'} transitionAppear transitionLeaveTimeout={500} transitionAppearTimeout={500} transitionEnterTimeout={500}>
            <TextEditor
              className={'textarea is-question is-disabled'} defaultValue={this.getInitialValue()}
              handleChange={this.handleChange} value={this.state.response} getResponse={this.getResponse2}
              disabled={this.readyForNext()} checkAnswer={this.checkAnswer}
              hasError={this.state.error}
            />
            <div className="button-and-error-row">
              <Error text={this.state.error} />
              <div className="question-button-group button-group">
                {button}
              </div>
            </div>
          </ReactTransition>
        </div>
      );
    } else {
      return (<p>Loading...</p>);
    }
  },
});

const getLatestAttempt = function (attempts = []) {
  const lastIndex = attempts.length - 1;
  return attempts[lastIndex];
};

export default PlayDiagnosticQuestion;
