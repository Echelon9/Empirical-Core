import React, { Component } from 'react';
import ScriptComponent from '../shared/scriptComponent.tsx';

class SingleAnswer extends Component {
  constructor(props) {
    super(props);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.startDisplayingAnswers = this.startDisplayingAnswers.bind(this);
    this.stopDisplayingAnswers = this.stopDisplayingAnswers.bind(this);
  }

  toggleSelected(event, current_slide, student) {
    this.props.toggleSelected(current_slide, student);
  }

  startDisplayingAnswers() {
    this.props.startDisplayingAnswers();
  }

  stopDisplayingAnswers() {
    this.props.stopDisplayingAnswers();
  }

  render() {
    const { selected_submissions, submissions, current_slide, students, presence, modes, timestamps, flaggedStudents, } = this.props.data;
    const showHeaderText = this.props.onlyShowHeaders ? 'Show Step-By-Step Guide' : 'Hide Step-By-Step Guide';
    return (
      <div className="teacher-single-answer">
        <div className="header">
          <h1>
            <span>Slide {this.props.data.current_slide}:</span> {this.props.data.questions[this.props.data.current_slide].data.teach.title}
          </h1>
          <p onClick={this.props.toggleOnlyShowHeaders}>
            {showHeaderText}
          </p>
        </div>
        <ScriptComponent
          script={this.props.data.questions[this.props.data.current_slide].data.teach.script}
          selected_submissions={selected_submissions}
          submissions={submissions}
          current_slide={current_slide}
          students={students}
          presence={presence}
          modes={modes}
          flaggedStudents={flaggedStudents}
          startDisplayingAnswers={this.startDisplayingAnswers}
          stopDisplayingAnswers={this.stopDisplayingAnswers}
          toggleSelected={this.toggleSelected}
          timestamps={timestamps}
          onlyShowHeaders={this.props.onlyShowHeaders}
          clearAllSelectedSubmissions={this.props.clearAllSelectedSubmissions}
          clearAllSubmissions={this.props.clearAllSubmissions}
          toggleStudentFlag={this.props.toggleStudentFlag}
        />

      </div>
    );
  }

}

export default SingleAnswer;
