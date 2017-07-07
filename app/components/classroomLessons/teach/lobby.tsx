import * as React from 'react';
import {
  ClassroomLessonSessions,
  ClassroomLessonSession,
  QuestionSubmissionsList,
  SelectedSubmissions,
  SelectedSubmissionsForQuestion,
  Question
} from '../interfaces';
import { sortByLastName } from '../shared/sortByLastName'



class Lobby extends React.Component<{data: ClassroomLessonSession; slideData: Question; }> {
  constructor(props) {
    super(props);
  }

  renderPresentStudents(presence, students) {
    // Want to order students by last name alphabetically.
    // Then display if connected or recently disconnected
    if (presence !== undefined) {

      const sortedNames = Object.keys(presence).sort((key1, key2) => {
        return sortByLastName(key1, key2, students);
      })

      return sortedNames.map((key) => {
        const name = students[key];
        const statusClass = presence[key] ? "online" : "offline";
        return (
          <li>
            <p>{name}</p> <div className={statusClass}></div>
          </li>
        );
      });
    }
  };

  renderNumberPresentStudents(presence) {
    let numPresent;
    if (presence === undefined) {
      numPresent = 0;
    } else {
      numPresent = Object.keys(presence).length;
    }
    return (
      <p>
        <strong>{numPresent} student{numPresent === 1 ? '': 's'}</strong> joined this lesson.
      </p>
    );
  }

  // This returns static data for now
  renderHeader() {
    return (
      <div className="lobby-header">
        <p className="unit-title">Unit: {this.props.slideData.data.teach.unit}</p>
        <p className="lesson-title">Lesson {this.props.slideData.data.teach.lesson}: {this.props.slideData.data.teach.topic}</p>
      </div>
    )
  }

  renderScript() {
    // should be changed to this.props.slideData.data.teach.script[0].data.body || '';
    // when the dummy data structure is updated
    const html:string =  this.props.slideData.data.teach.script[0].data.body || '';
    return (
      <div className="lobby-text" dangerouslySetInnerHTML={{__html: html}} >
      </div>
    )
  }

  renderPresence() {
    return (
      <div className="presence-container">
        <div className="presence-header">
          {this.renderNumberPresentStudents(this.props.data.presence)}
        </div>
        <div className="presence-list-container">
          <div className="presence-list-titles"><span>Student</span>  <span>Status</span></div>
          <ul>
            {this.renderPresentStudents(this.props.data.presence, this.props.data.students)}
          </ul>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="teacher-lobby">
        {this.renderHeader()}
        <div className="lobby-body">
          {this.renderScript()}
          {this.renderPresence()}
        </div>
      </div>
    );
  }

}

export default Lobby;
