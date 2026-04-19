import './multi-view-app.js'
import {
  applyGlobalTokenStyles,
  installGlobalTokenStyles,
} from './ui-style-module.js'

if (typeof document !== 'undefined') {
  applyGlobalTokenStyles()
  installGlobalTokenStyles()
}
