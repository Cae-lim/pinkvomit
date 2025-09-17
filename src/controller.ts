export function resultMessage(message: string, name: string, oob = false) {
  return `<div ${oob ? `hx-swap-oob='#${name}-result'` : `id='${name}-result'`}>${message}</div>`
}

export type ValidationOptions = {
  swapOutOfBounds?: boolean,
  alwaysCallNext?: boolean,
  validateUnique?: boolean,
}

// a non secure way to check the use of validation functions before inserting into database
// do not rely on this for security, it is strictly a best practice check
export type ValidatedInput = {
  value: any,
  validated: boolean
}

export function unsafeCheckValidation<T>(input: object): T {
  const err = new Error("Validate inputs before use");
  if (!IsValidatedInput(input)) throw err;

  const { value, validated } = input as ValidatedInput;
  if (!validated) {
    throw err;
  }

  return value;
}

export function IsValidatedInput(object: object): object is ValidatedInput {
  return (
    "value" in object &&
    "validated" in object &&
    typeof object.validated === "boolean"
  )
}
