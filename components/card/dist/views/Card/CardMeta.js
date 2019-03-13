'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lib = require('../../lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A card can contain content metadata.
 */
function CardMeta(props) {
  var children = props.children,
      className = props.className,
      content = props.content,
      textAlign = props.textAlign;

  var classes = (0, _classnames2.default)((0, _lib.useTextAlignProp)(textAlign), 'meta', className);
  var rest = (0, _lib.getUnhandledProps)(CardMeta, props);
  var ElementType = (0, _lib.getElementType)(CardMeta, props);

  return _react2.default.createElement(
    ElementType,
    Object.assign({}, rest, { className: classes }),
    _lib.childrenUtils.isNil(children) ? content : children
  );
}

CardMeta.propTypes = {
  /** An element type to render as (string or function). */
  as: _lib.customPropTypes.as,

  /** Primary content. */
  children: _propTypes2.default.node,

  /** Additional classes. */
  className: _propTypes2.default.string,

  /** Shorthand for primary content. */
  content: _lib.customPropTypes.contentShorthand,

  /** A card meta can adjust its text alignment. */
  textAlign: _propTypes2.default.oneOf(_lodash2.default.without(_lib.SUI.TEXT_ALIGNMENTS, 'justified'))
};

exports.default = CardMeta;

//# sourceMappingURL=CardMeta.js.map