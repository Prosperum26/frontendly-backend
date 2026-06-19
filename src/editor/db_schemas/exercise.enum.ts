export enum JsxRestriction {
  BANNED_ALL_HOOKS = 'banned:hooks',
  BANNED_MAP = 'banned:map',
  BANNED_CREATE_ELEMENT = 'banned:create-element',
  BANNED_INLINE_STYLE = 'banned-attr:style',
  BANNED_TERNARY = 'banned:ternary', // -> ko cho xài toán tử 3 ngôi
  BANNED_LOGICAL_AND = 'banned:logical-and', // -> ko cho xài &&
  BANNED_IF_STATEMENT = 'banned:if', // ko xài if
  BANNED_PROPS_DESTRUCTURING = 'banned:destructuring',
  REQUIRED_PROPS_DESTRUCTURING = 'required:destructuring',
  BANNED_USE_EFFECT = 'banned:useeffect',
  BANNED_USE_REF = 'banned:useref',
  BANNED_USE_STATE = 'banned:usestate',
}

// xài cho việc đưa vào config
export const JsxRestrictionAstMap: Record<
  string,
  { selector: string; defaultMessage: string }
> = {
  [JsxRestriction.BANNED_ALL_HOOKS]: {
    selector: 'CallExpression[callee.name=/^use[A-Z]/]',
    defaultMessage: 'You must not use any hook in this practice.',
  },
  [JsxRestriction.BANNED_USE_EFFECT]: {
    selector: 'CallExpression[callee.name="useEffect"]',
    defaultMessage: 'You must not use useEffect in this practice.',
  },
  [JsxRestriction.BANNED_USE_STATE]: {
    selector: 'CallExpression[callee.name="useState"]',
    defaultMessage: 'You must not use useState in this practice.',
  },
  [JsxRestriction.BANNED_USE_REF]: {
    selector: 'CallExpression[callee.name="useRef"]',
    defaultMessage: 'You must not use useRef in this practice.',
  },
  [JsxRestriction.BANNED_MAP]: {
    selector: 'CallExpression[callee.property.name="map"]',
    defaultMessage: 'You must not use ".map" to render in this practice',
  },
  [JsxRestriction.BANNED_CREATE_ELEMENT]: {
    selector: 'CallExpression[callee.property.name="createElement"]',
    defaultMessage:
      'Please using JSX syntax instead of "React.createElement" in this practice.',
  },
  [JsxRestriction.BANNED_INLINE_STYLE]: {
    selector: 'JSXAttribute[name.name="style"]',
    defaultMessage:
      'You must not use inline attribute "style" in this practice.',
  },
  [JsxRestriction.BANNED_TERNARY]: {
    selector: 'ConditionalExpression',
    defaultMessage: 'You must not use conditional expression in this practice',
  },
  [JsxRestriction.BANNED_LOGICAL_AND]: {
    selector: 'LogicalExpression[operator="&&"]',
    defaultMessage: 'You must not use AND operation "&&" in this practice.',
  },
  [JsxRestriction.BANNED_IF_STATEMENT]: {
    selector: 'IfStatement',
    defaultMessage: 'You must not use if/else statement in this practice',
  },
  [JsxRestriction.BANNED_PROPS_DESTRUCTURING]: {
    selector:
      'ArrowFunctionExpression > ObjectPattern, FunctionDeclaration > ObjectPattern',
    defaultMessage: 'You must not destruct the props in this practice',
  },
  [JsxRestriction.REQUIRED_PROPS_DESTRUCTURING]: {
    selector: 'Identifier[name="props"]',
    defaultMessage: 'You must destruct the props in this practice.',
  },
};

export enum ExerciseTag {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  CHALLENGE = 'challenge',
  HTML = 'html',
  CSS = 'css',
  JS = 'js',
  REACTJS = 'reactjs',
  STATE_MANAGEMENT = 'state-management',
  PROPS_SHARING = 'props-sharing',
  CONDITIONAL_RENDERING = 'conditional-rendering',
  LISTS_KEYS = 'lists-keys',
  CUSTOM_HOOKS = 'custom-hooks',
}
