
class TaxoService {

  /**
   * @constructor
   * @ngInject
   */
  constructor() {}

  /**
   * Retrieves a taxonomy segments array.
   * @param {!Array<!lt.model.ProductCategory>} categoryList ProductCategory
   *     messages as provided via deserialized JSPB.
   * @param {string=} opt_separator Optional separator to use between each
   *     taxonomy segment.
   * @return {!Array<string>} Taxonomy path, with separators between each
   *     segment if a separtor was provided.
   */
  getTaxonomy(categoryList, opt_separator) {
    var taxoSegments = [];

    for (var i = 0, item; item = categoryList[i]; i++) {
      if (!taxoSegments[0] && item.productFamily) {
        taxoSegments[0] = item.productFamily;
      }
      if (!taxoSegments[1] && item.product) {
        taxoSegments[1] = item.product;
      }
      if (!taxoSegments[2] && item.feature) {
        taxoSegments[2] = item.feature;
        // There is no way for this segment to be filled in without all prior
        // segments also being filled in.
        break;
      }
    }
    if (opt_separator) {
      for (i = 0; i < taxoSegments.length; i++) {
        if (i % 2 != 0) {
          taxoSegments.splice(i, 0, opt_separator);
        }
      }
    }
    return taxoSegments;
  }

  /**
   * Retrieves a taxonomy path as a string.
   * @param {!Array<!lt.model.ProductCategory>} categoryList ProductCategory
   *     messages as provided via deserialized JSPB.
   * @param {string=} opt_separator Optional separator to use between each
   *     taxonomy segment.
   * @return {string} Taxonomy path, with separators between each
   *     segment if a separtor was provided.
   */
  getTaxonomyPath(categoryList, opt_separator) {
    return this.getTaxonomy(categoryList, opt_separator).join(' ');
  }
};

lt.root.reporting.taxo.taxoServiceModule =
  angular.module('lt.root.reporting.taxo.taxoServiceModule', [])
      .service('taxo', TaxoService);
