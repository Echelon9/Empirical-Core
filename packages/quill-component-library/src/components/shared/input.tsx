import React from 'react';

interface InputProps {
  timesSubmitted: Number;
  label: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  value?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  handleCancel?: (event: any) => void;
  helperText?: string;
  handleChange?: (event: any) => void;
}

interface InputState {
  inactive: boolean;
  errorAcknowledged: boolean;
}

export class Input extends React.Component<InputProps, InputState> {
  private input: any
  private node: any

  constructor(props) {
    super(props)

    this.state = {
      inactive: true,
      errorAcknowledged: false
    }

    this.activateInput = this.activateInput.bind(this)
    this.acknowledgeError = this.acknowledgeError.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleTab = this.handleTab.bind(this)
    this.deactivateInput = this.deactivateInput.bind(this)
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== this.props.error && this.state.errorAcknowledged) {
      this.setState({ errorAcknowledged: false, })
    } else if (nextProps.timesSubmitted !== this.props.timesSubmitted && nextProps.error && this.state.errorAcknowledged) {
      this.setState({ errorAcknowledged: false, })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  activateInput() {
    if (!this.props.disabled) {
      this.setState({ inactive: false, }, () => this.input.focus())
    }
  }

  deactivateInput() {
    this.setState({ inactive: true, })
  }

  handleClick(e) {
    if (!this.node.contains(e.target)) {
      this.deactivateInput()
    }
  }

  acknowledgeError() {
    this.setState({ errorAcknowledged: true, inactive: false, }, () => this.input.focus())
  }

  handleTab(event) {
    if (event.key === 'Tab') {
      const form = event.target.form;
      const index = Array.prototype.indexOf.call(form, event.target);
      form.elements[index + 1].focus();
      event.preventDefault();
      this.deactivateInput()
    }
  }

  renderHelperText() {
    const { helperText } = this.props
    if (helperText) {
      return <span className="helper-text">{helperText}</span>
    }
  }

  renderErrorText() {
    const { error } = this.props
    if (error) {
      return <span className="error-text">{error}</span>
    }
  }

  renderCancelSymbol() {
    const { inactive } = this.state
    const { handleCancel } = this.props
    if (!inactive && handleCancel) {
      return <div className="cancel" onClick={handleCancel}><i className="fas fa-times"></i></div>
    }
  }

  renderInput() {
    const { inactive, errorAcknowledged} = this.state
    const { className, label, handleChange, value, placeholder, error, type, id, disabled } = this.props
    const hasText = value ? 'has-text' : ''
    const inactiveOrActive = inactive ? 'inactive' : 'active'
    if (error) {
      if (errorAcknowledged) {
        return (<div
            className={`input-container error ${inactiveOrActive} ${hasText} ${className}`}
            ref={node => this.node = node}
            onClick={this.activateInput}
          >
            <label>{label}</label>
            <input
              id={id}
              ref={(input) => { this.input = input; }}
              onChange={handleChange}
              value={value}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
            />
            {this.renderCancelSymbol()}
        </div>)
      } else {
        return (
          <div
            className={`input-container error unacknowledged ${inactiveOrActive} ${hasText} ${className}`}
            onClick={this.acknowledgeError}
            ref={node => this.node = node}
          >
            <label>{label}</label>
            <input
              id={id}
              ref={(input) => { this.input = input; }}
              onChange={handleChange}
              value={value}
              type={type}
              placeholder={placeholder}
            />
            {this.renderCancelSymbol()}
            {this.renderErrorText()}
        </div>)
      }
    } else if (inactive) {
      return (
        <div
          className={`input-container ${inactiveOrActive} ${hasText} ${this.props.className}`}
          onClick={this.activateInput}
          ref={node => this.node = node}
        >
          <label>{label}</label>
          <input
            id={id}
            ref={(input) => { this.input = input; }}
            onFocus={this.activateInput}
            type={type}
            value={value}
            disabled={disabled}
          />
          {this.renderHelperText()}
      </div>)
    } else {
      return (
        <div
          className={`input-container ${inactiveOrActive} ${hasText} ${className}`}
          ref={node => this.node = node}
        >
          <label>{label}</label>
          <input
            id={id}
            ref={(input) => { this.input = input; }}
            onChange={handleChange}
            value={value}
            type={type}
            placeholder={placeholder}
            onKeyDown={this.handleTab}
          />
          {this.renderCancelSymbol()}
      </div>)
    }
  }

  render() {
    return this.renderInput()
  }

}
