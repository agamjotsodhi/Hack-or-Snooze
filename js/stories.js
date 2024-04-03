"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
// Flag to indicate whether the current page is the user's stories page for remove button
let isUserStoriesPage = false;

/** Get and showcase stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * General blueprint on how each story post is laid out
 * Returns the markup for the story.  */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName(); //getHostName from models.js, Story class
  const isUserLoggedIn = Boolean(currentUser);
  //Boolean value helps determine wheter to display buttons below
  const removeBtnHtml = isUserLoggedIn && isUserStoriesPage ? makeHTMLRemoveButton() : ""; 
  const starBtnHtml = isUserLoggedIn ? makeHTMLStarButton(currentUser, story) : "";

  return $(`
      <li id="${story.storyId}">
        <div>
        ${removeBtnHtml}
        ${starBtnHtml}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

/********************************************************************************** */
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  isUserStoriesPage = false; // Not the user's stories page

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/********************************************************************************** */
//newStorySubmission is the markup for when a user adds/submits a new story post
async function newStorySubmission(event) {
  console.debug("newStorySubmission");
  //prevents page reload
  event.preventDefault();

  //get user inputed new form values
  const title = $('#new-title').val();
  const url = $('#new-url').val();
  const author = $('#new-author').val();
  const username = currentUser.username;

  //make object to hold new data
  const storyData = {
    title,
    url,
    author,
    username,
  };

  try {
    // Call addStory
    const story = await storyList.addStory(currentUser, storyData);
    console.log("New Story:", story);

    // Story markup
    const $story = generateStoryMarkup(story);

    // Add story markup to all of the other stories in the list
    $allStoriesList.prepend($story);

    // Display the user's stories list
    await displayMyStoriesList();

    //Reset Form after submit
    $addStoryForm[0].reset(); // Resetting the form
    
  } catch (error) {
    console.error("Error adding story:", error);
  }
}

//Jquery form submission listener
$addStoryForm.on("submit", newStorySubmission);

/********************************************************************************** */
/** Handle deleting a story. */
//deleteStory from models 

async function removeMyStory(event) {
  console.debug("removeMyStory");

  // current target is the user clicked button 
  const $userClick = $(event.currentTarget);
  // find closest li element 
  const $closestLi = $userClick.closest("li");
  //extracts and reads story Id from story li
  const storyId = $closestLi.attr("id");

  //calls deleteStory method from models.js/storyList class
  await storyList.deleteStory(storyId, currentUser);
  // re-generate story list
  await displayMyStoriesList();
  //removes deleted story from DOM
  $closestLi.remove();
  //put remove button on page
}

//Event listener to remove stories on myStories page
$myStoriesList.on("click", ".deleted-stories", removeMyStory);

/** Make delete button HTML for story */
//Markup a delete html button for the program to use

function makeHTMLRemoveButton() {
  return `
    <button class="deleted-stories">
      <div class="fas fa-trash-alt"></div>
    </button>`;
}

/********************************************************************************** */
//Put the favorites on page
//display list of current users favorited stories 

function displayFavoriteList() {
  console.debug("displayFavoriteList");

  isUserStoriesPage = false;

  //if 'favorites' array is = to 0,  display and append message 
  if (currentUser.favorites.length === 0) {
    $favoriteStoriesList.append("<p>No stories have been favorited yet. Press the favorite star next to a story!</p>");
  } else {

    //clears previous content 
    $favoriteStoriesList.empty();

    // loops and generates HTML for each user favorited story in the list
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }
  }

  $favoriteStoriesList.show(); //shows favorite stories from html/main.js
}

/** Make favorite/not-favorite star for story */
//generates html markup for star icon, provides favorite logic per story. considers the user too 

function makeHTMLStarButton(user, story) {
  // calls method from User class/models.js
  const isFavorite = user.isFavorite(story);
  //starResult says true = "fas" and "far is false"
  const starResult = isFavorite ? "fas" : "far";

  return `<div class="star"> 
    <i class="${starResult} fa-star"></i></div>`;
}

//Favorite Star Toggle 

async function FavoriteStarToggleClick(evt) {
  console.debug("FavoriteStarToggleClick");

  const storyId = evt.target.closest("li").id;
  const story = storyList.stories.find(s => s.storyId === storyId);

  if (currentUser.isFavorite(story)) {
    await currentUser.deleteFavoriteStory(story);
  } else {
    await currentUser.favoritedStory(story);
  }

  evt.target.closest("i").classList.toggle("fas");
  evt.target.closest("i").classList.toggle("far");
}

$listOfStories.on("click", ".star", FavoriteStarToggleClick);


/********************************************************************************** */

//Put the users stories on Page
function displayMyStoriesList() {
  console.debug("displayMyStoriesList");

  isUserStoriesPage = true;

  //if 'my stories' array is = to 0, display and append message 
  //currentUser.myStoriesList
  if (currentUser.ownStories.length === 0) {
    $myStoriesList.append("<p>No stories have been added yet. Press 'Submit' in nav bar to submit a story!</p>");
  } else {

    //clears previous content 
    $myStoriesList.empty();

    // loop and generate HTML for each user story, mark it as user's story and append to myStoriesList 
    currentUser.ownStories.forEach(story => {
      const $story = generateStoryMarkup(story);
      $myStoriesList.append($story);
    });
  }
  $myStoriesList.show();
}


