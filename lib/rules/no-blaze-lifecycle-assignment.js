/**
 * @fileoverview Prevent deprecated template lifecycle callback assignments.
 * @author Dominik Ferber
 */

import {getExecutors} from '../util'
import {NON_METEOR} from '../util/environment'

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

module.exports = getMeta => context => {

  const {env} = getMeta(context)

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /*
   * Check if name is a forbidden property (rendered, created, destroyed)
   * @param {String} name The name of the property
   * @returns {Boolean} True if name is forbidden.
   */
  function isForbidden (name) {
    return ['created', 'rendered', 'destroyed'].indexOf(name) !== -1
  }

  function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  function reportError (node, propertyName) {
    context.report(
      node,
      'Template callback assignment with'
      + ' `' + propertyName + '` '
      + 'is deprecated.'
      + ' Use `on' + capitalizeFirstLetter(propertyName) + '` instead'
    )
  }


  // ---------------------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------------------

  if (env === NON_METEOR) {
    return {}
  }

  return {

    AssignmentExpression: (node) => {

      const executors = getExecutors(env, context.getAncestors())
      if (!executors.has('browser') && !executors.has('cordova')) {
        return
      }

      if (node.operator === '=') {

        const lhs = node.left
        if (
          lhs.type === 'MemberExpression' && !lhs.computed &&
          lhs.object.type === 'MemberExpression' &&
          lhs.object.object.type === 'Identifier' && lhs.object.object.name === 'Template' &&
          lhs.property.type === 'Identifier' && isForbidden(lhs.property.name)
        ) {
          reportError(node, lhs.property.name)
        }

      }

    }

  }
}

module.exports.schema = []
