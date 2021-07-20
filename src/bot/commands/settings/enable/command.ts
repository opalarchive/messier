import DisableCommand from "../disable/command";

export default class EnableCommand extends DisableCommand {
  disable = false;
  description =
    "This allows the enabling of commands (other than ones that can never be disabled).";
}
