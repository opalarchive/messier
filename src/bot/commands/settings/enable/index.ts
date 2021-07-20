import Disable from "../disable";

export default class Enable extends Disable {
  disable = false;
  description =
    "This allows the enabling of commands or categories (other than ones that can never be disabled).";
}
