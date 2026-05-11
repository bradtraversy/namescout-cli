const useColor = process.stdout.isTTY && !process.env.NO_COLOR && process.argv.indexOf("--no-color") === -1;

function wrap(open, close) {
  return (s) => (useColor ? `\x1b[${open}m${s}\x1b[${close}m` : String(s));
}

export const c = {
  reset: wrap(0, 0),
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
  bgGreen: wrap(42, 49),
  bgRed: wrap(41, 49),
  bgYellow: wrap(43, 49),
};
