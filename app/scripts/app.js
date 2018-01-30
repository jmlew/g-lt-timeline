var lt = {
  root: {
    reporting: {
      timeline: {},
    }
  }
};

var App = window.App = angular.module('App',
  [
    'ngMaterial',
    'lt.root.reporting.reportingModule',
  ]
);
