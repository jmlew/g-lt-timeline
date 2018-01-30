

/**
 * A time range in MS within which the launches are confined.
 * @record
 */
function TimeRange() {};

/** @type {number} Time in MS for the minimum point in the timeline. */
TimeRange.prototype.min;

/** @type {number} Time in MS for the maximum point in the  timeline. */
TimeRange.prototype.max;


/**
 * @typedef {{
 *   date: number,
 *   color: string
 * }}
 */
let TimelineTimePoint;


/**
 * @typedef {{
 *   name: string,
 *   launchId: string,
 *   points: !Array<!TimelineTimePoint>
 * }}
 */
let TimelineLaunch;


/**
 * @typedef {{
 *   label: string,
 *   launches: !Array<!TimelineLaunch>
 * }}
 */
let TimelineCategory;


class TimelineService {

  /**
   * @constructor
   * @ngInject
   */
  constructor() {
    /**
     * Time range within which the launches are confined.
     * @private {!TimeRange|undefined}
     */
    this.timeRange_;

    /** @private {!Array<!TimelineRow>|undefined} */
    this.data_;
  }

  /**
   * Initialize the service with the collection of launches and time range.
   * @param {!Array<!lt.model.Launch>} launches
   * @param {string} categoryProperty
   */
  initLaunches(launches, categoryProperty) {
    if (!this.timeRange_) {
      throw new Error('Time range has not been set.');
    }
    this.data_ = this.createTimelineCategories_(launches, categoryProperty);
    console.log('this.data_: ', this.data_);
  }

  /**
   *
   * @param {!Array<!lt.model.Launch>|undefined} launches
   * @param {string} categoryProperty
   * @return {!Array<!TimelineCategory>}
   * @private
   */
  createTimelineCategories_(launches, categoryProperty) {
    var categories = [];
    launches.forEach((launch) => {
      var timelineLaunch = this.createTimelineLaunch_(launch);
      if (timelineLaunch) {
        var categoryLabel =
            this.getCategoryLabel_(launch.categoryList, categoryProperty);
        if (categoryLabel) {
          var category =
              this.getTimelineCategory_(categoryLabel, categories) ||
              this.createTimelineCategory_(categoryLabel, categories);
          category.launches.push(timelineLaunch);
        }
      }
    });
    goog.array.sortObjectsByKey(categories, 'label');
    return categories;
  }

  /**
   * [createTimelineLaunch_ description]
   * @param {!lt.model.Launch>} launch
   * @return {?TimelineLaunch}
   * @private
   */
  createTimelineLaunch_(launch) {
    if (!this.isLaunchWithinVisibleRange_(launch)) return null;

    var points = [];
    if (launch.details.alphaDate) {
      points.push({
        date: launch.details.alphaDate,
        color: Color.ALPHA
      });
    }
    if (launch.details.betaDate) {
      points.push({
        date: launch.details.betaDate,
        color: Color.BETA
      });
    }
    if (launch.details.launchDate) {
      points.push({
        date: launch.details.launchDate,
        color: Color.PRIMARY_900
      });
    }

    if (points.length == 0) return null;

    // Ensure points are ordered by date.
    goog.array.sortObjectsByKey(points, 'date');
    return {
      name: launch.details.name,
      launchId: launch.launchId,
      points: points
    }
  }

  /**
   * [createTimelineCategory_ description]
   * @param {string} label
   * @param {!Array<!lt.model.ProductCategory>=} categories Optional collection
   *    to which the category is added.
   * @return {!TimelineCategory}
   * @private
   */
  createTimelineCategory_(label, categories) {
    var category = {
      label: label,
      launches: [],
    };
    if (categories) {
      categories.push(category);
    }
    return category;
  }


  /**
   * Returns a category which matches a given label.
   * @param {string} label Label with which to match categories.
   * @param {!Array<?TimelineCategory>} categories Collection to reference.
   * @return {?TimelineCategory}
   * @private
   */
  getTimelineCategory_(label, categories) {
    return categories.find((category) => category.label == label);
  }

  /**
   * Returns the category label for a given launch category list.
   * Loops through each category until it finds a product.
   * @param {!Array<!lt.model.ProductCategory>} categoryList
   * @param {string} categoryProperty
   * @return {?string}
   * @private
   */
  getCategoryLabel_(categoryList, categoryProperty) {
    const category = categoryList.find((category) => category[categoryProperty]);
    return category[categoryProperty] || null;
  }

  /**
   * Returns whether the launch has any milestones within visible range.
   * @param {!lt.model.Launch} launch
   * @return {boolean}
   * @private
   * @private
   */
  isLaunchWithinVisibleRange_(launch) {
    var times = [];
    if (launch.details.alphaDate) times.push(launch.details.alphaDate);
    if (launch.details.betaDate) times.push(launch.details.betaDate);
    if (launch.details.launchDate) times.push(launch.details.launchDate);

    if (times.length == 0) return false;

    // We want at least one point in bounds, or intersection across bounds.
    var max = Math.max.apply(Math, times);
    var min =  Math.min.apply(Math, times);
    return (max >= this.timeRange_.min && min <= this.timeRange_.max);
  }

  /**
   * Sets the date range within which to display the launches. If beginning and
   * ending times aren't set, it will use the min/max from
   * the data. However normally we want to be explicit because we'll want to
   * see the entire time range to correlate with the search range.
   * @param {number|undefined} min
   * @param {number|undefined} max
   */
  setTimeRange(min, max) {
    // If the range is less than a month, expand it so we see some dates.
    if (min && max &&
        max - min < Time.MONTH_MS * 2) {
      min -= Time.MONTH_MS;
      max += Time.MONTH_MS;
    }
    this.timeRange_ = {min: min, max: max};
  }

  /**
   * Returns te time range.
   * @return {!TimeRange}
   */
  getTimeRange() {
    return this.timeRange_;
  }

  /**
   * Returns a timescale to span a given width.
   * @param {number} width
   * @return {d3.scaleTime}
   */
  createTimeScale(width) {
    const timeRange = [
      new Date(this.timeRange_.min),
      new Date(this.timeRange_.max)
    ];
    const timeScale = d3.scaleTime()
        .domain(timeRange)
        .range([0, width]);

    return timeScale;
  }

  /**
   * Converts a rect to a box.
   * @param {!{x:number, y:number, width:number, height:number}} rect
   * @return {goog.math.Box} Box
   * @export
   */
  rectToBox(rect) {
    return new goog.math.Box(
        rect.y, rect.x + rect.width, rect.y + rect.height, rect.x);
  }

  /**
   * Getter for the data.
   * @return {!Array<!TimelineRow>}
   */
  getData() {
    return this.data_;
  }
};

/** @enum {number} */
const Time = {
  MONTH_MS: 2629746000
};

/**
 * Values for text-anchor property.
 * @enum {string}
 */
const TextAnchor = {
  START: 'start',
  END: 'end',
  MIDDLE: 'middle'
};

/**
 * Values for the positions of the outlines.
 * @enum {string}
 */
const Position = {
  LEFT: 'left',
  RIGHT: 'right',
  MIDDLE: 'middle'
};



lt.root.reporting.timeline.timelineServiceModule =
  angular.module('lt.root.reporting.timeline.timelineServiceModule', [])
      .service('timeline', TimelineService);
