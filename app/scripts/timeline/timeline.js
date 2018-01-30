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



















