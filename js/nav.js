"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

//Displays all stories when clicked 

function navAllStories(event) {
  console.debug("navAllStories", event);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(event) {
  console.debug("navLoginClick", event);
  hidePageComponents();
  $storiesContainer.hide(); //hides stories from login page
  $loginForm.show()
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

// Show the add story form after clicking on nav bar: submit btn

function navAddStoryClick(event) {
  console.debug("navAddStoryClick", event);
  hidePageComponents();
  $addStoryForm.show();
  $allStoriesList.show();

}

$navSubmitStory.on("click", navAddStoryClick);

//Show all user favorited stories after clicking on nav bar: my favorites btn

function navFavoritesClick(event) {
  console.debug("navFavoritesClick", event);

  hidePageComponents();
  displayFavoriteList();
}

$body.on("click", "#nav-my-favorites", navFavoritesClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-user-links").css('display', 'flex');
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//Show all of user inputed stories after clicking on nav bar: my stories btn

function navMyStoriesClick(event) {
  console.debug("navMyStories", event);

  $myStoriesList.show();
  hidePageComponents();
  displayMyStoriesList();
}

$body.on("click", "#nav-my-stories", navMyStoriesClick);

