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

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Box');


/**
 * @typedef {{
 *   min: number|undefined,
 *   max: number|undefined
 * }}
 */
let DateRange;

/**
 * A data category which defines how the data should be categorized.
 * @record
 */
class DataCategory {
  constructor() {
    /** @type {string} */
    this.name;
    /** @type {string} */
    this.value;
  }
}

/**
 * Controller for the component.
 */
class TimelineController {
  /**
   * @constructor
   * @param {!angular.$timeout} $timeout
   * @param {!lt.root.reporting.timeline.TimelineService} timeline
   * @ngInject
   */
  constructor($timeout, timeline) {

    /**
     * Indicates whether this component is the currently selected tab. Provided
     * via binding.
     * @type {boolean|undefined}
     */
    this.isCurrentTab;

    /**
     * Launches, set via binding.
     * @type {!Array<!lt.model.Launch>|undefined}
     */
    this.launches;

    /**
     * Options from which the data categories are chosen.
     * @export {!Array<!DataCategory>}
     */
    this.categoryOptions = [
      {name: 'Products', value: 'product'},
      {name: 'Features', value: 'feature'},
    ];

    /**
     * Category name with which to categorize the launches.
     * @type {!DataCategory}
     */
    this.currentCategory = this.categoryOptions[0];

    /**
     * Options by which the chart size can be chosen.
     * @type {!Array<string>}
     */
    this.chartSizeOptions = [800, 1200, 1800, 2400];

    /**
     * Sizes with which to render the charts.
     * @type {string}
     */
    this.currentChartSize = this.chartSizeOptions[1];

    /**
     * Time in MS for the start and end of the timeline, set via binding.
     * @type {!DateRange|undefined}
     */
    this.dateRange;

    /** @private {d3.scaleTime|undefined} */
    this.timeScale_;

    /** @private {!lt.root.reporting.timeline.TimelineService} */
    this.timeline_ = timeline;

    /** @private {!d3.selection|undefined} */
    this.elementChart_;

    /** @private {!d3.selection|undefined} */
    this.elementAxis_;

    /** @private {!angular.$timeout} */
    this.timeout_ = $timeout;
  }

  /**
   * Called when bindings change.
   * @param {!Object} change
   */
  $onChanges(change) {
    let launches = change.launches && change.launches.currentValue;
    if (Array.isArray(launches)) {
      if (this.isCurrentTab) {
        this.render_();
      } else {
        // Render on the next digest cycle when component is not visible.
        this.timeout_(this.render_.bind(this));
      }
    }
  }

  /**
   * Renders the component view.
   * @private
   */
  render_() {
    this.elementChart_ = d3.select('.' + Selector.CHART);
    this.elementAxis_ = d3.select('.' + Selector.AXIS);
    this.destroyTimeline_();
    this.initTimeline_();
    this.createChart_();
    this.createAxis_();
  }

  /**
   * Updates the current category option.
   */
  onUpdateCategory() {
    this.render_();
  }

  /**
   * Updates the current chart size.
   */
  onUpdateChartSize() {
    this.render_();
  }

  /**
   * Destroys the existing timeline.
   * @private
   */
  destroyTimeline_() {
    this.elementChart_.selectAll('*').remove();
    this.elementAxis_.selectAll('*').remove();
  }

  /**
   * Sets up the d3 timeline plugin.
   * @private
   */
  initTimeline_() {
    this.timeline_.setTimeRange(this.dateRange.min, this.dateRange.max);
    this.timeline_.initLaunches(
        goog.asserts.assert(this.launches), this.currentCategory.value);
    this.timeScale_ =
        this.timeline_.createTimeScale(this.currentChartSize);
  }

  /**
   * Creates the timeline chart.
   */
  createChart_() {
    this.elementChart_
        .style(Style.WIDTH,
            this.currentChartSize +
            Dimension.WIDTH_CATEGORY_LABEL +
            Dimension.WIDTH_TIMELINE_LEFT_BORDER +
            Dimension.BORDER_SIZE + UnitType.PX)
        ;

    const categoryResultsSvg = this.createCategories_();
    const launchSvgGroup = this.createLaunches_(categoryResultsSvg);
    this.createLaunchPointCircles_(launchSvgGroup);
    this.createLaunchPointLines_(launchSvgGroup);
    this.createLaunchLabels_(launchSvgGroup);
  }

  /**
   * Creates categories.
   * @return {!d3.selection}
   */
  createCategories_() {
    const divCategory = this.elementChart_.selectAll(Tag.DIV)
        .data(this.timeline_.getData())
        .enter()
        .filter((category) => category.launches.length > 0)
        .append(Tag.DIV)
        .style(Style.OPACITY, 0)
        .style(Style.BORDER_LEFT, this.getBorder_(
            Dimension.WIDTH_TIMELINE_LEFT_BORDER, Color.PRIMARY_800));

    divCategory.attr(Attribute.CLASS, Selector.CHART_CATEGORY)
        .transition()
        .duration(500)
        .delay((item, index) => {
          return index * 100;
        })
        .style(Style.OPACITY, 1);
        ;

    const divCategoryLabel = divCategory.append(Tag.DIV)
        .attr(Attribute.CLASS, Selector.CHART_CATEGORY_LABEL)
        .text((category) => {return category.label})
        .style(Style.WIDTH, Dimension.WIDTH_CATEGORY_LABEL + UnitType.PX)
        ;

    const categoryResultsSvg = divCategory.append(Tag.DIV)
        .attr(Attribute.CLASS, Selector.CHART_CATEGORY_RESULTS)
        .style(Style.WIDTH, this.currentChartSize  + UnitType.PX)
        .append(Tag.SVG)
        .attr(Attribute.HEIGHT, (category) => {
          return (category.launches.length * Dimension.HEIGHT_LAUNCH);
        })
        .attr(Attribute.WIDTH, this.currentChartSize)
        ;

    return categoryResultsSvg;
  }

  /**
   * Creates launches collection.
   * @param {!d3.selection} categoryResultsSvg Category result SVG selection.
   * @return {!d3.selection}
   */
  createLaunches_(categoryResultsSvg) {
    const launchSvgGroup = categoryResultsSvg.selectAll(Tag.G)
        .data((category) => category.launches)
        .enter()
        .append(Tag.G);

    launchSvgGroup.attr(Attribute.CLASS, Selector.CHART_LAUNCH)
        .attr(Attribute.TRANSFORM, (launches, index) => {
          const yValue =
              (index * Dimension.HEIGHT_LAUNCH) +
              (Dimension.HEIGHT_LAUNCH * .5);
          return this.getTranslate_(0, yValue);
        })
        ;

    return launchSvgGroup;
  }

  /**
   * Creates launch circles representing dates.
   * @param {!d3.selection} launchSvgGroup Launch SVG group selection.
   * @return {!d3.selection}
   */
  createLaunchPointCircles_(launchSvgGroup) {
    const classContext = this;

    const pointLaunch = launchSvgGroup.selectAll(Tag.CIRCLE)
        .data((launch) => launch.points)
        .enter()
        .append(Tag.CIRCLE);

    pointLaunch.attr(Attribute.CLASS, Selector.CHART_LAUNCH_CIRCLE)
        .attr(Attribute.CX, (point, index) => this.timeScale_(point.date))
        .attr(Attribute.R, Dimension.CIRCLE_SIZE)
        .attr(Attribute.FILL, (point) => point.color)
        .on(Event.MOUSE_OVER, function(point, index) {
          classContext.createHoverInfoPanel_(this, point);
        })
        .on(Event.MOUSE_OUT, function(point, index) {
          const launch = d3.select(this.parentNode);
          const circle = d3.select(this);

          circle.attr(Attribute.R, Dimension.CIRCLE_SIZE);
          launch.select('.' + Selector.CHART_LAUNCH_HOVER).remove();
        })
        .on(Event.CLICK, function(point, index) {
          const launchData = d3.select(this.parentNode).datum();
          classContext.viewLaunchInfo_(launchData.launchId);
        })
  }

  /**
   * Creates an info panel and adds to the launch element.
   * @param {Element} circleSvg Circle SVG element.
   * @param {!TimelineTimePoint} point
   */
  createHoverInfoPanel_(circleSvg, point) {
    const circle = d3.select(circleSvg);
    const launch = d3.select(circleSvg.parentNode);
    const category = d3.select(circleSvg.parentNode.parentNode);
    const circleX = parseInt(circle.attr(Attribute.CX));
    const panelX = (circleX >= this.currentChartSize - circleX) ?
        circleX - Dimension.WIDTH_INFO_PANEL - Dimension.LAUNCH_INFO_SPACER :
        circleX + Dimension.LAUNCH_INFO_SPACER;
    const panelY = - parseInt(Dimension.HEIGHT_INFO_PANEL / 2);

    var infoPanelSvg = launch.append(Tag.SVG)
        .attr(Attribute.CLASS, Selector.CHART_LAUNCH_HOVER)
        .attr(Attribute.WIDTH, Dimension.WIDTH_INFO_PANEL)
        .attr(Attribute.HEIGHT, Dimension.HEIGHT_INFO_PANEL)
        .attr(Attribute.X, parseInt(panelX))
        .attr(Attribute.Y, parseInt(panelY))
        ;

    infoPanelSvg.append(Tag.RECT)
        .attr(Attribute.WIDTH,  Dimension.WIDTH_INFO_PANEL - 2)
        .attr(Attribute.HEIGHT, Dimension.HEIGHT_INFO_PANEL - 2)
        .attr(Attribute.FILL, Color.WHITE)
        .attr(Attribute.STROKE, Color.GREY_400)
        .attr(Attribute.STROKE_WIDTH, 1)
        .attr(Attribute.X, 1)
        .attr(Attribute.Y, 1)
        ;

    infoPanelSvg.append(Tag.TEXT)
        .attr(Attribute.TEXT_ANCHOR, TextAnchor.MIDDLE)
        .attr(Attribute.X, Dimension.WIDTH_INFO_PANEL / 2)
        .attr(Attribute.Y, Dimension.HEIGHT_INFO_PANEL / 2 + 4)
        .attr(Attribute.FILL, Color.GREY_900)
        .text(new Date(point.date).toDateString())
        ;

    circle.attr(Attribute.R, Dimension.CIRCLE_SIZE * 1.5);
  }

  /**
   * Creates launch lines connecting dates.
   * @param {!d3.selection} launchSvgGroup Launch SVG group selection.
   */
  createLaunchPointLines_(launchSvgGroup) {
    const classContext = this;
    launchSvgGroup.filter((launch) => launch.points.length > 1)
        .insert(Tag.LINE, Tag.CIRCLE)
        .attr(Attribute.X1, function(launch) {
          return classContext.timeScale_(launch.points[0].date);
        })
        .attr(Attribute.X2, (launch) => {
          return classContext.timeScale_(
                launch.points[launch.points.length - 1].date);
        })
        .attr(Attribute.STROKE, Color.GREY_300)
        .attr(Attribute.STROKE_WIDTH, 1)
        ;
  }


  /**
   * Creates launch labels.
   * @param {!d3.selection} launchSvgGroup Launch SVG group selection.
   */
  createLaunchLabels_(launchSvgGroup) {
    const classContext = this;
    launchSvgGroup.insert(Tag.TEXT, Tag.CIRCLE)
        .filter((launch) => launch.name)
        .text((launch) => launch.name)
        .attr(Attribute.CLASS, Selector.CHART_LAUNCH_LABEL)
        .attr(Attribute.FILL, Color.GREY_900)
        .attr(Attribute.X, function(launch) {
          return classContext.positionLaunchLabel_(d3.select(this), launch);
        })
        .attr(Attribute.Y, (launch) => {
          return Dimension.CIRCLE_SIZE * .5;
        })

        ;
  }

  /**
   * Returns a position for the launch label which allows it to fit around the
   * circle bounds and within the outer timeline bounds....
   * @param {!d3.selection} label Label SVG text selection.
   * @param {!TimelineLaunch} launch
   * @return {number}
   */
  positionLaunchLabel_(label, launch) {

    const labelNode = label.node();
    const labelWidth = labelNode.getBBox().width;
    const containerWidth = this.currentChartSize;
    const circlePositions = launch.points.map(
        (point) => this.timeScale_(point.date));

    // Try fitting between the container left edge and the first circle.
    let padding = Dimension.LAUNCH_LABEL_SPACER * 2 + Dimension.CIRCLE_SIZE;
    let availableWidth = circlePositions[0] - 0;
    if (labelWidth <= availableWidth - padding) {
      labelNode.setAttribute(Attribute.TEXT_ANCHOR, TextAnchor.END);
      return circlePositions[0] -
          Dimension.LAUNCH_LABEL_SPACER - Dimension.CIRCLE_SIZE;
    }

    // Try fitting between the last circle and the container right edge.
    availableWidth =
        containerWidth - circlePositions[circlePositions.length - 1];
    if (labelWidth <= availableWidth - padding) {
      labelNode.setAttribute(Attribute.TEXT_ANCHOR, TextAnchor.START);
      return circlePositions[circlePositions.length - 1] +
          Dimension.LAUNCH_LABEL_SPACER + Dimension.CIRCLE_SIZE;
    }

    // Try fitting between the first and second circle.
    padding = Dimension.LAUNCH_LABEL_SPACER * 2 + Dimension.CIRCLE_SIZE * 2;
    if (circlePositions.length > 1) {
      availableWidth = circlePositions[1] - circlePositions[0];
      if (labelWidth <= availableWidth - padding) {
        labelNode.setAttribute(Attribute.TEXT_ANCHOR, TextAnchor.MIDDLE);
      return circlePositions[0] +
          Dimension.LAUNCH_LABEL_SPACER + Dimension.CIRCLE_SIZE;
      }
    }

    // Try fitting between the second and third circle.
    if (circlePositions.length > 2) {
      availableWidth = circlePositions[2] - circlePositions[1];
      if (labelWidth <= availableWidth - padding) {
        labelNode.setAttribute(Attribute.TEXT_ANCHOR, TextAnchor.MIDDLE);
      return circlePositions[1] +
          Dimension.LAUNCH_LABEL_SPACER + Dimension.CIRCLE_SIZE;
      }
    }

    // Add the width to the positions to create an array of points.
    circlePositions.push(containerWidth);
    return this.truncatedLaunchLabelPosition_(label, circlePositions);
  }

  /**
   * Indicates whether the label width is less than the bounds defined by the
   * start position and end position.
   * @param {number} labelWidth
   * @param {number} startPosition
   * @param {number} endPosition
   * @param {number} padding
   * @return {boolean}
   */
  doesLaunchLabelFit_(labelWidth, startPosition, endPosition, padding) {
    var areaWidth = endPosition - startPosition - padding;
    return (labelWidth <= areaWidth);
  }

  /**
   * Truncates the launch label to a length which allows it to fit into the
   * largest area between any two given positions and returns its new position.
   * @param {!d3.selection} label Label SVG text selection.
   * @return {number} Position for the label.
   */
  truncatedLaunchLabelPosition_(label, positions) {
    // Calculate the greatest area between points and the container width.
    const availableArea = (
        /** @type{{value: number, index: number}} */ positions.reduce(
        (accumulator, value, index, array) => {
          if (index == 0) return {value: value, index: index};
          const areaBetweenPoints = value - array[index - 1];
          return (areaBetweenPoints > accumulator.value) ?
              {value: areaBetweenPoints, index: index - 1} :
              {value: accumulator.value, index: index};
        }, 0));

    // Truncate the text until it fits into the available width.
    const elipsisWidth = 12;
    const padding = Dimension.LAUNCH_LABEL_SPACER + Dimension.CIRCLE_SIZE;
    const availableWidth = availableArea.value - padding - elipsisWidth;
    let limit = 100;
    while(limit > 0 && label.node().getBBox().width > availableWidth) {
      label.text(label.text().substring(0, label.text().length - 2));
      limit --;
    }
    label.text(label.text() + '...');
    return positions[availableArea.index] + padding;
  }

  /**
   * Creates the horizontal axis and vertical tick lines.
   */
  createAxis_() {
    const yAxis = this.elementChart_.property(
          Property.CLIENT_HEIGHT);
    const yAxisOffset = 14;

    const axisChart = d3.axisBottom(this.timeScale_)
        .tickFormat(d3.timeFormat('%b \'%y'))
        .tickSize(yAxis)
        ;

    this.elementAxis_.style(Style.LEFT,
        Dimension.WIDTH_CATEGORY_LABEL +
        Dimension.WIDTH_TIMELINE_LEFT_BORDER + UnitType.PX)
        ;

    const svgAxis = this.elementAxis_.append(Tag.SVG)
        .attr(Attribute.HEIGHT, yAxis + yAxisOffset * 2)
        .attr(Attribute.WIDTH, this.currentChartSize)
        .append(Tag.G)
            .attr(Attribute.TRANSFORM, this.getTranslate_(0, 0))
            .call(axisChart)
            ;

    // Adjust axis labels position.
    svgAxis.selectAll('.tick text')
        .attr(Attribute.Y, yAxis + yAxisOffset)
        ;

    // const timeRange = this.timeline_.getTimeRange();
    // const utcMonths = d3.utcMonths(timeRange.min, timeRange.max);
  }

  viewLaunchInfo_(launchId) {
    console.log('launchId: ', launchId);
  }

  /**
   * Returns a translation string.
   * @param {number} xValue
   * @param {number} yValue
   */
  getTranslate_(xValue, yValue) {
    return 'translate(' + xValue + ',' + yValue + ')';
  }

  /**
   * Returns a translation string.
   * @param {number} size
   * @param {number} color
   */
  getBorder_(size, color) {
    return size + 'px solid ' + color;
  }

};

/** @enum {string} */
const UnitType = {
  PX: 'px',
  PERCENT: '%',
};

/** @enum {string} */
const Property = {
  CLIENT_HEIGHT: 'clientHeight',
  CLIENT_WIDTH: 'clientWidth',
};

/** @enum {string} */
const Event = {
  MOUSE_OVER: 'mouseover',
  MOUSE_OUT: 'mouseout',
  CLICK: 'click',
};

/** @enum {string} */
const Selector = {
  CONTAINER: 'lt-timeline-container',
  CHART: 'lt-timeline-chart',
  AXIS: 'lt-timeline-axis',
  CHART_CATEGORY: 'chart-category',
  CHART_CATEGORY_LABEL: 'category-label',
  CHART_CATEGORY_RESULTS: 'category-results',
  CHART_LAUNCH: 'chart-launch',
  CHART_LAUNCH_LABEL: 'chart-launch-label',
  CHART_LAUNCH_CIRCLE: 'chart-launch-circle',
  CHART_LAUNCH_HOVER: 'chart-launch-hover',
};

/** @enum {string} */
const Tag = {
  CIRCLE: 'circle',
  LINE: 'line',
  DIV: 'div',
  G: 'g',
  P: 'p',
  RECT: 'rect',
  SVG: 'svg',
  TEXT: 'text',
};

/** @enum {string} */
const Attribute = {
  CLASS: 'class',
  CX: 'cx',
  CY: 'cy',
  FILL: 'fill',
  HEIGHT: 'height',
  LEFT: 'left',
  R: 'r',
  STROKE: 'stroke',
  STROKE_WIDTH: 'stroke-width',
  TRANSFORM: 'transform',
  TEXT_ANCHOR: 'text-anchor',
  VIEW_BOX: 'viewBox',
  WIDTH: 'width',
  X1: 'x1',
  X2: 'x2',
  X: 'x',
  Y1: 'y1',
  Y2: 'y2',
  Y: 'y',
};

/** @enum {string} */
const Style = {
  BORDER_LEFT: 'border-left',
  HEIGHT: 'height',
  LEFT: 'left',
  OPACITY: 'opacity',
  WIDTH: 'width',
  FILL: 'fill',
};

/** @enum {number} */
const Dimension = {
  BORDER_SIZE: 1,
  CIRCLE_SIZE: 7,
  HEIGHT_LAUNCH: 30,
  LAUNCH_INFO_SPACER: 15,
  LAUNCH_LABEL_SPACER: 5,
  WIDTH_CATEGORY_LABEL: 150,
  WIDTH_INFO_PANEL: 110,
  HEIGHT_INFO_PANEL: 28,
  WIDTH_TIMELINE_LEFT_BORDER: 6,
};

/**
 * Color values of the circles.
 * @enum {string}
 */
const Color = {
  ALPHA: '#81D4FA',
  BETA: '#03A9F4',
  LAUNCH: '#0277BD',
  WHITE: '#fff',
  GREY_50: '#fafafa',
  GREY_100: '#f7f7f7',
  GREY_200: '#f1f1f1',
  GREY_300: '#e6e6e6',
  GREY_400: '#c9c9c9',
  GREY_500: '#aeaeae',
  GREY_600: '#888',
  GREY_700: '#747474',
  GREY_800: '#545454',
  GREY_900: '#2c2c2c',
  PRIMARY_500: '#03a9f4',
  PRIMARY_600: '#039be5',
  PRIMARY_700: '#0288d1',
  PRIMARY_800: '#0277bd',
  PRIMARY_900: '#01579b',
};

lt.root.reporting.timeline.timelineModule =
    angular.module('lt.root.reporting.timeline.timelineModule', [
      lt.root.reporting.timeline.timelineServiceModule.name])
      .component('ltTimeline', {
        templateUrl: './scripts/timeline/timeline.html',
        controller: TimelineController,
        bindings: {
          dateRange: '<',
          isCurrentTab: '<',
          launches: '<'
        }
    });




















/**
 * Controller for the component.
 */
class ReportingController {
  constructor() {
    /**
     * List of currently visible launhces to be shared across sub components.
     * @type {!Array<!lt.model.Launch>}
     */
    this.launches;

    /**
     * Date range calculated from date range filter values or launch results.
     * @type {!reporting.DateRange}
     */
    this.dateRange;

    this.init();
  }

  init() {
    this.dateRange = this.getSampleDateRange();
    this.launches = this.getSampleLaunches();
  }

  getSampleDateRange() {
    return {
      min: 1436631503000,
      max: 1531325903000
    }
  }

  getSampleLaunches() {
    return [
      {
        launchId: "GDS039",
        lastUpdated: 1475536788250,
        details: {
          name: "Visualization - new chart types and graphs",
          description: "",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS022",
        lastUpdated: 1487250288806,
        details: {
          name: "Extend Data Platform: Data Import (single file upload)",
          description: "Data Import allows users to upload CSV and TSV data and report on it using Data Studio. Data is stored in Google Cloud Storage. Users have the ability to append multiple files, as well as reuse data that has been previously uploaded.",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1483084800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ],
      },
      {
        launchId: "GAO010",
        lastUpdated: 1489409240376,
        details: {
          name: "Optimize: AW Integrations",
          description: "",
          launchDate: 1485849600000,
          fteImpact: {
            impacted: false,
            methodologyUrl: "",
            teamList: [],
            surfaceToClearinghouse: true
          },
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Audience & Remarketing"
          }
        ],
      },
      {
        launchId: "GDS003",
        lastUpdated: 1475536785368,
        details: {
          name: "Data Studio Analysis tool",
          description: "",
          launchDate: 1498809600000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS035",
        lastUpdated: 1475536788174,
        details: {
          name: "GA Cross Product Promo: Data Studio in GA",
          description: "Banner inside GA UI advertising Data Studio.",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1483084800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio Standard",
            feature: "Data Sources"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP062",
        lastUpdated: 1474685603794,
        details: {
          name: "DEBUG [360] Assistant aka Q&A",
          description: "DEBUG We are exposing an MVP of our tool that lets users query GA with natural language. Tool will be exposed to roughly ~100 external users. \n\nThe goal of this whitelist is to 1) gauge real-world usage, precision, and accuracy of the technology to understand how much work is left to release a public product and 2) understand user expectations for queries and this type of data analysis. \n\nInternal protoype at analyza-ga.googleplex.com.",
          launchDate: 1479196800000,
          alphaDate: 1456387200000,
          betaDate: 1475218800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Core Platform"
          }
        ]
      },
      {
        launchId: "GDS008",
        lastUpdated: 1475536785458,
        details: {
          name: "DCM Connector",
          description: "This feature allows Doubleclick Campaign Manager customers to view their data within Data Studio. DCM customers follow the same auth flow as all other Google Connectors. The user must specify their DCM user profile and Network ID. Data Studio will then display a subset of all the dimensions and metrics already available to DCM customers via the DCM external API. Users can use these dimensions and metrics to query for their data.\n\nWe are using a subset of the dimensions and metrics to ensure that the report returns data interactively. The dimensions and metrics that cause queries to be processed asynchronously will not be exposed.",
          launchDate: 1477987200000,
          alphaDate: 1446710400000,
          betaDate: 1477987200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS188",
        lastUpdated: 1476981699621,
        details: {
          name: "User Metrics in Standard Reporting (aka 'Users Everywhere')",
          description: "This launch works to add Users Metrics into our standard reporting.\n\nHighlights:\n\n- Segmentation: Updating picker to show \"All Users\" instead of \"All Sessions\" and calculating a percentage based on users\n\n- Add users metric to audience and acquisition reports: User metric will exist in the datatable as well as be the default for reports in the graph\n\n- Supporting user metric aggregation across arbitrary dimensions in backend (for performant queries)\n\n\nExamples (updates highlighted):\n\nAudience Overview: https://screenshot.googleplex.com/TrLWzV40DUR.png\n\nAudience Location Report: https://screenshot.googleplex.com/5FX85A5qPbv.png",
          launchDate: 1476086400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Core Platform"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "975d2338-2771-46be-a098-a9c39f511b9a",
        lastUpdated: 1489682280314,
        details: {
          name: "Proximity Targeting for Studio Dynamic",
          description: "This launch will allows us to support proximity targeting within dynamic creatives on the Platforms (in Studio).  The advertiser would enter a value representing location in the feed using Canonical Geo and specify a single desired radial distance from that location.  When a user is viewing an ad, we would calculate their exact location, and feed rows (and thus content) would be selected if they fit within the designated radius of the coordinates listed in the row.",
          launchDate: 1490914800000,
          fteImpact: {
            impacted: false,
            methodologyUrl: "",
            teamList: [],
            surfaceToClearinghouse: true
          },
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: "[360] Portal"
          }
        ],
      },
      {
        launchId: "GAO012",
        lastUpdated: 1475536793570,
        details: {
          name: "Optimize Measurement and Stats: Objectives Outside of GA",
          description: "",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Optimize 360",
            feature: "Data Processing"
          },
          {
            productFamily: "Analytics",
            product: "Optimize 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "AUC001",
        lastUpdated: 1487250288605,
        details: {
          name: "Audience Center 360 Public Launch",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1406880000000,
          betaDate: 1420099200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: "TV Attribution"
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP017",
        lastUpdated: 1475536771549,
        details: {
          name: "[360] GAP-DS Self Serve Linking",
          description: "",
          launchDate: 0,
          betaDate: 1498809600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP107",
        lastUpdated: 1474685858190,
        details: {
          name: "DEBUG [360] Single Sign-On Support + Dasher Integration, LDAP sync",
          description: "DEBUG ?",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Admin"
          }
        ]
      },
      {
        launchId: "GAP122",
        lastUpdated: 1475536771676,
        details: {
          name: "[Internal] Core Data reprocessing (via ICS)",
          description: "PRD: https://docs.google.com/document/d/17_o0VNrEfK_eHActuxPolSa8IDUVLenEDgOpbABNjY0/edit#heading=h.lgw09i7fn2v7",
          launchDate: 1477900800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP018",
        lastUpdated: 1481203505128,
        details: {
          name: "[360] Analytics 360 + DBM Self Serve Linking",
          description: "Support self-serve linking for GAP-DBM integrations in the dual-admin scenario. That is, allow the admin user of a GAP property (i.e. account with “Edit” permissions for the property) that also has appropriate permissions for a DBM Partner account to directly link accounts from the GA admin UI for reporting DBM data in GAP and for sharing GAP user lists with DBM.",
          launchDate: 1477900800000,
          betaDate: 1473408000000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          }
        ]
      },
      {
        launchId: "GAS235",
        lastUpdated: 1475536782747,
        details: {
          name: "Assistant aka Q&A",
          description: "We are exposing an MVP of our tool that lets users query GA with natural language. Tool will be exposed to roughly ~100 external users. \n\nThe goal of this whitelist is to 1) gauge real-world usage, precision, and accuracy of the technology to understand how much work is left to release a public product and 2) understand user expectations for queries and this type of data analysis. \n\nInternal protoype at analyza-ga.googleplex.com.",
          launchDate: 1479196800000,
          alphaDate: 1456387200000,
          betaDate: 1475481600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "SUI016",
        lastUpdated: 1475536771593,
        details: {
          name: "[360] Google for Work integration for 360 Suite",
          description: "Dasher integration, LDAP sync initially.\nSupport user policies, e.g. no @gmail.com users.\nSupport management of Suite User Groups.",
          launchDate: 1490947200000,
          alphaDate: 1480492800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS208",
        lastUpdated: 1476981697463,
        details: {
          name: "Audiences in Google Analytics Reporting",
          description: "Audiences in Google Analytics Reporting allows for:\n- Unsampled, user-based, date-range-agnostic segmentation in reporting\n- Reporting on Audiences as the basic currency for users in Enterprise Analytics",
          launchDate: 1476259200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "AdWords Integration"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS041",
        lastUpdated: 1475536788304,
        details: {
          name: "Embedded reports",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS212",
        lastUpdated: 1475536790724,
        details: {
          name: "Simplified Controls [New GA UI] (part of Reporting 2016)",
          description: "",
          launchDate: 1490947200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Core Platform"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "ADO035",
        lastUpdated: 1474685677280,
        details: {
          name: "DEBUG Attribution 360 ('Starfleet' Adometry rebuild)",
          description: "DEBUG ?",
          launchDate: 1490943600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: "Digital Attribution"
          }
        ]
      },
      {
        launchId: "GTM025",
        lastUpdated: 1475536796005,
        details: {
          name: "GTM: Nested Containers/Zones (Premium)",
          description: "",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Ecommerce"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "ADO028",
        lastUpdated: 1487250288923,
        details: {
          name: "Federation Phase 3 Launch: Piggyback on GA tags for Site Data",
          description: "[This is a follow-up launch to Ariane 139757 - Federation Phase 2: Use DCM tags for qualified new Adometry clients on Business Continuity platform]\n\nWith the launch of Federation Phase 2, Attribution 360/Adometry uses DCM for tracking impression and modified DCM floodlight tags for tracking landing urls and onsite conversions (such as buying a pair of shoes on nike.com). For customers who already have GA tags deployed on their site, it's redundant and unnecessary work to redeploy DCM floodlight tags because these things are already tracked by Google Analytics. Hence Phase 3 launch.\n\nPhase 3 of Federation (aka this launch) takes advantage of clients already deployed GA tags for gathering site/page data (landing urls, conversions on clients'' property). When combined with impression data via Phase 2 of Federation via DCM tags, this launch can give a fairly complete coverage for tracking all marketing events from clients with minimal to no retagging.\n\nOne caveat is that unlike previous launches, Phase 3 is a google3/rebuild only launch which means GA data need to be ingested and transformed on the new platform (it includes both event and reference data from GA).",
          launchDate: 1480492800000,
          alphaDate: 1475222400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: "[360] Suite Home"
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ],
      },
      {
        launchId: "GAP004",
        lastUpdated: 1487250288448,
        details: {
          name: "Cross-device Remarketing",
          description: "At a high level, this launch allows us to join the GA customer-provided User-ID with DoubleClick to provide the same features that are available for GA customers in their non User-ID data views. This includes GDN Remarketing and Audience Demographics & Interests Reporting. \n\nFor example, a user visits Nike.com on their app, then visits Nike.com on their desktop. Nike uses Google Analytics with the UID feature and has a remarketing list for users with visits>1. In the current model, the user would not be added to the remarketing list upon their desktop visit. In the future model, the user's most recent DCLK cookie will be added to the list when their desktop visit occurs.\n\nAll features will still be subject to thresholding and opt-outs, which will work as before.\n\nMore info:\nUser ID feature: https://support.google.com/analytics/answer/3123662?hl=en\nRemarketing with Google Analytics: https://support.google.com/analytics/answer/2611268?hl=en\nAudience Demographics & Interests Reporting: https://support.google.com/analytics/answer/2799357?hl=en",
          launchDate: 1487145600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Admin & Config"
          }
        ]
      },
      {
        launchId: "GDS018",
        lastUpdated: 1475536787820,
        details: {
          name: "Global Launch Phase 2",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Ecommerce"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS207",
        lastUpdated: 1475536788367,
        details: {
          name: "Search Console: Automatic Linking flow GA [on hold]",
          description: "",
          launchDate: 1498809600000,
          betaDate: 1498809600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS225",
        lastUpdated: 1475536796493,
        details: {
          name: "Lifetime Value Report (LTV) in Web Properties",
          description: "There's a Lifetime Value Report in App Views right now.\nWe're launching it in Web Views.",
          launchDate: 1477900800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Firebase",
            feature: "Firebase Analytics"
          },
          {
            productFamily: "Analytics",
            product: "Firebase",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "SUI017",
        lastUpdated: 1475536771473,
        details: {
          name: "[360] SSO (non-GfW) integration for 360 Suite",
          description: "Single Sign-On (aka App-less Dasher) support for non-GfW customers.",
          launchDate: 1490947200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Ecommerce"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP126",
        lastUpdated: 1475536793450,
        details: {
          name: "Analysis Report",
          description: "",
          launchDate: 1477900800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: "[360] Suite Home"
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS013",
        lastUpdated: 1475536785553,
        details: {
          name: "Sheets integration",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP023",
        lastUpdated: 1475536779839,
        details: {
          name: "[360] Faster Intra-Day Processing Pipeline (RT 2.0)",
          description: "Realtime2.0 brings Real Time report freshness to standard reports within Google Analytics for premium accounts that have migrated to Universal Analytics.",
          launchDate: 0,
          alphaDate: 1470038400000,
          betaDate: 1475568000000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Content & Publishers"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS016",
        lastUpdated: 1487250288407,
        details: {
          name: "User ID in Reporting and Segmentation",
          description: "**Incremental Change: Allow surfacing of overridden UserID in views that use UID override**\n\nSummary: Allow GA users to generate lead lists of their users from reporting, by surfacing the visitor ID / user id directly.\n\nUser Story:\nGolf360 wants to email all the users who went to their shopping cart but never checked out last month. They can develop a segment for users who abandoned the shopping cart, and use the getUsers function to export a list of all the users who met this criteria. In their GA implementation, they set up their email signups to store the GA user ID and the email address when they get new signups, so they can map this list of users back to their email list to send out a targeted email offering 15% off and free shipping.\n\nNotes: \n- Client ID is different from User ID.  User ID is supplied by the customer for it's identified users, and Client ID is defined by Google Analytics on the first interaction with the business.\n\n- User Explorer will be the first feature to display User ID: https://ariane.googleplex.com/launch/130596",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Audience & Remarketing"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAO011",
        lastUpdated: 1475536793552,
        details: {
          name: "Optimize: Personalization",
          description: "",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS223",
        lastUpdated: 1476981697382,
        details: {
          name: "[NDA Whitelist] Google Analytics + Constellation Graph Integration for Measurement (Cross Device)",
          description: "This whitelist launch focuses on utilizing Constellation graph support within Google Analytics for measurement:\n\n- Use constellation with Google Analytics data to surface existing reports including Cross Device Reports\n- Use constellation with Google Analytics data to export conversion data to AdWords\n\nDesign doc: https://docs.google.com/document/d/1R4HdKll_TmpcTRMfclxTB62BXB0Mpn8vYytZ-r31GFM/edit#\n\nStrategy doc: https://docs.google.com/a/google.com/document/d/11mYw0m08UTyzjpD17V6gCqishhTlTRIDE00kqc9zDa0/edit?usp=drive_web",
          launchDate: 1475481600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Content & Publishers"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS025",
        lastUpdated: 1475536787952,
        details: {
          name: "Templates phase 2 (automation?)",
          description: "",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1504166400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAT001",
        lastUpdated: 1475536798999,
        details: {
          name: "Suite ICS",
          description: "",
          launchDate: 1476345600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: "Tagging"
          },
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "ADO026",
        lastUpdated: 1476981697788,
        details: {
          name: "Attribution 360 ('Starfleet' Adometry rebuild) - Alpha Version",
          description: "Adometry rebuild aka Starfleet is planned to be launched to a limited set of 10-15 clients at the end of Q3. It will have the following functionality.\n\n1. Attribution Performance report fed by data from business continuity\n2. Several visualizations\n3. Report builder with ability to schedule reports\n4. Ability to save customizations to reports\n\nWe had earlier planned to also include Lego integration and API as part of the launch, but have trimmed functionality to ensure we launch in Q4. There will be separate Ariane entries for these when we are ready to launch these features. \n5. Integration of Adometry data into Lego\n6. Preliminary launch of API for clients",
          launchDate: 1475308800000,
          alphaDate: 1447920000000,
          betaDate: 1470038400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: "Digital Attribution"
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GCS001",
        lastUpdated: 1476981699029,
        details: {
          name: "Google Surveys 360 integration with 360 Suite",
          description: "Google Customer Surveys (GCS) is a research platform is capable of solving many business needs across a broad spectrum of research and decision-making use-cases. Many (but not all) such use-cases fall under the purview of the digital and brand marketer -- whose primary goal is to measurably drive revenue through marketing-based initiatives. Google is strategically investing in providing better tools to help the digital marketer do their job, specifically in the form of the Google Analytics 360 Suite that launched in June 2016. \n\nSurvey-based research is a powerful tool in the quiver of tools the marketer can employ to attribute marketing to revenue growth and uptick in brand perception, and to reach the voice of their customer. Indeed in just over a year of selling GCS to the F1000 space, we have numerous major brands using GCS to help them do exactly this -- and the feedback so far has been very positive and the business continues to grow. \n\nThe GCS go-to-market has historically spanned a broad spectrum of businesses, with varying needs, sophistications and expectations on in-house vs outsourced research. While we’ve seen success across each of these facets, we’ve recently decided that we can optimize growth and adoption if we narrow our focus by aligning our business to the Google Analytics 360 Suite -- and do so by providing a research platform that is built for the marketer, to enable them to primarily measure the performance and attribution of their brand and secondarily conduct light-weight research against their target audiences.\n\nThe GCS-Suite integration is comprised of backed data integration with Enterprise Service (ES) in the form of a users-accounts-orgs API (for user and org management), sending usage data and monetization formulas for b3 automated Suite billing, and UI common components (header, product overview card).",
          launchDate: 1476777600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Acquisition & Attribution"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS038",
        lastUpdated: 1475536788232,
        details: {
          name: "Connector: Prototype Universal Connector / Custom connectors via GfW Apps - create 'own' connectors; (build UI + 2 connectors) (w/Dev Rel & Switchboard)",
          description: "",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1483084800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      }
    ];
  }
};

/**
 * Angular module for the component.
 * @type {!angular.Module}
 */
lt.root.reporting.reportingModule =
    angular.module('lt.root.reporting.reportingModule', [
      lt.root.reporting.timeline.timelineModule.name
    ])
    .component('ltReporting', {
      templateUrl: './scripts/reporting/reporting.html',
      controller: ReportingController,
      bindings: {}
    });

//# sourceMappingURL=app.js.map