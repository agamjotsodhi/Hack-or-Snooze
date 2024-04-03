"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Main Data handling page has 3 main classes: a) Story b) StoryList c) User
 * STORY: CLASS: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   * Single story post template that user inputs info into 
   *   - {title, author, url, username, storyId, createdAt}
   * Inital Story post template that will be used to create instances(updated versions with user inputed info) -a.s.
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  // Looks at user inputed url, URL object takes only the host name, parses/returns it 
  getHostName() {
    return new URL(this.url).hostname; //parses user inputed url, returns hostname using URL interface - mdn docs
  }
}
/******************************************************************************
 
 * STORYLIST: CLASS:
 * List of Story instances: used by UI to show story lists in DOM.
 * First response - "GET"s story data from API stories endpoint and holds onto it
 * Then we update stories with that response data and includes it in the list of stories */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. 

    //getStories() is a static method. NOT an intance method, because it is responsible for fetching stories from API endpoint, process response data and create instances of 'Story' class
    //Operates only on the basic structre NOT on a specific instance of Storylist

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    //
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Add Story Function
   * - posts story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   * returns a new Story instance, response posts story data to api with user instance (token) and story objects: 
   * updates story class and splices new story to the front of the list  */

  async addStory(user, { title, author, url }) {
    const token = user.loginToken;

    // Axios request to post user inputed data back to API /stories endpoint
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });

    // Update new single story to Story class, returning a new instance 
    const story = new Story(response.data.story); //adds new story to Story class instance

    //Add new story to stories and ownStories page using splice array method 
    this.stories.splice(0, 0, story);
    user.ownStories.splice(0, 0, story);

    //New Updated story instance
    return story;
  }

  /** Remove Story Function
  *  - API requires token and delete request to storyId
  *  - storyId removes single story 
  */

  async deleteStory(storyId, user) {
    const token = user.loginToken;

    //Sends axios delete method to API/storyId endpoint
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    });

    //Remove deleted story from stories array in StoryList
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    //Call functions to remove story from User. own story and favorite pages
    user.removeFromOwnStory(storyId);
    user.removeFromFavorites(storyId);
  }
}


/******************************************************************************
 * USER: CLASS: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Favourite and Unfavorite Story Functions
   * - add feature to mark/unmark favourite
   * - token for user instance
   * - API favorite parameters: username, storyId. Post
   * - API unfavorite parameters: username, storyId. Delete
   */

  async favoritedStory(story) {
    const token = this.loginToken;

    //Axios method to post a favorite action to the API
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "POST",
      data: { token },
    });

    //adds story to favorites array
    this.favorites.push(story);
  }

  //Unfavorites a story that was previously favorited
  async deleteFavoriteStory(story) {
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token },
    });

    //removes story from favorite array 
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
  }

  // Determines favorite status: returns true if story id is present user.favorites, false if no
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }

  //For Storylist Class deleteStory() function:
  /** Remove Story From Favorite Page and OwnStories when user deletes a story
      - method that is called from the StoryList class to filter/delete a given story from pages related to user*/
      
  removeFromFavorites(storyId) {
    this.favorites = this.favorites.filter(story => story.storyId !== storyId);
  }

  /** Remove Story Method From OwnStories Page */
  removeFromOwnStory(storyId) {
    this.ownStories = this.ownStories.filter(story => story.storyId !== storyId);
  }
}
















