import React from 'react';
import questionActions from '../../actions/questions';
import sentenceFragmentActions from '../../actions/sentenceFragments';
import Question from '../../libs/question';
const jsDiff = require('diff');
import { Modal } from 'quill-component-library/dist/componentLibrary';
import ResponseList from './responseList.jsx';
import _ from 'underscore';
import { hashToCollection } from '../../libs/hashToCollection';
import Textarea from 'react-textarea-autosize';
import TextEditor from './textEditor.jsx';
import feedbackActions from '../../actions/concepts-feedback.js';

const C = require('../../constants').default;

const feedbackStrings = C.FEEDBACK_STRINGS;

export default React.createClass({

  getInitialState() {
    return {
      isExpanded: false,
    };
  },

  toggleExpandSinglePOS() {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  },

  renderExpandedPOSListText() {
    if (this.state.isExpanded) {
      const tag = this.props.tag;
      const additionalResponses = tag.responses.slice(1); // first response has already been rendered in unexpanded view
      if (additionalResponses.length === 0) {
        return (<p>***No more responses match this pattern***</p>);
      }
      return additionalResponses.map(response => (
        <p>{response.text}</p>
        ));
    }
  },

  renderExpandedPOSListCount() {
    if (this.state.isExpanded) {
      const tag = this.props.tag;
      const additionalResponses = tag.responses.slice(1); // first response has already been rendered in unexpanded view
      return additionalResponses.map(response => (
        <p>{response.count}</p>
        ));
    }
  },

  render() {
    const { headerStyle, } = this.props;
    if (this.state.isExpanded) {
      headerStyle.marginTop = '20px';
      headerStyle.marginBottom = '20px';
    } else {
      headerStyle.marginTop = '0px';
      headerStyle.marginBottom = '0px';
    }
    return (
      <header onClick={this.toggleExpandSinglePOS} className={`card-content ${this.props.bgColor}`} style={headerStyle}>
        <div className="content">
          <div className="media">
            <div className="media-content" style={this.props.contentStyle}>
              <p>{this.props.tagsToRender.join('---')}</p>
              <p>{this.props.tag.responses[0].text}</p>
              {this.renderExpandedPOSListText()}
            </div>
            <div className="media-right">
              <figure className="image is-32x32">
                <p>{this.props.icon} {this.props.tag.count === undefined ? 0 : this.props.tag.count}</p>
                <p>{this.props.tag.responses[0].count === undefined ? 0 : this.props.tag.responses[0].count}</p>
                {this.renderExpandedPOSListCount()}
              </figure>
            </div>
          </div>
        </div>
      </header>
    );
  },
});
