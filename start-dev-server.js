#! /usr/bin/env node

const child_process = require('child_process');
const path = require('path');
const chalk = require('chalk');
const { Gaze } = require('gaze');
const pwd = process.cwd();
const log = console.log;

function rm() {
    log(chalk.yellow('rm -rf out/'));
    child_process.execSync(`rm -rf ${path.join(pwd, 'out/')}`);
}

function compile() {
    try {
        log(chalk.yellow('compiling.'));
        child_process.execSync('tsc');
    } catch (err) {
        log(chalk.red(err));
    }
}

function runCode() {
    log(chalk.blue('start nodemon'));
    const nodemonCp = child_process.exec(
        `nodemon ${path.join(pwd, 'out/ws-server')}`
    );
    nodemonCp.on('message', message => {
        log(chalk.green(message));
    });
    nodemonCp.on('error', function(err) {
        log(chalk.red(err));
    });
}

rm();
compile();
runCode();

const gaze = new Gaze(`${path.join(pwd, 'src/**/*.ts')}`);

const delayCompile = delay(function() {
    compile();
}, 800);

gaze.on('all', (e, f) => {
    delayCompile();
});

function delay(fn, time) {
    var t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(function() {
            fn(...args);
        }, time);
    };
}
