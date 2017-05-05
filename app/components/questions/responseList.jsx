import React from 'react'
import Response from './response.jsx'

export default React.createClass({

  render: function () {
    var responseListItems = this.props.responses.map((resp) => {
      if (resp) {return (
          <Response
          key={resp.key}
          response={resp}
          responses={this.props.responses}
          getResponse={this.props.getResponse}
          getChildResponses={this.props.getChildResponses}
          states={this.props.states}
          state={this.props.states[this.props.questionID]}
          questionID={this.props.questionID}
          dispatch={this.props.dispatch}
          readOnly={this.props.admin}
          allExpanded={this.props.expanded}
          expanded={this.props.expanded[resp.key]}
          expand={this.props.expand}
          getMatchingResponse={this.props.getMatchingResponse}
          showPathways={this.props.showPathways}
          printPathways={this.props.printPathways}
          toPathways={this.props.toPathways}
          conceptsFeedback={this.props.conceptsFeedback}
          mode={this.props.mode}
          concepts={this.props.concepts}
          conceptID={this.props.conceptID}
          massEdit={this.props.massEdit}/>
      )}
    })
    return (
      <div>
        {responseListItems}
      </div>
    );
  }
})
