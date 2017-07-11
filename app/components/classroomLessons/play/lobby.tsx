import * as React from 'react';
import {
  ClassroomLessonSessions,
  ClassroomLessonSession,
  QuestionSubmissionsList,
  SelectedSubmissions,
  SelectedSubmissionsForQuestion,
  Question,
  Presence,
  Students
} from '../interfaces';
import { sortByLastName } from '../shared/studentSorts'

class Lobby extends React.Component<{data: ClassroomLessonSession}> {
  constructor(props) {
    super(props);
  }

  renderPresentStudents(presence: Presence, students: Students) {
    if (presence !== undefined) {
      const sortedNames: Array<string> = Object.keys(presence).sort((key1, key2) => {
        return sortByLastName(key1, key2, students);
      })
      return sortedNames.map((key) => {
        const name: string = students[key];
        const statusClass: string = presence[key] ? "online" : "offline";
        return (
          <div>
            <li>
              <p>{name}</p> <div className={statusClass}></div>
            </li>
            <hr />
          </div>
        );
      });
    }
  }

  // Static for now
  renderLessonTitle() {
    const title = this.props.data.questions['0'].data.play.topic
    return (
      <div className="student-lesson-title-container">
        <p className="student-lesson-title">
          {title}
        </p>
      </div>
    )
  };

  renderLessonInstructions() {
    return (
      <div className="student-instructions-container">
        <p className="student-lesson-instructions-title">
          How to join a lesson?
        </p>

        <ol className="student-lesson-instructions">
          <li>
            <span>Go to <span className="student-highlighted">Quill.org</span> and sign in with </span>
            <br />
            <span className="student-indented">your username and password.</span>
          </li>
          <li>
            <span>Start lesson by clicking on </span>
            <br />
            <span className="student-indented student-highlighted">Start Lesson</span>
          </li>
        </ol>
      </div>
    )
  }

  renderStudentPresence() {
    return (
      <div className="presence-container">
        <div className="presence-header">
          Students Joined:
        </div>
        <div className="presence-list-container">
          <ol>
            {this.renderPresentStudents(this.props.data.presence, this.props.data.students)}
          </ol>
        </div>
      </div>
    )
  }


  render() {
    return (
      <div className="student-lobby">
        <div className="student-title-instructions">
          {this.renderLessonTitle()}
          {this.renderLessonInstructions()}
        </div>
        {this.renderStudentPresence()}
      </div>
    );
  }

}

export default Lobby;
