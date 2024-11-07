import { html, render, svg } from 'https://unpkg.com/uhtml@4.6.0'

class MySelect extends HTMLElement {

  static formAssociated = true

  #options
  #isOpen

  constructor () {
    super()
    this.internals_ = this.attachInternals()
  }

  connectedCallback () {
    this.setAttribute('name', this.initialSelect.name)
    this.#options = this.initialOptions
    let initialValue = this.initialSelect.value

    this.render()

    this.selectOption(this.#options.find(option => option.value === initialValue))
  }

  get template () {
    let isClearOption = (option) => (option.value.length === 0)
    let clearOption = this.#options.find(isClearOption)
      ? html`
          <li class="my-select__clear-option">
            <button>Clear</button>
          </li>
        `
      : null

    let icon = (iconId) => svg`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        <use href="${'#' + iconId}"/>
      </svg>
    `

    let dropdown = html`
      <ol class="my-select__dropdown">
        ${clearOption}
        ${
          this.optionsToDisplay
            .filter((option) => !isClearOption(option))
            .map(
              (option) => html`
                <li>
                  ${ option.iconId ? icon(option.iconId) : null }
                  <button type="button"
                          onclick=${() => this.selectOption(option)}>
                    ${ option.label }
                  </button>
                </li>
              `
            )
        }
      </ol>
    `

    if (this.optionsToDisplay.length === 0) {
      dropdown = html`
        <div class="my-select__dropdown">No matches</div>
      `
    }

    return html`
      <input onclick=${this.toggleDropdown}
              onkeyup=${this.render}
              autocomplete=off>
      ${ this.#isOpen ? dropdown : null }
    `
  }

  render = () => {
    render(this, this.template)
  }

  toggleDropdown = () => {
    this.#isOpen = !this.#isOpen
    this.render()
  }

  closeDropdown = () => {
    this.#isOpen = false
    this.render()
  }

  selectOption = (option) => {
    this.input.value = option.label
    this.internals_.setFormValue(option.value)
    this.closeDropdown()
  }

  get input () {
    return this.querySelector('input')
  }

  get optionsToDisplay () {
    if (!this.input) {
      return this.#options
    }

    let searchTerm = this.input.value.trim()

    return this.#options
                .filter(option => {
                  if (searchTerm.length > 0) {
                    return option.label.includes(searchTerm)
                  } else {
                    return true
                  }
                })
  }

  get initialSelect () {
    return this.querySelector('select')
  }

  get initialOptions () {
    let xs = [...this.initialSelect.querySelectorAll('option')]
    return xs.map(el => ({
      value: el.value,
      label: el.textContent,
      iconId: el.getAttribute('icon')
    }))
  }

}


// Delay registering the custom element to simulate the network delay.
setTimeout(
  () => customElements.define('my-select', MySelect),
  1000
)
