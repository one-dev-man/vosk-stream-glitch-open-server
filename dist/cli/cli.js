"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _array_dictionary, _dictionary, _label, _help, _callback, _env_env, _argv_env, _commands, _startup_message, _prefix, _suffix, _history, _h_i, _tmp_line, _cursor, _line, _closed, _firstCommand, _print_compiled_prompt, _live_stdin_data_callback;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = exports.Command = exports.Environment = void 0;
const readline = __importStar(require("readline"));
const listener_class_1 = require("../utils/listener.class");
const arraysutil_1 = __importDefault(require("../utils/arraysutil"));
const jsontypechecker_1 = require("../utils/jsontypechecker");
const colors_1 = require("./colors");
const vkb_1 = require("./vkb");
// DEFAULT COMMANDS :
const DEFAULT_COMMANDS = {
    exit: {
        label: "exit",
        help: "exit - Exit the program.",
        callback: async (label, args, cli) => {
            process.exit(0);
            // return true;
        }
    },
    help: {
        label: "help",
        help: "[<command>] - Show commands usage or specific command usage.",
        callback: async (label, args, cli) => {
            if (args.length < 1) {
                let cmds = cli.getCommands();
                console["__log"]("Commands usage :");
                for (let i = 0; i < cmds.length; ++i) {
                    let cmd = cmds[i];
                    console["__log"](" - " + cmd.label + " : " + cmd.help);
                }
            }
            else {
                if (cli.hasCommand(args[0])) {
                    let cmd = cli.getCommand(args[0]);
                    console["__log"]("Command usage :");
                    console["__log"](" - " + cmd.label + " : " + cmd.help);
                }
                else
                    console["__log"]("Command \"" + args[0] + "\" not found.");
            }
        }
    },
};
// DEFAULT_COMMANDS["hist"] = {
//     label: ".hist",
//     callback: DEFAULT_COMMANDS.history.callback
// }
// DEFAULT_COMMANDS["prev"] = {
//     label: ".prev",
//     callback: DEFAULT_COMMANDS.previous.callback
// }
//
class Environment {
    constructor(...toConvert_parts) {
        //
        this.ARG_FIRST_COMMAND_LABEL_KEY = "AFCL_" + Date.now();
        _array_dictionary.set(this, new Array());
        _dictionary.set(this, {});
        this.reinit(...toConvert_parts);
    }
    static getFragmentedArgumentValue(_array, _i, start = 0) {
        let r = null;
        let i = _i;
        if (i < _array.length) {
            let symbol2pair = {
                '\"': ['\"', '\"'],
                "'": ["'", "'"],
                "(": ["(", ")"],
                "[": ["[", "]"],
                "{": ["{", "}"],
                "*": ["*", "*"],
            };
            let a0 = _array[i].substring(start, _array[i].length);
            let symbol = null;
            Object.keys(symbol2pair).forEach((_symbol) => {
                symbol = a0.startsWith(_symbol) ? _symbol : symbol;
            });
            if (typeof symbol == "string") {
                symbol = symbol;
                r = a0.substring(symbol.length, a0.length);
                for (++i; i < _array.length; ++i) {
                    r += _array[i];
                    if (_array[i].endsWith(symbol2pair[symbol][1])) {
                        r = r.substring(0, r.length - symbol2pair[symbol][1].length);
                        break;
                    }
                }
            }
            else {
                r = a0;
            }
        }
        return { i: i, content: r };
    }
    //
    reinit(...toConvert_parts) {
        let toConvert = new Array();
        toConvert_parts.forEach((toConvert_part) => {
            if (toConvert_part instanceof Object && !(toConvert_part instanceof Array)) {
                Object.keys(toConvert_part).forEach((key) => {
                    typeof toConvert_part[key] == "string" ? __classPrivateFieldGet(this, _dictionary)[key] = jsontypechecker_1.JsonTypeChecker.instantiate(toConvert_part[key]) : null;
                });
            }
            else if (toConvert_part instanceof Array) {
                toConvert_part.forEach(p => {
                    toConvert.push(p);
                });
            }
        });
        for (let i = 0; i < toConvert.length; ++i) {
            let p = toConvert[i];
            if (typeof p == "string") {
                let arg_key = null;
                let arg_value = null;
                if (p.startsWith("-")) {
                    p = arg_key = p.startsWith("--") ? p.substring(2, p.length) : p.startsWith("-") ? p.substring(1, p.length) : p;
                }
                let p2 = p.split("=");
                arg_key = p2.length > 1 ? p2[0] : arg_key;
                let start = 0;
                arg_key ? p2.length <= 1 ? i + 1 < toConvert.length ? !toConvert[i + 1].startsWith("-") ? ++i : i : i : start = toConvert[i].substring(0, toConvert[i].indexOf("=") + 1).length : i;
                let f_arg_v_r = Environment.getFragmentedArgumentValue(toConvert, i, start);
                arg_value = f_arg_v_r.content ? jsontypechecker_1.JsonTypeChecker.instantiate(f_arg_v_r.content) : true;
                arg_key ? __classPrivateFieldGet(this, _dictionary)[arg_key] = arg_value : !__classPrivateFieldGet(this, _dictionary)[this.ARG_FIRST_COMMAND_LABEL_KEY] ? __classPrivateFieldGet(this, _dictionary)[this.ARG_FIRST_COMMAND_LABEL_KEY] = p : __classPrivateFieldGet(this, _array_dictionary).push(arg_value);
                i = f_arg_v_r.i;
            }
        }
    }
    //
    get(key) {
        if (!key) {
            let r = __classPrivateFieldGet(this, _array_dictionary);
            Object.keys(__classPrivateFieldGet(this, _dictionary)).forEach(k => {
                r[k] = __classPrivateFieldGet(this, _dictionary)[k];
            });
            return r;
        }
        return typeof key == "string" ? __classPrivateFieldGet(this, _dictionary)[key] : __classPrivateFieldGet(this, _array_dictionary)[key];
    }
    set(key, value) {
        if (typeof key == "string") {
            __classPrivateFieldGet(this, _dictionary)[key] = value;
        }
        else {
            __classPrivateFieldGet(this, _array_dictionary)[key] = value;
        }
    }
    remove(key, value) {
        if (typeof key == "string") {
            if (this.has(key))
                delete __classPrivateFieldGet(this, _dictionary)[key];
        }
        else {
            __classPrivateFieldSet(this, _array_dictionary, arraysutil_1.default.removeFromArray(__classPrivateFieldGet(this, _array_dictionary), key));
        }
    }
    has(key) {
        return this.get(key);
    }
    keys() {
        return Object.keys(__classPrivateFieldGet(this, _dictionary));
    }
    indexes() {
        return __classPrivateFieldGet(this, _array_dictionary).length;
    }
    get firstCommandLabel() { return __classPrivateFieldGet(this, _dictionary)[this.ARG_FIRST_COMMAND_LABEL_KEY]; }
    //
    parse(content) {
        let r = content;
        this.keys().forEach((key) => {
            r = content.replace(new RegExp("(\$\{" + key + "\})|(\%" + key + "\%)"), this.get(key)?.toString() || "");
        });
        return r;
    }
}
exports.Environment = Environment;
_array_dictionary = new WeakMap(), _dictionary = new WeakMap();
class Command {
    constructor(options) {
        //
        _label.set(this, void 0);
        _help.set(this, void 0);
        _callback.set(this, void 0);
        this.cli = null;
        __classPrivateFieldSet(this, _label, options.label);
        __classPrivateFieldSet(this, _help, options.help || "");
        __classPrivateFieldSet(this, _callback, options.callback);
    }
    static parseRawInput(input) {
        let r = {
            label: null,
            args: []
        };
        let input_args = input.split(" ");
        let cmd_env = new Environment(input_args);
        r.label = cmd_env.firstCommandLabel + "";
        r.args = cmd_env.get();
        return r;
    }
    //
    get label() { return __classPrivateFieldGet(this, _label); }
    get help() { return __classPrivateFieldGet(this, _help); }
    get callback() { return __classPrivateFieldGet(this, _callback); }
}
exports.Command = Command;
_label = new WeakMap(), _help = new WeakMap(), _callback = new WeakMap();
//
class CLI extends listener_class_1.Listener {
    constructor(options) {
        super();
        _env_env.set(this, void 0);
        _argv_env.set(this, void 0);
        _commands.set(this, void 0);
        _startup_message.set(this, "");
        _prefix.set(this, void 0);
        _suffix.set(this, void 0);
        _history.set(this, new Array());
        _h_i.set(this, -1);
        _tmp_line.set(this, "");
        _cursor.set(this, 0);
        _line.set(this, "");
        _closed.set(this, true);
        _firstCommand.set(this, null);
        _print_compiled_prompt.set(this, () => {
            let compiled_line = __classPrivateFieldGet(this, _line);
            let on_cursor_pos = compiled_line.substring(__classPrivateFieldGet(this, _cursor), __classPrivateFieldGet(this, _cursor) + 1);
            on_cursor_pos = on_cursor_pos.length > 0 ? on_cursor_pos : " ";
            compiled_line = compiled_line.substring(0, __classPrivateFieldGet(this, _cursor)) + "§f§n§l" + on_cursor_pos + "§r" + compiled_line.substring(__classPrivateFieldGet(this, _cursor) + 1, compiled_line.length);
            let t = __classPrivateFieldGet(this, _cursor);
            let compiled_prompt = colors_1.color("\r" + __classPrivateFieldGet(this, _prefix) + "" + __classPrivateFieldGet(this, _suffix) + "" + compiled_line + "");
            this.output["__write"]("\x1b[2K");
            this.output["__write"](compiled_prompt);
            this.output["__write"]("\r");
        });
        _live_stdin_data_callback.set(this, async (d, key) => {
            if (!__classPrivateFieldGet(this, _closed)) {
                if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.RETURN)) {
                    let input = __classPrivateFieldGet(this, _line);
                    let cmd_info = Command.parseRawInput(input);
                    this.output["__write"]("\n");
                    if (typeof cmd_info.label == "string" && cmd_info.label.length > 0) {
                        input != this.history[this.history.length - 1] ? __classPrivateFieldGet(this, _history).unshift(input) : null;
                        this.history.length > 128 ? __classPrivateFieldGet(this, _history).pop() : null;
                        if (this.hasCommand(cmd_info.label))
                            await this.runCommand(cmd_info.label, cmd_info.args);
                        else
                            this.output.write("Unknow command.\n");
                        this.output.write("\n");
                        __classPrivateFieldSet(this, _line, "");
                        __classPrivateFieldSet(this, _cursor, 0);
                    }
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.UP)
                    || vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.DOWN)) {
                    if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.UP)) {
                        __classPrivateFieldSet(this, _h_i, __classPrivateFieldGet(this, _h_i) + (__classPrivateFieldGet(this, _h_i) < this.history.length - 1 ? 1 : 0));
                    }
                    else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.DOWN)) {
                        __classPrivateFieldSet(this, _h_i, __classPrivateFieldGet(this, _h_i) + (__classPrivateFieldGet(this, _h_i) > -1 ? -1 : 0));
                    }
                    __classPrivateFieldSet(this, _tmp_line, __classPrivateFieldGet(this, _h_i) == -1 ? __classPrivateFieldGet(this, _line) : __classPrivateFieldGet(this, _tmp_line));
                    __classPrivateFieldSet(this, _line, __classPrivateFieldGet(this, _h_i) == -1 ? __classPrivateFieldGet(this, _tmp_line) : this.history[__classPrivateFieldGet(this, _h_i)]);
                    __classPrivateFieldSet(this, _cursor, 0);
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.LEFT)) {
                    __classPrivateFieldSet(this, _cursor, __classPrivateFieldGet(this, _cursor) + (__classPrivateFieldGet(this, _cursor) > 0 ? -1 : 0));
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.QUICK_LEFT)) {
                    __classPrivateFieldSet(this, _cursor, __classPrivateFieldGet(this, _line).substring(0, __classPrivateFieldGet(this, _cursor)).lastIndexOf(" "));
                    __classPrivateFieldGet(this, _cursor) < 0 ? __classPrivateFieldSet(this, _cursor, 0) : null;
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.RIGHT)) {
                    __classPrivateFieldSet(this, _cursor, __classPrivateFieldGet(this, _cursor) + (__classPrivateFieldGet(this, _cursor) < __classPrivateFieldGet(this, _line).length ? 1 : 0));
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.QUICK_RIGHT)) {
                    __classPrivateFieldSet(this, _cursor, __classPrivateFieldGet(this, _line).substring(0, __classPrivateFieldGet(this, _cursor) + 1).length + __classPrivateFieldGet(this, _line).substring(__classPrivateFieldGet(this, _cursor) + 1, __classPrivateFieldGet(this, _line).length).indexOf(" "));
                    __classPrivateFieldGet(this, _line).substring(__classPrivateFieldGet(this, _cursor) + 1, __classPrivateFieldGet(this, _line).length).indexOf(" ") < 0 ? __classPrivateFieldSet(this, _cursor, __classPrivateFieldGet(this, _line).length) : null;
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.HOME)) {
                    __classPrivateFieldSet(this, _cursor, 0);
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.END)) {
                    __classPrivateFieldSet(this, _cursor, __classPrivateFieldGet(this, _line).length);
                }
                else if (vkb_1.VirtualKeyBoard.is(key, vkb_1.VirtualKeyBoard.KEYS.INTERACTIONS.TERMINAL.ESCAPE)) {
                    __classPrivateFieldSet(this, _line, "");
                    __classPrivateFieldSet(this, _cursor, 0);
                }
                else if (key.ctrl && key.name == "c") {
                    this.runCommand("exit");
                }
                else {
                    let r = vkb_1.VirtualKeyBoard.parse(__classPrivateFieldGet(this, _line), key, __classPrivateFieldGet(this, _cursor));
                    __classPrivateFieldSet(this, _line, r.line);
                    __classPrivateFieldSet(this, _cursor, r.index);
                }
                __classPrivateFieldGet(this, _print_compiled_prompt).call(this);
            }
        });
        //
        this.log = (...args) => {
            return this.print({ prefix: createLogPrefix("§eLOG"), args: args });
        };
        this.info = (...args) => {
            return this.print({ prefix: createLogPrefix("§9INFO"), args: args });
        };
        this.warn = (...args) => {
            return this.print({ prefix: createLogPrefix("§6WARN"), args: args });
        };
        this.error = (...args) => {
            return this.print({ prefix: createLogPrefix("§4ERROR"), args: args });
        };
        //
        options = options || {};
        options.env = options.env || process.env;
        options.argv = options.argv || process.argv;
        options.prefix = options.prefix || "";
        options.suffix = options.suffix || "> ";
        options.input = options.input || process.stdin;
        options.output = options.output || process.stdout;
        //
        __classPrivateFieldSet(this, _env_env, new Environment(options.env));
        __classPrivateFieldSet(this, _argv_env, new Environment(options.argv));
        __classPrivateFieldSet(this, _commands, new Array());
        __classPrivateFieldSet(this, _prefix, options.prefix);
        __classPrivateFieldSet(this, _suffix, options.suffix);
        this.input = options.input;
        this.output = options.output;
        //
        Object.keys(DEFAULT_COMMANDS).forEach(ck => {
            this.registerCommand(DEFAULT_COMMANDS[ck]);
        });
    }
    //
    get env() {
        return __classPrivateFieldGet(this, _env_env);
    }
    get argv() {
        return __classPrivateFieldGet(this, _argv_env);
    }
    get prefix() { return __classPrivateFieldGet(this, _prefix); }
    set prefix(prefix) { __classPrivateFieldSet(this, _prefix, prefix); }
    get suffix() { return __classPrivateFieldGet(this, _suffix); }
    set suffix(suffix) { __classPrivateFieldSet(this, _suffix, suffix); }
    get history() {
        return __classPrivateFieldGet(this, _history);
    }
    get live_stdin_data_callback() {
        return __classPrivateFieldGet(this, _live_stdin_data_callback);
    }
    //
    setStartupMessage(message) {
        __classPrivateFieldSet(this, _startup_message, message);
    }
    //
    setFirstCommand(command) {
        this.removeFistCommand();
        let cmd_constructor = (command instanceof Command ? {
            label: "",
            help: command.help,
            callback: command.callback
        } : command);
        cmd_constructor.label = this.argv.firstCommandLabel;
        __classPrivateFieldSet(this, _firstCommand, new Command(cmd_constructor));
        this.registerCommand(__classPrivateFieldGet(this, _firstCommand));
    }
    removeFistCommand() {
        if (__classPrivateFieldGet(this, _firstCommand)) {
            this.unregisterCommand(__classPrivateFieldGet(this, _firstCommand));
            __classPrivateFieldSet(this, _firstCommand, null);
        }
    }
    async first() {
        this.bindConsole();
        //
        let cmd_info = {
            label: null,
            args: []
        };
        let cmd_env = this.argv;
        cmd_info.args = cmd_env.get();
        cmd_info.label = this.argv.firstCommandLabel;
        if (cmd_env.indexes() > 1) {
            cmd_info.args.shift();
            cmd_info.label = cmd_info.args.shift();
        }
        let success = await this.runCommand(cmd_info.label, cmd_info.args);
        !success ? await this.runCommand("help", cmd_info.label) : null;
        //
        this.unbindConsole();
    }
    live() {
        this.output["__write"] = this.output.write;
        this.output["write"] = (...args) => {
            this.output["__write"]("\x1b[2K");
            this.output["__write"](...args);
            __classPrivateFieldGet(this, _print_compiled_prompt).call(this);
        };
        this.bindConsole();
        readline.emitKeypressEvents(this.input);
        this.input.setRawMode(true);
        this.input.on("keypress", this.live_stdin_data_callback);
        __classPrivateFieldGet(this, _startup_message).length > 0 ? console.log(__classPrivateFieldGet(this, _startup_message)) : null;
        __classPrivateFieldSet(this, _closed, false);
        __classPrivateFieldGet(this, _print_compiled_prompt).call(this);
    }
    close() {
        __classPrivateFieldSet(this, _closed, true);
        this.output["write"] = this.output["__write"];
        this.output["__write"] = undefined;
        this.unbindConsole();
        this.input.removeListener("keypress", this.live_stdin_data_callback);
        this.input.setRawMode(false);
    }
    //
    registerCommand(command) {
        let _command = command instanceof Command ? command : new Command(command);
        this.unregisterCommand(_command.label);
        _command.cli = this;
        __classPrivateFieldGet(this, _commands).push(_command);
        return this;
    }
    unregisterCommand(command) {
        let _command = this.getCommand(command);
        if (_command) {
            __classPrivateFieldSet(this, _commands, arraysutil_1.default.removeFromArray(__classPrivateFieldGet(this, _commands), __classPrivateFieldGet(this, _commands).indexOf(_command)));
        }
        return this;
    }
    getCommand(command) {
        let r = null;
        if (command instanceof Command) {
            r = __classPrivateFieldGet(this, _commands).includes(command) ? __classPrivateFieldGet(this, _commands)[__classPrivateFieldGet(this, _commands).indexOf(command)] : r;
        }
        else {
            for (let i = 0; i < __classPrivateFieldGet(this, _commands).length; ++i) {
                if (__classPrivateFieldGet(this, _commands)[i].label == command) {
                    r = __classPrivateFieldGet(this, _commands)[i];
                    break;
                }
            }
        }
        return r;
    }
    hasCommand(command) {
        return this.getCommand(command) ? true : false;
    }
    getCommands() {
        return __classPrivateFieldGet(this, _commands);
    }
    //
    async runCommand(label, ...args) {
        try {
            return this.hasCommand(label) ? await this.getCommand(label)?.callback(label, args.length == 1 ? args[0] instanceof Array ? args[0] : args : args, this) : false;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    print(options) {
        options.prefix ? options.args.unshift(options.prefix) : null;
        options.suffix ? options.args.push(options.suffix) : null;
        for (let i = 0; i < options.args.length; ++i) {
            typeof options.args[i] == "string" ? options.args[i] = colors_1.color(options.args[i]) : null;
        }
        console["__log"](...options.args);
    }
    bindConsole() {
        let console_methods_to_bind = ["log", "info", "warn", "error"];
        for (let i = 0; i < console_methods_to_bind.length; ++i) {
            console["__" + console_methods_to_bind[i]] = console[console_methods_to_bind[i]];
            console[console_methods_to_bind[i]] = this[console_methods_to_bind[i]];
        }
        return this;
    }
    unbindConsole() {
        let console_methods_to_unbind = ["log", "info", "warn", "error"];
        for (let i = 0; i < console_methods_to_unbind.length; ++i) {
            console[console_methods_to_unbind[i]] = console["__" + console_methods_to_unbind[i]];
            console["__" + console_methods_to_unbind[i]] = undefined;
        }
        return this;
    }
}
exports.CLI = CLI;
_env_env = new WeakMap(), _argv_env = new WeakMap(), _commands = new WeakMap(), _startup_message = new WeakMap(), _prefix = new WeakMap(), _suffix = new WeakMap(), _history = new WeakMap(), _h_i = new WeakMap(), _tmp_line = new WeakMap(), _cursor = new WeakMap(), _line = new WeakMap(), _closed = new WeakMap(), _firstCommand = new WeakMap(), _print_compiled_prompt = new WeakMap(), _live_stdin_data_callback = new WeakMap();
function createLogPrefix(name) {
    let d = new Date();
    return "[" + name + "§r - §8"
        + d.getDate() + "/"
        + (d.getMonth() + 1) + "/"
        + d.getFullYear() + " at "
        + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":"
        + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":"
        + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds() + ","
        + (d.getMilliseconds() < 10 ? "00" : d.getMilliseconds() < 100 ? "0" : "") + d.getMilliseconds()
        + "§r]";
}
//# sourceMappingURL=cli.js.map