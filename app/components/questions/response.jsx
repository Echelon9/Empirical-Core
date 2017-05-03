import React from 'react';
import _ from 'underscore';
import questionActions from '../../actions/questions';
import diagnosticQuestionActions from '../../actions/diagnosticQuestions';
import sentenceFragmentActions from '../../actions/sentenceFragments';
import ConceptSelector from '../shared/conceptSelector.jsx';
import Modal from '../modal/modal.jsx';
import ResponseList from './responseList.jsx';
import { hashToCollection } from '../../libs/hashToCollection';
import Textarea from 'react-textarea-autosize';
import TextEditor from './textEditor.jsx';
import feedbackActions from '../../actions/concepts-feedback.js';
import getBoilerplateFeedback from './boilerplateFeedback.jsx';
import massEdit from '../../actions/massEdit';
import {
  deleteResponse,
  submitResponseEdit,
  setUpdatedResponse,
  incrementResponseCount,
  removeLinkToParentID,
  submitNewConceptResult,
  deleteConceptResult
} from '../../actions/responses';

const jsDiff = require('diff');
const Markdown = require('react-remarkable');
const C = require('../../constants').default;
const feedbackStrings = C.FEEDBACK_STRINGS;

export default React.createClass({

  getInitialState() {
    let actions;
    if (this.props.mode === 'sentenceFragment') {
      actions = sentenceFragmentActions;
    } else if (this.props.mode === 'diagnosticQuestion') {
      actions = diagnosticQuestionActions;
    } else {
      actions = questionActions;
    }
    return {
      feedback: this.props.response.feedback || '',
      selectedBoilerplate: '',
      selectedBoilerplateCategory: this.props.response.selectedBoilerplateCategory || '',
      selectedConcept: this.props.response.concept || '',
      actions,
      newConceptResult: {
        conceptUID: '',
        correct: true,
      },
    };
  },

  deleteResponse(rid) {
    if (window.confirm('Are you sure?')) {
      this.props.dispatch(deleteResponse(this.props.questionID, rid));
      this.props.dispatch(massEdit.removeResponseFromMassEditArray(responseKey));
    }
  },

  editResponse(rid) {
    this.props.dispatch(this.state.actions.startResponseEdit(this.props.questionID, rid));
  },

  cancelResponseEdit(rid) {
    this.props.dispatch(this.state.actions.cancelResponseEdit(this.props.questionID, rid));
  },

  viewChildResponses(rid) {
    this.props.dispatch(this.state.actions.startChildResponseView(this.props.questionID, rid));
  },

  cancelChildResponseView(rid) {
    this.props.dispatch(this.state.actions.cancelChildResponseView(this.props.questionID, rid));
  },

  viewFromResponses(rid) {
    this.props.dispatch(this.state.actions.startFromResponseView(this.props.questionID, rid));
  },

  cancelFromResponseView(rid) {
    this.props.dispatch(this.state.actions.cancelFromResponseView(this.props.questionID, rid));
  },

  viewToResponses(rid) {
    this.props.dispatch(this.state.actions.startToResponseView(this.props.questionID, rid));
  },

  cancelToResponseView(rid) {
    this.props.dispatch(this.state.actions.cancelToResponseView(this.props.questionID, rid));
  },

  updateResponse(rid) {
    const newResp = {
      weak: false,
      feedback: this.state.feedback,
      optimal: this.refs.newResponseOptimal.checked,
      gradeIndex: `human${this.props.questionID}`,
    };
    this.props.dispatch(submitResponseEdit(rid, newResp));
  },

  updateRematchedResponse(rid, vals) {
    this.props.dispatch(submitResponseEdit(rid, vals));
  },

  getErrorsForAttempt(attempt) {
    return _.pick(attempt, ...C.ERROR_TYPES);
  },

  generateFeedbackString(attempt) {
    const errors = this.getErrorsForAttempt(attempt);
    // add keys for react list elements
    const errorComponents = _.values(_.mapObject(errors, (val, key) => {
      if (val) {
        return `You have made a ${feedbackStrings[key]}.`;
      }
    }));
    return errorComponents[0];
  },

  markAsWeak(rid) {
    const vals = { weak: true, };
    this.props.dispatch(
      submitResponseEdit(rid, vals)
    );
  },

  unmarkAsWeak(rid) {
    const vals = { weak: false, };
    this.props.dispatch(
      submitResponseEdit(rid, vals)
    );
  },

  rematchResponse(rid) {
    const newResponse = this.props.getMatchingResponse(rid);
    // if (!newResponse.found) {
    //   const newValues = {
    //     text: this.props.response.text,
    //     count: this.props.response.count,
    //   };
    //   this.props.dispatch(
    //     setUpdatedResponse(rid, newValues)
    //   );
    //   return;
    // }
    // if (newResponse.response.key === this.props.response.parentID) {
    //
    // } else {
    //   const newErrorResp = {
    //     parentID: newResponse.response.key,
    //     feedback: this.generateFeedbackString(newResponse),
    //   };
    //   this.updateRematchedResponse(rid, newErrorResp);
    // }
  },

  chooseConcept(e) {
    this.setState({ selectedBoilerplate: this.refs.concept.value, });
  },

  incrementResponse(rid) {
    const qid = this.props.questionID;
    this.props.dispatch(incrementResponseCount(qid, rid));
  },

  removeLinkToParentID(rid) {
    this.props.dispatch(submitResponseEdit(rid, { gradeIndex: `human${this.props.response.questionUID}`, }));
    this.props.dispatch(removeLinkToParentID(rid));
  },

  applyDiff(answer, response) {
    answer = answer || '';
    response = response || '';
    const diff = jsDiff.diffWords(response, answer);
    const spans = diff.map((part) => {
      const fontWeight = part.added ? 'bold' : 'normal';
      const fontStyle = part.removed ? 'oblique' : 'normal';
      const divStyle = {
        fontWeight,
        fontStyle,
      };
      return <span style={divStyle}>{part.value}</span>;
    });
    return spans;
  },

  handleFeedbackChange(e) {
    if (e === 'Select specific boilerplate feedback') {
      this.setState({ feedback: '', });
    } else {
      this.setState({ feedback: e, });
    }
  },

  conceptsFeedbackToOptions() {
    return hashToCollection(this.props.conceptsFeedback.data).map(cfs => (
      <option value={cfs.feedbackText}>{cfs.name}</option>
      ));
  },

  selectConceptForResult(e) {
    this.setState({
      newConceptResult: Object.assign({},
        this.state.newConceptResult,
        {
          conceptUID: e.value,
        }
      ),
    });
  },

  markNewConceptResult() {
    this.setState({
      newConceptResult: Object.assign({},
        this.state.newConceptResult,
        {
          correct: !this.state.newConceptResult.correct,
        }
      ),
    });
  },

  saveNewConceptResult() {
    const conceptResults = this.props.response.conceptResults || {};
    const conceptResultUids = Object.keys(conceptResults).map(concept => conceptResults[concept].conceptUID);
    if (conceptResultUids.includes(this.state.newConceptResult.conceptUID)) {
      const conceptKey = _.compact(_.map(conceptResults, (concept, conceptValues) => {
        if (concept.conceptUID == this.state.newConceptResult.conceptUID) {
          return concept;
        } else {
          return null;
        }
      }))[0].key;
      this.props.dispatch(deleteConceptResult(this.props.questionID, this.props.response.key, conceptKey));
    }
    this.props.dispatch(submitNewConceptResult(this.props.questionID, this.props.response.key, this.state.newConceptResult));
  },

  deleteConceptResult(crid) {
    if (confirm('Are you sure?')) {
      this.props.dispatch(deleteConceptResult(this.props.questionID, this.props.response.key, crid));
    }
  },
  chooseBoilerplateCategory(e) {
    this.setState({ selectedBoilerplateCategory: e.target.value, });
  },

  chooseSpecificBoilerplateFeedback(e) {
    this.setState({ selectedBoilerplate: e.target.value, });
  },

  boilerplateCategoriesToOptions() {
    return getBoilerplateFeedback().map(category => (
      <option className="boilerplate-feedback-dropdown-option">{category.description}</option>
      ));
  },

  boilerplateSpecificFeedbackToOptions(selectedCategory) {
    return selectedCategory.children.map(childFeedback => (
      <option className="boilerplate-feedback-dropdown-option">{childFeedback.description}</option>
      ));
  },

  addResponseToMassEditArray(responseKey) {
    this.props.dispatch(massEdit.addResponseToMassEditArray(responseKey));
  },

  removeResponseFromMassEditArray(responseKey) {
    this.props.dispatch(massEdit.removeResponseFromMassEditArray(responseKey));
  },

  clearResponsesFromMassEditArray() {
    this.props.dispatch(massEdit.clearResponsesFromMassEditArray());
  },

  onMassSelectCheckboxToggle(responseKey) {
    if (this.props.massEdit.selectedResponses.includes(responseKey)) {
      this.removeResponseFromMassEditArray(responseKey);
    } else {
      this.addResponseToMassEditArray(responseKey);
    }
  },

  renderBoilerplateCategoryDropdown() {
    const style = { marginRight: '20px', };
    return (
      <span className="select" style={style}>
        <select className="boilerplate-feedback-dropdown" onChange={this.chooseBoilerplateCategory} ref="boilerplate">
          <option className="boilerplate-feedback-dropdown-option">Select boilerplate feedback category</option>
          {this.boilerplateCategoriesToOptions()}
        </select>
      </span>
    );
  },

  renderBoilerplateCategoryOptionsDropdown() {
    const selectedCategory = _.find(getBoilerplateFeedback(), { description: this.state.selectedBoilerplateCategory, });
    if (selectedCategory) {
      return (
        <span className="select">
          <select className="boilerplate-feedback-dropdown" onChange={this.chooseSpecificBoilerplateFeedback} ref="boilerplate">
            <option className="boilerplate-feedback-dropdown-option">Select specific boilerplate feedback</option>
            {this.boilerplateSpecificFeedbackToOptions(selectedCategory)}
          </select>
        </span>
      );
    } else {
      return (<span />);
    }
  },

  renderConceptResults(mode) {
    if (this.props.response.conceptResults) {
      return hashToCollection(this.props.response.conceptResults).map((cr) => {
        const concept = _.find(this.props.concepts.data['0'], { uid: cr.conceptUID, });
        let deleteIcon;
        if (mode === 'Editing') {
          deleteIcon = <button onClick={this.deleteConceptResult.bind(null, cr.key)}>{'Delete'}</button>;
        } else {
          deleteIcon = <span />;
        }

        if (concept) {
          return (
            <li key={concept.id}>
              {concept.displayName} {cr.correct ? <span className="tag is-small is-success">Correct</span> : <span className="tag is-small is-danger">Incorrect</span>}
              {'\t'}
              {deleteIcon}
            </li>
          );
        } else {
          return (
            <div />
          );
        }
      });
    } else {
      const concept = _.find(this.props.concepts.data['0'], { uid: this.props.conceptID, });
      if (concept) {
        return (
          <li key={concept.id}>{concept.displayName} {this.props.response.optimal ? <span className="tag is-small is-success">Correct</span> : <span className="tag is-small is-danger">Incorrect</span>}
            <br /> <strong>*This concept is only a default display that has not yet been saved*</strong>
          </li>
        );
      } else {
        return (
          <div />
        );
      }
    }
  },

  renderResponseContent(isEditing, response) {
    let content;
    let parentDetails;
    let childDetails;
    let pathwayDetails;
    let authorDetails;
    if (!this.props.expanded) {
      return;
    }
    if (!response.parentID) {
      childDetails = (
        <a className="button is-outlined has-top-margin" onClick={this.viewChildResponses.bind(null, response.key)} key="view" >View Children</a>
      );
    }

    if (response.parentID) {
      const parent = this.props.getResponse(response.parentID);
      const diffText = this.applyDiff(parent.text, response.text);
      if (isEditing) {
        parentDetails = [
          (<span><strong>Parent Feedback:</strong> {parent.feedback}</span>),
          (<br />),
          (<button className="button is-danger" onClick={this.removeLinkToParentID.bind(null, response.key)}>Remove Link to Parent </button>),
          (<br />),
          (<span><strong>Differences:</strong> {diffText}</span>),
          (<br />)];
      } else {
        parentDetails = [
          (<span><strong>Parent Feedback:</strong> {parent.feedback}</span>),
          (<br />),
          (<span><strong>Parent Text:</strong> {parent.text}</span>),
          (<br />),
          (<span><strong>Differences:</strong> {diffText}</span>),
          (<br />)];
        authorDetails = [(<span><strong>Author:</strong> {response.author}</span>),
          (<br />)];
      }
    }

    if (this.props.showPathways) {
      pathwayDetails = (<span> <a
        className="button is-outlined has-top-margin"
        onClick={this.printResponsePathways.bind(null, this.props.key)}
        key="from"
      >
                         From Pathways
                       </a> <a
                         className="button is-outlined has-top-margin"
                         onClick={this.toResponsePathways}
                         key="to"
                       >
                            To Pathways
                          </a></span>);
    }

    if (isEditing) {
      content =
        (<div className="content">
          {parentDetails}
          <label className="label">Feedback</label>
          <TextEditor text={this.state.feedback || ''} handleTextChange={this.handleFeedbackChange} boilerplate={this.state.selectedBoilerplate} />

          <br />
          <label className="label">Boilerplate feedback</label>
          <div className="boilerplate-feedback-dropdown-container">
            {this.renderBoilerplateCategoryDropdown()}
            {this.renderBoilerplateCategoryOptionsDropdown()}
          </div>

          <div className="box">
            <label className="label">Concept Results</label>
            <ul>
              {this.renderConceptResults('Editing')}
              {/* <li>Commas in lists (placeholder)</li>*/}
            </ul>

            <ConceptSelector currentConceptUID={this.state.newConceptResult.conceptUID} handleSelectorChange={this.selectConceptForResult} />
            <p className="control">
              <label className="checkbox">
                <input onChange={this.markNewConceptResult} checked={this.state.newConceptResult.correct} type="checkbox" />
                Correct?
              </label>
            </p>
            <button className="button" onClick={this.saveNewConceptResult}>Save Concept Result</button>
          </div>

          <p className="control">
            <label className="checkbox">
              <input ref="newResponseOptimal" defaultChecked={response.optimal} type="checkbox" />
              Optimal?
            </label>
          </p>
        </div>);
    } else {
      content =
        (<div className="content">
          {parentDetails}
          <strong>Feedback:</strong> <br />
          <div dangerouslySetInnerHTML={{ __html: response.feedback, }} />
          <br />
          <label className="label">Concept Results</label>
          <ul>
            {this.renderConceptResults('Viewing')}
          </ul>
          {authorDetails}
          {childDetails}
          {pathwayDetails}
        </div>);
    }

    return (
      <div className="card-content">
        {content}
      </div>
    );
  },

  renderResponseFooter(isEditing, response) {
    if (!this.props.readOnly || !this.props.expanded) {
      return;
    }
    let buttons;

    if (isEditing) {
      buttons = [
        (<a className="card-footer-item" onClick={this.cancelResponseEdit.bind(null, response.key)} key="cancel" >Cancel</a>),
        (<a className="card-footer-item" onClick={this.incrementResponse.bind(null, response.key)} key="increment" >Increment</a>),
        (<a className="card-footer-item" onClick={this.updateResponse.bind(null, response.key)} key="update" >Update</a>)
      ];
    } else {
      buttons = [
        (<a className="card-footer-item" onClick={this.editResponse.bind(null, response.key)} key="edit" >Edit</a>),
        (<a className="card-footer-item" onClick={this.deleteResponse.bind(null, response.key)} key="delete" >Delete</a>)
      ];
    }
    if (this.props.response.statusCode === 3) {
      if (this.props.response.weak) {
        buttons = buttons.concat([(<a className="card-footer-item" onClick={this.unmarkAsWeak.bind(null, response.key)} key="weak" >Unmark as weak</a>)]);
      } else {
        buttons = buttons.concat([(<a className="card-footer-item" onClick={this.markAsWeak.bind(null, response.key)} key="weak" >Mark as weak</a>)]);
      }
    }
    if (this.props.response.statusCode > 1) {
      buttons = buttons.concat([(<a className="card-footer-item" onClick={this.rematchResponse.bind(null, response.key)} key="rematch" >Rematch</a>)]);
    }
    return (
      <footer className="card-footer">
        {buttons}

      </footer>
    );
  },

  responseIsCommonError(response) {
    return (response.feedback.includes('punctuation') || response.feedback.includes('spelling')) || response.feedback.includes('typo');
  },

  renderResponseHeader(response) {
    let bgColor;
    let icon;
    const headerCSSClassNames = ['human-optimal-response', 'human-sub-optimal-response', 'algorithm-optimal-response', 'algorithm-sub-optimal-response', 'not-found-response'];
    bgColor = headerCSSClassNames[response.statusCode];
    if (response.weak) {
      icon = '⚠️';
    }
    const authorStyle = { marginLeft: '10px', };
    const author = response.author ? <span style={authorStyle} className="tag is-dark">{response.author}</span> : undefined;
    const checked = this.props.massEdit.selectedResponses.includes(response.key) ? 'checked' : '';
    return (
      <div style={{ display: 'flex', alignItems: 'center', }} className={bgColor}>
        <input type="checkbox" checked={checked} onChange={() => this.onMassSelectCheckboxToggle(response.key)} style={{ marginLeft: '15px', }} />
        <header onClick={() => this.props.expand(response.key)} className={`card-content ${this.headerClasses()}`} style={{ flexGrow: '1', }}>
          <div className="content">
            <div className="media">
              <div className="media-content">
                <p>{response.text} {author}</p>
              </div>
              <div className="media-right" style={{ textAlign: 'right', }}>
                <figure className="image is-32x32">
                  <span>{ icon } { response.count ? response.count : 0 }</span>
                </figure>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  },

  cardClasses() {
    if (this.props.expanded) {
      return 'has-bottom-margin has-top-margin';
    }
  },

  headerClasses() {
    if (!this.props.expanded) {
      return 'unexpanded';
    } else {
      return 'expanded';
    }
  },

  renderChildResponses(isViewingChildResponses, key) {
    if (isViewingChildResponses) {
      return (
        <Modal close={this.cancelChildResponseView.bind(null, key)}>
          <ResponseList
            responses={this.props.getChildResponses(key)}
            getResponse={this.props.getResponse}
            getChildResponses={this.props.getChildResponses}
            states={this.props.states}
            questionID={this.props.questionID}
            dispatch={this.props.dispatch}
            admin={false}
            expanded={this.props.allExpanded}
            expand={this.props.expand}
            ascending={this.props.ascending}
            showPathways={false}
          />
        </Modal>
      );
    }
  },

  printResponsePathways() {
    this.viewFromResponses(this.props.response.key);
    // this.props.printPathways(this.props.response.key);
  },

  toResponsePathways() {
    this.viewToResponses(this.props.response.key);
    // this.props.printPathways(this.props.response.key);
  },

  renderToResponsePathways(isViewingToResponses, key) {
    if (isViewingToResponses) {
      return (
        <Modal close={this.cancelToResponseView.bind(null, key)}>
          <ResponseList
            responses={this.props.toPathways(this.props.response.key)}
            getResponse={this.props.getResponse}
            getChildResponses={this.props.getChildResponses}
            states={this.props.states}
            questionID={this.props.questionID}
            dispatch={this.props.dispatch}
            admin={false}
            expanded={this.props.allExpanded}
            expand={this.props.expand}
            ascending={this.props.ascending}
            showPathways={false}
          />
        </Modal>
      );
    }
  },

  renderFromResponsePathways(isViewingFromResponses, key) {
    if (isViewingFromResponses) {
      const pathways = this.props.printPathways(this.props.response.key);
      let initialCount;
      const resps = _.reject(hashToCollection(pathways), fromer => fromer.initial === true);
      if (_.find(pathways, { initial: true, })) {
        initialCount = (
          <p style={{ color: 'white', }}>First attempt: {_.find(pathways, { initial: true, }).pathCount}</p>
        );
      }
      return (
        <Modal close={this.cancelFromResponseView.bind(null, key)}>
          {initialCount}
          <br />
          <ResponseList
            responses={resps}
            getResponse={this.props.getResponse}
            getChildResponses={this.props.getChildResponses}
            states={this.props.states}
            questionID={this.props.questionID}
            dispatch={this.props.dispatch}
            admin={false}
            expanded={this.props.allExpanded}
            expand={this.props.expand}
            ascending={this.props.ascending}
            showPathways={false}
          />
        </Modal>
      );
    }
  },

  render() {
    const { response, state, } = this.props;
    const isEditing = (state === (`${C.START_RESPONSE_EDIT}_${response.key}`));
    const isViewingChildResponses = (state === (`${C.START_CHILD_RESPONSE_VIEW}_${response.key}`));
    const isViewingFromResponses = (state === (`${C.START_FROM_RESPONSE_VIEW}_${response.key}`));
    const isViewingToResponses = (state === (`${C.START_TO_RESPONSE_VIEW}_${response.key}`));
    return (
      <div className={`card is-fullwidth ${this.cardClasses()}`}>
        {this.renderResponseHeader(response)}
        {this.renderResponseContent(isEditing, response)}
        {this.renderResponseFooter(isEditing, response)}
        {this.renderChildResponses(isViewingChildResponses, response.key)}
        {this.renderFromResponsePathways(isViewingFromResponses, response.key)}
        {this.renderToResponsePathways(isViewingToResponses, response.key)}
      </div>
    );
  },
});
