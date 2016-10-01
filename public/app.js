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
    return _.template(`
      <header>
        <h1><%= title %></h1>
      </header>
    `)(this);
  }
}

const header = new Header().render();
$('#root').html(header);

});
