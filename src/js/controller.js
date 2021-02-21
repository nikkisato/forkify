import * as model from './model';
require('dotenv').config();
import recipeView from './views/recipeView.js';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import { MODAL_CLOSE_SEC } from './config';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
//if (module.hot) {
//  module.hot.accept();
//}
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    //updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //1) Loading recipe
    await model.loadRecipe(id);

    //2) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.log(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    console.log(query);
    //2 load search results
    await model.loadSearchResults(query);
    //3) render results
    resultsView.render(model.getSearchResultsPage());
    model.loadSearchResults(resultsView.render(model.getSearchResultsPage()));
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1) Render New Results
  resultsView.render(model.getSearchResultsPage(gotToPage));
  //2) Render New Pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings
  model.updateServings(newServings);

  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2) update recipe view
  recipeView.update(model.state.recipe);

  //3) render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    //render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    //change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
