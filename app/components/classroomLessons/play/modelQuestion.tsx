import React, { Component } from 'react';
import Cues from 'components/renderForQuestions/cues';
import RenderSentenceFragments from 'components/renderForQuestions/sentenceFragments';
import icon from 'img/question_icon.svg';
import {
  QuestionData
} from '../../../interfaces/classroomLessons';

interface ModelQuestionProps {
  data: QuestionData,
  model: string|null,
  prompt: string|null,
}

interface ModelQuestionState {}

class ModelQuestion extends Component<ModelQuestionProps, ModelQuestionState> {
  constructor(props) {
    super(props)
  }

  renderInstructions() {
    if (this.props.data.play.instructions) {
      return (<div className="feedback-row">
        <img src={icon} />
        <p>{this.props.data.play.instructions}</p>
      </div>);
    }
  }

  renderCues() {
    if (this.props.data.play.cues) {
      return (
        <Cues
          getQuestion={() => ({
            cues: this.props.data.play.cues,
          })
        }
          displayArrowAndText={false}
        />
      );
    }
    return (
      <span />
    );
  }

  renderTeacherModel() {
    const model = this.props.model;
    const modelNotEmpty = model && (model.replace(/[\n\r]/g, '') !== "<p><br>&nbsp;</p>") && (model.replace(/[\n\r]/g, '') !== "<p><br></p>");
    if (modelNotEmpty && this.props.model) {
      return (
        <div className="teacher-model-container">
          <p className="answer-header">
            Teacher Answer:
          </p>
          <p className="teacher-model" dangerouslySetInnerHTML={{__html: this.props.model}}></p>
        </div>
      )
    } else {
      return (
        <span />
      )
    }

  }

  renderQuestionOrHTML() {
    if (this.props.data.play.prompt) {
      const editedPrompt = this.props.prompt;
      const promptNotEmpty = editedPrompt && (editedPrompt.replace(/[\n\r]/g, '') !== "<p><br>&nbsp;</p>") && (editedPrompt.replace(/[\n\r]/g, '') !== "<p><br></p>");
      const prompt = promptNotEmpty ? editedPrompt : this.props.data.play.prompt;
      return (
        <div>
          <RenderSentenceFragments prompt={prompt} />
          {this.renderCues()}
          {this.renderInstructions()}
        </div>
      )
    } else {
      return (
        <div className="student-model-question">
          <p dangerouslySetInnerHTML={{__html: this.props.data.play.html}}></p>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="student-model-wrapper">
        {this.renderQuestionOrHTML()}
        {this.renderTeacherModel()}
      </div>
    );
  }
}

export default ModelQuestion;
