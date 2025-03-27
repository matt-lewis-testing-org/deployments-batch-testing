/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 190:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 66:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 89:
/***/ ((module) => {

module.exports = eval("require")("chrono-node");


/***/ }),

/***/ 941:
/***/ ((module) => {

module.exports = eval("require")("date-fns");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   run: () => (/* binding */ run)
/* harmony export */ });
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(190);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nccwpck_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(66);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__nccwpck_require__.n(_actions_github__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var chrono_node__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(89);
/* harmony import */ var chrono_node__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__nccwpck_require__.n(chrono_node__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_3__ = __nccwpck_require__(941);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__nccwpck_require__.n(date_fns__WEBPACK_IMPORTED_MODULE_3__);





const core = __nccwpck_require__(190);

const getInputs = () => {
  const result = {};
  result.owner = _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.owner;
  result.repo = _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.repo;
  result.token = core.getInput('token');
  return result;
};

const run = async () => {
  const inputs = getInputs();
  const ownerRepo = {
    owner: inputs.owner,
    repo: inputs.repo,
  };
  if (!inputs.token) return (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setFailed)('`github-token` input is required');
  const octokit = (0,_actions_github__WEBPACK_IMPORTED_MODULE_1__.getOctokit)(inputs.token);
  const variablePrefix = '_SCHEDULE';
  const workflows = (await octokit.rest.actions.listRepoWorkflows(ownerRepo)).data.workflows;
  const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: inputs.timezone || 'UTC',
  });

  const getSchedules = async () => {
    const { data: { variables } } = await octokit.rest.actions.listRepoVariables(ownerRepo);
    if (!variables) return [];
    console.log('**Variables: ', variables);
    const schedules = variables
      .filter((variable) => variable.name.startsWith(variablePrefix))
      .map((variable) => {
        const parts = variable.name.split('_');
        const valParts = variable.value.split(/,(.*)/s);
        const workflowInputs = valParts[1] && valParts[1].trim().length > 0 ? JSON.parse(valParts[1]) : undefined;
        const inputsIgnore = inputs.inputsIgnore?.split(',').map((key) => key.trim());
        inputsIgnore?.forEach((key) => {
          if (workflowInputs?.[key]) delete workflowInputs[key];
        });
        return {
          variableName: variable.name,
          workflow_id: parts[2],
          date: new Date(+parts[3]),
          ref: valParts[0],
          inputs: workflowInputs,
        };
      });
    return schedules;
  };

  const summaryWrite = async () => {
    const schedules = await getSchedules();
    const _summary = _actions_core__WEBPACK_IMPORTED_MODULE_0__.summary.addHeading(`Additional Info - Scheduled Workflows`);
    if (schedules.length) {
      _summary.addTable([
        [
          { data: 'Workflow', header: true },
          { data: `Scheduled Date (${inputs.timezone})`, header: true },
          { data: 'Ref', header: true },
          { data: 'Path', header: true }
        ],
        ...schedules
          .sort((a, b) => a.date.valueOf() - b.date.valueOf())
          .map((schedule) => {
            const _workflow = workflows.find((workflow) => workflow.id === +schedule.workflow_id);
            return [
              _workflow?.name || schedule.workflow_id,
              dateTimeFormatter.format(schedule.date),
              schedule.ref,
              _workflow?.path || 'unknown'
            ];
          })
      ]);
    } else {
      _summary.addRaw('No scheduled workflows found');
    }
    return _summary.write();
  };

  await getSchedules();
};

run();

})();

module.exports = __webpack_exports__;
/******/ })()
;