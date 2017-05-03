import React from 'react';

export default React.createClass({
  renderToggleField(status, index) {
    let tagClass = 'tag';
    let addColorToTag = false;
    if (this.props.visibleStatuses[status]) addColorToTag = true;

    if (addColorToTag) {
      switch (status) {
        case 'Human Optimal':
          tagClass += ' is-success';
          break;

        case 'Human Sub-Optimal':
          tagClass += ' is-warning';
          break;

        case 'Algorithm Optimal':
          tagClass += ' is-success is-algo-optimal';
          break;

        case 'Algorithm Sub-Optimal':
          tagClass += ' is-info';
          break;

        case 'Unmatched':
          tagClass += ' is-danger';
          break;

        default:
          tagClass += ' is-dark';
      }
    }

    return (
      <label className="panel-checkbox toggle" key={index}>
        <span className={tagClass} onClick={this.toggleFieldAndResetPage.bind(null, status)}>{status.replace(' Hint', '')}</span>
      </label>
    );
  },

  toggleFieldAndResetPage(status) {
    this.props.resetPageNumber();
    this.props.toggleField(status);
  },

  render() {
    return (
      <div>
        <div style={{ margin: '10 0', }}>
          {this.props.qualityLabels.map((label, i) => this.renderToggleField(label, i))}
        </div>
        <div style={{ margin: '10 0 0 0', display: 'flex', flexWrap: 'wrap', }}>
          {this.props.labels.map((label, i) => this.renderToggleField(label, i))}
          {this.renderToggleField('None Hint')}
        </div>
      </div>
    );
  },
});
