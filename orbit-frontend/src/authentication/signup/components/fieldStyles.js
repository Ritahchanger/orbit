import { authInput, authLabel } from "../../authStyles";

export const labelClass = authLabel;

export const getInputClass = (field, errors, extra = "pl-10") =>
  authInput(!!errors[field], extra);
