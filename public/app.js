/*

Your task is to create an artist search webpage using the public Spotify API.  As a growth engineer at Zenefits you'll function with a good bit of autonomy, so we expect you to prioritize effectively, engage your creativity, and deliver a usable and aesthetically appealing product.

To that end we'll keep the requirements minimal.  Make it your own!  But at the least check these boxes:
Constrain all your work to onewebpageonly (no constraints on number of files)
Implement some artist search functionality
Display the artist name and image on the page
Accommodate every UI edge case (varying screen widths, zero data, etc.)
Populate your data asynchronously using the linked Spotify API
HTML, CSS, and Javascript should be sufficient for this project. We don’t want you to spend time figuring out a complex build system, so please don’t use a front-end framework such as React or Angular. We want to see your code, not the framework’s abstractions! You should, however, feel free to use other tools such as jQuery or Bootstrap, as well as a templating tool like Underscore/Lodash. Also, just as a note, the Spotify endpoints you’ll probably want to hit do not require auth.

We'll evaluate usability and visual quality, page structure and layout, code organization, feature selection, and level of completion. You’re welcome to spend as much time as you like; we generally recommend about three hours or so.

Folder should contain a readme with instructions to run your project. When you're done, `tar czf fname_lname_zengrowth.tgz your_project_folder` and send it back.

*/


$(function(){

class Header {
  constructor() {
    this.title = "Spotify Search";
  }

  render() {
    return $(_.template(`
      <header>
        <h1><%= title %></h1>
      </header>
    `)(this));
  }
}

class SearchResult {
  render(result) {
    return $(_.template(`
      <div>
        <img src="<%= images.length > 0 ? images[1].url : '' %>" />
        <span><%= name %></span>
      </div>
    `)(result));
  }
}

class SearchResults {
  render(results) {
    let searchResults = results.map(result => {
      return new SearchResult().render(result);
    }).reduce((prev, next) => {
      return prev.add(next);
    }, $());
    return $('<div class="search-results"></div>').append(searchResults);
  }
}

class ArtistSearchBox {
  constructor() {
    this.endpoint = 'https://api.spotify.com/v1/search';
    this.state = {
      searchText: '',
      results: []
    }
    this.SearchResults = new SearchResults();
    this.input = null;
  }

  searchApi() {
    const self = this;
    $.get({
      url: this.endpoint,
      data: {
        q: self.state.searchText,
        type: 'artist',
        limit: 6
      },
      dataType: 'json',
      success: self.onGetSuccess.bind(self),
      error: self.onGetError.bind(self)
    });
  }

  onGetSuccess(data) {
    console.log(`GET success ${ new Date().toLocaleString() }`)
    this.state.results = data.artists.items;
    appRerender();
  }

  onGetError(res) {
    throw new Error(`error on ${this.state.endpoint} GET: ${res}`);
  }

  setupStateChangeHandlers(template) {
    this.input = template.find('input');
    let self = this;
    function onKeyup() {
      self.state.searchText = $(this).val();
      if (self.state.searchText.length > 0) {
        self.searchApi();
      }
    }
    this.input.keyup(_.debounce(onKeyup, 300));
    return template;
  }

  setInputFocus() {
    this.input.focus();
    const textLength = this.input.val().length;
    this.input[0].setSelectionRange(textLength, textLength);
  }

  render() {
    const searchResults = this.SearchResults.render(this.state.results);
    let template = $(_.template(`
      <section class="artist-search-container">
        <input autofocus=true
          type="text"
          placeholder="e.g. Drake, Tame Impala, etc."
          value="<%= state.searchText %>" />
      </section>
    `)(this));
    template = this.setupStateChangeHandlers(template);
    return template.add(searchResults);
  }
}

class App {
  constructor() {
    this.Header = new Header();
    this.ArtistSearchBox = new ArtistSearchBox();
  }
  render() {
    $('#app-root').html(this.Header.render().add(this.ArtistSearchBox.render()));
    this.ArtistSearchBox.setInputFocus();
  }
}

const app = new App();
const appRerender = app.render.bind(app);
appRerender();

});
