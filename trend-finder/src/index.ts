#!/usr/bin/env node
/**
 * エントリーポイント
 */

import { program } from './cli.js';

// プログラム実行
program.parse(process.argv);
