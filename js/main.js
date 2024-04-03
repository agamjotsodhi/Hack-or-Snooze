"use strict";

// Linked Html elements
// So we don't have to keep re-finding things on page, find DOM elements once:

// html body content
const $body = $("body");

//3 main story lists
const $listOfStories = $(".stories-list");
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

//Main story related elements
const $storiesLoadingMsg = $("#stories-loading-msg");
const $storiesContainer = $("#stories-container");
const $allStoriesList = $("#all-stories-list");
const $myStoriesList = $("#my-stories-list");
const $favoriteStoriesList = $("#favorite-stories-list");

//add new story submission form
const $addStoryForm = $("#add-story");

//Main nav bar page links
const $navSubmitStory = $("#nav-submit-story"); //submit btn
const $navFavorites = $("#nav-my-favorites"); // my favorites btn
const $navMyStories = $("#nav-my-stories"); // my stories btn

//Nav right bar links 
const $navLogin = $("#nav-login"); //login/signup btn
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout"); //logout btn


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $listOfStories,
    $loginForm,
    $signupForm,
    $addStoryForm,
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
