import React from 'react';
import { Link } from 'react-router'
export default React.createClass({
  renderSentenceFragmentListItems: function () {
    if (this.props.sentenceFragments.length === 0) {
      return;
    }
    return this.props.sentenceFragments.map((sentenceFragment) => {
      return (
        <li key={sentenceFragment.key}><Link to={'admin/sentence-fragments/' + sentenceFragment.key}>{sentenceFragment.prompt}</Link></li>
      )
    })
  },

  render: function () {
    return (
      <ul className="menu-list">
        {this.renderSentenceFragmentListItems()}
      </ul>
    )
  }
})
