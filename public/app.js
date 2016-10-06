// Component is the base class that does most of the work behind the scenes for a component.
// It handles all the lifecycle events.
class Component {
  constructor(parentId, props) {
    this.parentId = parentId;
    this.props = {};
    this.children = {};
    $.extend(this.props, props);
    this.state = {};
    this.id = this.constructor.name.toLowerCase();
    this._noop = () => {};
    this._mounted = false;
  }

  mount(rendered) {
    console.log(`mounting ${this.id}`);
    rendered.attr({id: this.id});
    $(`#${this.parentId}`).append(rendered);
    this._mounted = true;
  }

  remount(rendered) {
    console.log(`re-mounting ${this.id}`);
    rendered.attr({id: this.id});
    const replaced = $(`#${this.parentId} #${this.id}`).replaceWith(rendered);
    if (replaced.length === 0) {
      console.log(`#${this.id} not found. mounting normally.`);
      this.mount(rendered);
    }
  }

  unmount() {
    $(`#${this.parentId}`).children().remove();
    this._mounted = false;
  }

  _kickoffRenderLifecycle() {
    if (!this.render) throw new Error(`${this.name} must contain a render function`)
    console.log(`rendering ${this.id} with props and state:`);
    console.log(this.props)
    console.log(this.state)
    const rendered = this.render(this.props, this.state);
    this.beforeMount ? this.beforeMount(rendered) : this.noop;
    this._mounted ? this.remount(rendered) : this.mount(rendered);
    this.afterMount ? this.afterMount(rendered) : this.noop;
  }

  initialize(newProps) {
    $.extend(this.props, newProps);
    this._kickoffRenderLifecycle();
  }

  setState(newState, callback) {
    console.log('setState:');
    console.log(newState)
    Object.keys(newState).forEach(key => {
      this.state[key] = newState[key];
    });
    this._kickoffRenderLifecycle();
    callback ? callback() : this._noop;
  }
}

class SearchResult extends Component {
  constructor(parentId, props) {
    super(parentId, props);
  }

  render(props) {
    return $(_.template(`
      <div>
        <img src="<%= images.length > 0 ? images[1].url : '' %>" />
        <span><%= name %></span>
      </div>
    `)(props.result));
  }
}

class SearchResults extends Component {
  constructor(parentId, props) {
    super(parentId, props);
    this.children.SearchResults = [];
  }

  render(props) {
    const template = $('<div class="search-results"></div>');
    this.children.SearchResults = [];
    if (props.results.length > 0) {
      this.children.SearchResults = props.results.map(result => {
        return new SearchResult(this.id, { result: result });
      });
    } else if (props.searchText && !props.isSearching) {
      template.append('<div><span>Artist not found<span></div>');
    }
    return template;
  }

  // Since we're creating a new SearchResult component every time we receive a new set of search
  // results (we have to, since we don't know in advance how many we need to mount), we need to
  // manually unmount each before re-mounting.
  beforeMount() {
    this.children.SearchResults.forEach(result => {
      result.unmount();
    });
  }

  afterMount(rendered) {
    this.children.SearchResults.forEach(result => {
      result.initialize();
    });
  }
}

class SearchBox extends Component {
  constructor(parentId, props) {
    super(parentId, props);
    this.state = {
      searchText: '',
      results: [],
      isSearching: false
    }
    this.children.SearchResults = new SearchResults(this.id);
  }

  searchApi(searchText) {
    const self = this;
    $.get({
      url: this.props.endpoint,
      data: {
        q: searchText,
        type: 'artist',
        limit: 6
      },
      dataType: 'json',
      success: self.onGetSuccess.bind(self),
      error: self.onGetError.bind(self)
    });
  }

  onGetSuccess(data) {
    console.log(`GET success ${ new Date().toLocaleString() }`);
    this.setState({
      results: data.artists.items,
      isSearching: false
     });
  }

  onGetError(res) {
    throw new Error(`error on ${this.state.endpoint} GET: ${res}`);
  }

  render(props, state) {
    return $(_.template(`
      <section class="artist-search-container">
        <input autofocus=true
          type="text"
          placeholder="e.g. Drake, Tame Impala, etc."
          value="<%= state.searchText %>" />
      </section>
    `)({ props, state }));
  }

  beforeMount(rendered) {
    const input = rendered.find('input');
    let self = this;
    function onKeyup() {
      const newSearchText = $(this).val().trim();
      self.setState({
        searchText: newSearchText,
        isSearching: true
      }, () => {
        if (newSearchText.length > 0) {
          self.searchApi(newSearchText);
        }
      });
    }
    // Prevent excessive calls to the API by waiting for the user to finish
    // typing their search query
    input.keyup(_.debounce(onKeyup, 300));
  }

  setInputFocus(rendered) {
    const input = rendered.find('input');
    input.focus();
    const textLength = input.val().length;
    input[0].setSelectionRange(textLength, textLength);
  }

  afterMount(rendered) {
    this.children.SearchResults.initialize({
      results: this.state.results,
      searchText: this.state.searchText,
      isSearching: this.state.isSearching
    });
    this.setInputFocus(rendered);
  }
}

class Header extends Component {
  constructor(parentId, props) {
    super(parentId, props);
  }

  render(props, state) {
    return $(_.template(`
      <header>
        <h1><%= props.title %></h1>
      </header>
    `)({ props, state }));
  }
}

class App extends Component {
  constructor(parentId) {
    super(parentId);
    this.children.Header = new Header(this.id, { title: "Spotify Artist Search"});
    this.children.SearchBox = new SearchBox(this.id, {
      endpoint: 'https://api.spotify.com/v1/search',
      resultsText: 'artists'
    });
  }

  render() {
    return $('<div class="app-main"></div>');
  }

  afterMount() {
    this.children.Header.initialize();
    this.children.SearchBox.initialize();
  }
}

$(function() {

  const app = new App('root');
  app.initialize();

});